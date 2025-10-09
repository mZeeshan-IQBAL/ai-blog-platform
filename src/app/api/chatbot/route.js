export const dynamic = "force-dynamic";
import OpenAI from "openai";
import { withSubscription } from "@/lib/subscriptionMiddleware";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function chatbotHandler(req) {
  try {
    // Get user and subscription from middleware
    const user = req.user;
    const subscription = req.subscription;
    const { messages } = await req.json();

    if (!messages) {
      return new Response(JSON.stringify({ error: "Missing messages" }), { status: 400 });
    }

    // Check message limits based on subscription
    const maxMessages = subscription.plan === 'free' ? 10 : 
                       subscription.plan === 'starter' ? 50 : 
                       subscription.plan === 'pro' ? 200 : 1000;
    
    if (messages.length > maxMessages) {
      return new Response(JSON.stringify({ 
        error: `Too many messages. Your ${subscription.plan} plan allows maximum ${maxMessages} messages per conversation.`,
        upgradeRequired: true,
        currentPlan: subscription.plan
      }), { status: 400 });
    }

    // Check daily chat limit
    const dailyChats = subscription.usage?.dailyChats || 0;
    const maxDailyChats = subscription.plan === 'free' ? 5 : 
                         subscription.plan === 'starter' ? 20 : 
                         subscription.plan === 'pro' ? 100 : -1;
    
    if (maxDailyChats !== -1 && dailyChats >= maxDailyChats) {
      return new Response(JSON.stringify({ 
        error: `Daily chat limit reached. Your ${subscription.plan} plan allows ${maxDailyChats} chats per day.`,
        upgradeRequired: true,
        currentPlan: subscription.plan,
        resetTime: "24 hours"
      }), { status: 429 });
    }

    // Available OpenRouter models (verified working as of Oct 2024):
    // - "openai/gpt-4o-mini" (OpenAI option - reliable)
    // - "anthropic/claude-3-haiku" (Anthropic option)
    // - "meta-llama/llama-3.1-8b-instruct:free" (Free option)
    // - "gryphe/mythomist-7b:free" (Free alternative)
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini", // Reliable OpenAI model via OpenRouter
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    
    // Calculate token usage
    const totalInputLength = messages.reduce((sum, m) => sum + m.content.length, 0);
    const estimatedTokens = Math.ceil((totalInputLength + (reply?.length || 0)) * 0.75 / 4);
    
    // Increment token usage (aiCalls is handled by middleware)
    await user.incrementUsage('aiTokens', estimatedTokens);
    
    // Increment daily chat counter (if not exists, initialize)
    if (!user.subscription.usage.dailyChats) {
      user.subscription.usage.dailyChats = 0;
    }
    await user.incrementUsage('dailyChats', 1);

    return new Response(JSON.stringify({ 
      reply,
      tokensUsed: estimatedTokens,
      remainingCalls: user.getRemainingQuota('aiCalls'),
      remainingDailyChats: maxDailyChats === -1 ? 'unlimited' : Math.max(0, maxDailyChats - (dailyChats + 1))
    }), { status: 200 });
  } catch (err) {
    console.error("Chatbot API error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// Apply subscription middleware with AI usage tracking
export const POST = withSubscription(chatbotHandler, {
  requiredAction: 'ai_call',
  requireActiveSubscription: false, // Allow free tier with limits
  incrementUsage: {
    type: 'aiCalls',
    amount: 1
  }
});
