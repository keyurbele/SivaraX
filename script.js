async function getAI(message) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },

      // ✅ FIX: send correct structure
      body: JSON.stringify({
        message: message,
        context: {
          name: "friend",
          mode: "listener"
        }
      })
    });a

    const data = await res.json();
    return data.reply;

  } catch (err) {
    return "server error bro";
  }
}

/* TEST BUTTON */
document.getElementById("talkBtn").onclick = async () => {
  const reply = await getAI("hello");
  alert(reply); // TEMP TEST
};
