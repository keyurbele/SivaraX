export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ reply: "Method not allowed" });

  const { message } = req.body;

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ reply: "Backend Error: GROQ_API_KEY is missing." });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b", // <--- Current 2026 Production Model
        messages: [
          { role: "system", content: "You are SivaraX, a supportive AI that listens without judgment." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ reply: "Groq API Error: " + data.error.message });
    }

    if (data.choices && data.choices[0] && data.choices[0].message) {
      return res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      return res.status(500).json({ reply: "Error: Received an empty response." });
    }

  } catch (err) {
    return res.status(500).json({ reply: "Server error: " + err.message });
  }
}
