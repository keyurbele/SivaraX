export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ reply: "Method not allowed" });

  const { message } = req.body;

  // 1. Safety Check: Is the key actually there?
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ reply: "Backend Error: GROQ_API_KEY is missing in Vercel Settings." });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "You are SivaraX, a supportive AI." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    // 2. Safety Check: Did Groq return an error (like an invalid key)?
    if (data.error) {
      return res.status(500).json({ reply: "Groq API Error: " + data.error.message });
    }

    // 3. Safety Check: Does the answer actually exist?
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      return res.status(500).json({ reply: "Error: Received an unexpected empty response from the AI." });
    }

  } catch (err) {
    return res.status(500).json({ reply: "Server error: " + err.message });
  }
}
