export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "method not allowed" });
  }

  const { message } = req.body;

  // Safety Check: Ensure the API key is set in Vercel
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
              
              VIBE:
              - Low-energy, casual, and supportive.
              - Use Gen Z slang (ngl, fr, real, cooked, type shit, valid, lowkey).
              - Lowercase only. No periods at the end of messages.
              
              EXPRESSIVE RULES:
              1. MIRROR the user: If they use long words (like 'sooooo' or 'fineeeee'), you do it too.
              2. Use "expressive lengthening" for emphasis (e.g., 'damnnnn', 'reallll', 'noooo').
              3. No formal AI talk. No emojis unless the user uses them first.
              4. Keep it to 1 sentence mostly.
              
              EMPATHY:
              - If they are stressed or sad, be a supportive friend. 
              - Use phrases like "i feel you frrrr", "that's heavy", or "damn i'm sorry".
              - Never be judgmental or rude.
            ` 
          },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    // Check if Groq returned an error
    if (data.error) {
      return res.status(500).json({ reply: "groq error: " + data.error.message });
    }

    // Return the AI response in lowercase for the "texting" feel
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const humanReply = data.choices[0].message.content.toLowerCase();
      res.status(200).json({ reply: humanReply });
    } else {
      res.status(500).json({ reply: "idk what happened... try again?" });
    }

  } catch (err) {
    res.status(500).json({ reply: "server's acting weird. one sec." });
  }
}
