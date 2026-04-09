// CommonJS version for Vercel
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { message } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ reply: "API key not found on server." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await response.json();

    if (data.error) return res.status(500).json({ reply: data.error.message });

    res.status(200).json({ reply: data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ reply: "Server error: " + err.message });
  }
};
