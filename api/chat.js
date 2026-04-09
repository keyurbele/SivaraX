export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { message } = req.body;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // This model is fast and free
        messages: [
          { 
            role: "system", 
            content: "You are SivaraX, a supportive AI that listens without judgment." 
          },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    
    // Groq uses the same format as OpenAI, so this should work perfectly!
    res.status(200).json({ reply: data.choices[0].message.content });

  } catch (err) {
    res.status(500).json({ reply: "Server error: " + err.message });
  }
}
