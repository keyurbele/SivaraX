const chatBtn = document.getElementById('chatBtn');
const talkBtn = document.getElementById('talkBtn');
const backBtn = document.getElementById('backBtn');
const landingPage = document.querySelector('.landing-page');
const chatPage = document.querySelector('.chat-page');

chatBtn.onclick = () => { landingPage.style.display = 'none'; chatPage.style.display = 'block'; };
talkBtn.onclick = () => { landingPage.style.display = 'none'; chatPage.style.display = 'block'; startTalkMode(); };
backBtn.onclick = () => { landingPage.style.display = 'block'; chatPage.style.display = 'none'; };

const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');
const chatWindow = document.getElementById('chatWindow');

sendBtn.onclick = async () => {
  const message = userInput.value;
  if(!message) return;
  appendMessage('You', message);
  userInput.value = '';

  const response = await getAIResponse(message);
  appendMessage('SivaraX', response);
};

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.innerHTML = `<b>${sender}:</b> ${text}`;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Dummy AI response for now
async function getAIResponse(message) {
  return "I'm listening: " + message; // Later replace with OpenAI or Hugging Face API
}

function startTalkMode() {
  if(!('webkitSpeechRecognition' in window)) { alert('Your browser does not support speech recognition'); return; }

  const recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.start();

  recognition.onresult = async (event) => {
    const speech = event.results[0][0].transcript;
    appendMessage('You', speech);

    const response = await getAIResponse(speech);
    appendMessage('SivaraX', response);
    speakText(response);
  };
}

function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = 1;
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
}

async function getAIResponse(message) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  const data = await response.json();
  return data.reply;
},
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{role:'user', content: message}]
    })
  });
  const data = await response.json();
  return data.choices[0].message.content;
}
