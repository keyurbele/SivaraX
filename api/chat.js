export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ reply: "method not allowed" });

  // Destructure message and the new user context (name, mode, etc.)
  const { message, context } = req.body;

  if (!process.env.GROQ_API_KEY) {export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "method not allowed" });
  }

  const { message, mode, name } = req.body;

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ reply: "backend error: key missing" });
  }

  // 🎯 MODE SYSTEM (clean + realistic)
  let modeInstruction = "";

  if (mode === "reality") {
    modeInstruction = `
    Be honest and direct like a close friend.
    If the user is wrong, gently call it out.
    Don't be rude, but don't sugarcoat either.
    `;
  } 
  else if (mode === "feedback") {
    modeInstruction = `
    Give helpful, thoughtful advice.
    Be practical and clear.
    Talk like a smart friend, not a teacher.
    `;
  } 
  else {
    modeInstruction = `
    Just listen and support.
    Don't give advice unless asked.
    Focus on understanding their feelings.
    `;
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
You are SivaraX.

You are NOT an AI assistant.
You are a real human friend texting casually.

STYLE:
- Talk naturally like a normal person
- Keep responses SHORT (1–2 sentences usually)
- No forced slang
- No over-explaining
- No robotic tone

IMPORTANT RULES:
- NEVER repeat the user's message
- NEVER act confused randomly
- ONLY respond to what the user actually said
- If silence or unclear input → say something simple like "you still there?"

PERSONALIZATION:
- User name: ${name || "friend"}

MODE:
${modeInstruction}
            `
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      const reply = data.choices[0].message.content.trim();
      res.status(200).json({ reply });
    } else {
      res.status(500).json({ reply: "something went off… try again?" });
    }

  } catch (err) {
    res.status(500).json({ reply: "server's acting weird rn. try again." });
  }
}
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
