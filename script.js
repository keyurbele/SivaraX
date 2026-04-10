const chatBtn = document.getElementById('chatBtn');
const talkBtn = document.getElementById('talkBtn');
const backBtn = document.getElementById('backBtn');
const landingPage = document.querySelector('.landing-page');
const chatPage = document.querySelector('.chat-page');

chatBtn.onclick = () => { 
  landingPage.style.display = 'none'; 
  chatPage.style.display = 'block'; 
};
talkBtn.onclick = () => { 
  landingPage.style.display = 'none'; 
  chatPage.style.display = 'block'; 
  startTalkMode(); 
};
backBtn.onclick = () => { 
  landingPage.style.display = 'block'; 
  chatPage.style.display = 'none'; 
};

const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');
const chatWindow = document.getElementById('chatWindow');

sendBtn.onclick = async () => {
  const message = userInput.value;
  if(!message) return;
  
  appendMessage('You', message);
  userInput.value = '';

  // Get the response, but don't show it immediately
  const response = await getAIResponse(message);
  
  // Wait 1.5 seconds to simulate "typing"
  setTimeout(() => {
    appendMessage('SivaraX', response);
  }, 1500);
};

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  // I removed the Bold names here to make it look like a real messaging app
  msg.className = sender === 'You' ? 'user-msg' : 'ai-msg'; 
  msg.innerHTML = `${text}`; 
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
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
    return "damn, server's acting up. my bad.";
  }
}

function startTalkMode() {
  if(!('webkitSpeechRecognition' in window)) { 
    alert('Your browser does not support speech recognition'); 
    return; 
  }

  const recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.start();

  recognition.onresult = async (event) => {
    const speech = event.results[0][0].transcript;
    appendMessage('You', speech);

    const response = await getAIResponse(speech);
    
    setTimeout(() => {
        appendMessage('SivaraX', response);
        speakText(response);
    }, 1200);
  };
}

function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = 1.1; // Slightly higher pitch feels more youthful/human
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
}
