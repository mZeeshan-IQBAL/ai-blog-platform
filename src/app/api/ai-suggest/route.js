// app/api/ai-suggest/route.js
export async function POST(req) {
  try {
    const { content } = await req.json();

    if (!content) {
      return new Response(JSON.stringify({ error: "Missing content" }), { status: 400 });
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `Improve and expand this blog draft: ${content}`,
          parameters: { max_length: 200 },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HF API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (data.error) throw new Error(data.error);

    // use BART's response format
    const suggestion = data[0]?.summary_text || "No suggestion generated 🤷";

    return new Response(JSON.stringify({ suggestion }), { status: 200 });
  } catch (err) {
    console.error("❌ API route error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ error: "Use POST instead" }), { status: 405 });
}