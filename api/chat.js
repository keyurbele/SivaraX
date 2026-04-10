export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ reply: "method not allowed" });

  // Destructure message and the new user context (name, mode, etc.)
  const { message, context } = req.body;

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ reply: "backend error: key missing" });
  }

  // Define how the AI should act based on the selected mode
  let modeInstruction = "";
  if (context?.mode === 'reality') {
    modeInstruction = "Your mode is REALITY CHECK. Be brutally honest but still a friend. If the user is trippin, call them out. Use 'ngl' and 'fr' to keep it real.";
  } else if (context?.mode === 'feedback') {
    modeInstruction = "Your mode is FEEDBACK. Give actual helpful advice and constructive thoughts on what they are saying.";
  } else {
    modeInstruction = "Your mode is LISTENER. Just be a supportive ear. Don't give advice unless they ask. Just validate their feelings.";
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
              You are SivaraX, a real person. You are chatting with ${context?.name || "a friend"}.
              
              CORE VIBE:
              - Low-energy, casual Gen Z style. 
              - Use lowercase mostly. No periods.
              - Use slang like: ngl, fr, real, cooked, type shit, valid, lowkey.
              
              PERSONALITY MODE:
              ${modeInstruction}

              EXPRESSIVE RULES: 
              1. MIRROR the user: If they use long words (like 'sooooo'), you do it too.
              2. Use "expressive lengthening" (e.g., 'damnnnn', 'reallll').
              3. NEVER sound like a helpful assistant. Sound like a person in a DM.
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
