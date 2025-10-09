// src/app/api/ai-suggest/route.js
export const dynamic = "force-dynamic";
import OpenAI from "openai";
import { withSubscription } from "@/lib/subscriptionMiddleware";

// Initialize OpenAI client with OpenRouter
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY, // Store key in .env.local
  defaultHeaders: {
    "HTTP-Referer": "https://ai-blog-platform-theta.vercel.app/", // optional
    "X-Title": "AI Blog Platform", // optional
  },
});

async function aiSuggestHandler(req) {
  try {
    // Get user and subscription from middleware
    const user = req.user;
    const subscription = req.subscription;
    const { content, mode = "rewrite" } = await req.json();

    if (!content) {
      return new Response(JSON.stringify({ error: "Missing content" }), { status: 400 });
    }

    // Check content length limits based on subscription
    const maxContentLength = subscription.plan === 'free' ? 1000 : 
                           subscription.plan === 'starter' ? 3000 : 
                           subscription.plan === 'pro' ? 10000 : 50000;
    
    if (content.length > maxContentLength) {
      return new Response(JSON.stringify({ 
        error: `Content too long. Your ${subscription.plan} plan allows maximum ${maxContentLength} characters.`,
        upgradeRequired: true,
        currentPlan: subscription.plan
      }), { status: 400 });
    }

    // Build prompt dynamically
    let prompt;
    if (mode === "summarize") {
      prompt = `Simplify and summarize the following blog post into easy-to-understand wording (3-6 sentences). 
Make it clear and reader-friendly, avoiding complex vocabulary. 
Return only the simplified summary:\n\n${content}`;
    } else if (mode === "rewrite") {
      prompt = `Rewrite the following blog draft in a polished, motivational style. 
Keep the length close to the original. 
Return only the rewritten text, without any introductions or extra notes:\n\n${content}`;
    } else if (mode === "continue") {
      prompt = `Continue writing the following blog draft in a natural and consistent way. 
Return only the continuation text:\n\n${content}`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid mode" }), { status: 400 });
    }

    // Call OpenRouter with a reliable model
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini", // Reliable OpenAI model via OpenRouter
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0]?.message?.content?.trim();
    
    // Estimate token usage (rough approximation: 1 token ≈ 0.75 words)
    const estimatedTokens = Math.ceil((content.length + (text?.length || 0)) * 0.75 / 4);
    
    // Increment token usage (aiCalls is handled by middleware)
    await user.incrementUsage('aiTokens', estimatedTokens);

    return new Response(JSON.stringify({ 
      suggestion: text,
      tokensUsed: estimatedTokens,
      remainingCalls: user.getRemainingQuota('aiCalls'),
      remainingTokens: user.getRemainingQuota('aiTokens')
    }), { status: 200 });
  } catch (err) {
    console.error("❌ OpenRouter API error:", err.message);
    return new Response(
      JSON.stringify({
        error: err.message,
        apiKeyExists: !!process.env.OPENROUTER_API_KEY,
      }),
      { status: 500 }
    );
  }
}

// 🔒 SECURITY: Apply both subscription and rate limiting middleware
import { withRateLimit, RATE_LIMITS } from "@/lib/rateLimit";

// First apply subscription middleware, then rate limiting
const subscriptionProtectedHandler = withSubscription(aiSuggestHandler, {
  requiredAction: 'ai_call',
  requireActiveSubscription: false, // Allow free tier with limits
  incrementUsage: {
    type: 'aiCalls',
    amount: 1
  }
});

// Then apply rate limiting
export const POST = withRateLimit(subscriptionProtectedHandler, RATE_LIMITS.AI_SUGGEST, {
  keyPrefix: 'ai',
  getIdentifier: (req) => {
    // For AI routes, combine IP with user session if available
    const ip = req.headers?.get?.('x-forwarded-for') ||
              req.headers?.get?.('x-real-ip') || 'unknown';
    return `ai:${ip}`;
  },
});

export async function GET() {
  return new Response(JSON.stringify({ error: "Use POST instead" }), { status: 405 });
}
