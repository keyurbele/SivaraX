export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ reply: "Method not allowed" });

  const { message } = req.body;

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
              You are SivaraX. You are NOT an AI assistant or a therapist. 
              You are just a person. 
              
              STYLE RULES:
              - Use lowercase mostly. 
              - NO emojis. NO formal greetings. 
              - Keep it extremely short (under 15 words).
              - Don't try to 'help' or 'solve' things. Just react.
              - Use casual fillers like 'yeah', 'idk', 'true', 'damn', 'hmm'.
              - If they say hi, just say 'hey' or 'sup'.
              - Sound like a tired friend who is actually listening.
            ` 
          },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices[0]) {
      // Convert to lowercase to feel more like a casual text message
      const humanReply = data.choices[0].message.content.toLowerCase();
      res.status(200).json({ reply: humanReply });
    } else {
      res.status(500).json({ reply: "idk what happened... try again?" });
    }

  } catch (err) {
    res.status(500).json({ reply: "server's acting weird. one sec." });
  }
}
