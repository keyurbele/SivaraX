// /api/chat.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "no message sent" });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ reply: "missing api key" });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "Talk like a normal human. Keep it short."
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content || "no reply";

    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({ reply: "server error" });
  }
}
