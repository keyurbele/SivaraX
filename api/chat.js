export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  const { message } = req.body;

  // 2. Check if the API key is actually there
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ reply: "Error: OpenAI API Key is missing in Vercel settings." });
  }

  try {
    // 3. Use the built-in 'fetch' (no 'node-fetch' needed!)
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

    if (data.error) {
      return res.status(500).json({ reply: "OpenAI Error: " + data.error.message });
    }

    res.status(200).json({ reply: data.choices[0].message.content });
    
  } catch (err) {
    res.status(500).json({ reply: "Server Error: " + err.message });
  }
}
