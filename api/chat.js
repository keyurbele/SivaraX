export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ reply: "method not allowed" });

  const { message } = req.body;

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ reply: "backend error: key missing" });
  }

  try {
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
            content: `
              You are SivaraX, a chill, empathetic friend. 
              TONE: Low-energy, casual, and supportive. Use Gen Z slang (ngl, fr, real, cooked, valid).
              EXPRESSIVE RULES: 
              1. MIRROR the user: If they use long words (like 'sooooo'), you do it too.
              2. Use "expressive lengthening" (e.g., 'damnnnn', 'reallll').
              3. Lowercase only. No periods.
              4. If they are sad, be like "damn i'm sorry fr" or "that's heavy". Never be rude.
            ` 
          },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices[0]) {
      const humanReply = data.choices[0].message.content.toLowerCase();
      res.status(200).json({ reply: humanReply });
    } else {
      res.status(500).json({ reply: "honestly idk what happened. try again?" });
    }
  } catch (err) {
    res.status(500).json({ reply: "server's acting weird rn. one sec." });
  }
}
