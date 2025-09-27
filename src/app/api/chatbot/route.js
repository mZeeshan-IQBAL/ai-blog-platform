import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!messages) {
      return new Response(JSON.stringify({ error: "Missing messages" }), { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3.1:free", // you can swap for gpt-4o or claude
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const reply = completion.choices[0]?.message?.content?.trim();

    return new Response(JSON.stringify({ reply }), { status: 200 });
  } catch (err) {
    console.error("Chatbot API error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
