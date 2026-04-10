const chatBtn = document.getElementById('chatBtn');
const talkBtn = document.getElementById('talkBtn');
const backBtn = document.getElementById('backBtn');
const landingPage = document.querySelector('.landing-page');
const chatPage = document.querySelector('.chat-page');

chatBtn.onclick = () => { 
  landingPage.style.display = 'none'; 
  chatPage.style.display = 'flex'; 
};

talkBtn.onclick = () => { 
  landingPage.style.display = 'none'; 
  chatPage.style.display = 'flex'; 
  startTalkMode(); 
};

backBtn.onclick = () => { 
  landingPage.style.display = 'flex'; 
  chatPage.style.display = 'none'; 
};

const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');
const chatWindow = document.getElementById('chatWindow');

sendBtn.onclick = sendMessage;
userInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage('user', message);
  userInput.value = '';

  const typing = showTyping();

  const response = await getAIResponse(message);

  typing.remove();

  setTimeout(() => {
    appendMessage('ai', response);
  }, 600 + Math.random() * 900); // more natural delay
}

function appendMessage(type, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', type);
  msg.innerText = text;

  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showTyping() {
  const typing = document.createElement('div');
  typing.classList.add('typing');
  typing.innerText = "typing...";
  chatWindow.appendChild(typing);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return typing;
}

async function getAIResponse(message) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    return data.reply;
  } catch (error) {
    return "ugh something broke... try again";
  }
}

/* Voice Mode */
function startTalkMode() {
  if(!('webkitSpeechRecognition' in window)) { 
    alert('Speech not supported'); 
    return; 
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.start();

  recognition.onresult = async (event) => {
    const speech = event.results[0][0].transcript;
    appendMessage('user', speech);

    const typing = showTyping();

    const response = await getAIResponse(speech);

    typing.remove();

    setTimeout(() => {
      appendMessage('ai', response);
      speakText(response);
    }, 600 + Math.random() * 900);
  };
}

function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = 0.95;
  utterance.rate = 0.9;
  speechSynthesis.speak(utterance);
}
