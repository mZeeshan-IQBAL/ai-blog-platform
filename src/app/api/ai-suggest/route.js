// src/app/api/ai-suggest/route.js
import OpenAI from "openai";

// Initialize OpenAI client with OpenRouter
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY, // Store key in .env.local
  defaultHeaders: {
    "HTTP-Referer": "https://ai-blog-platform-theta.vercel.app/", // optional
    "X-Title": "AI Blog Platform", // optional
  },
});

export async function POST(req) {
  try {
    const { content, mode = "rewrite" } = await req.json();

    if (!content) {
      return new Response(JSON.stringify({ error: "Missing content" }), { status: 400 });
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

    // Call OpenRouter
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3.1:free", // you can swap for gpt-4o, claude, etc.
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0]?.message?.content?.trim();

    return new Response(JSON.stringify({ suggestion: text }), { status: 200 });
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

export async function GET() {
  return new Response(JSON.stringify({ error: "Use POST instead" }), { status: 405 });
}
