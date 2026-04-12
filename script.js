// --- INITIAL STATE ---
let userData = JSON.parse(localStorage.getItem('sivarax_memory')) || {
  name: '',
  voicePreference: 'female',
  mode: 'listener',
  setupComplete: false
};

const landingPage = document.querySelector('.landing-page');
const chatPage = document.querySelector('.chat-page');
const setupOverlay = document.getElementById('setupOverlay');
const siriWave = document.getElementById('siriWave');

// --- Unlock Audio ---
function unlockAudio() {
  const speech = new SpeechSynthesisUtterance(' ');
  window.speechSynthesis.speak(speech);
}

// --- MODE SELECTOR ---
window.setMode = (mode, el) => {
  userData.mode = mode;
  localStorage.setItem('sivarax_memory', JSON.stringify(userData));

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  if (el) el.classList.add('active');
};

// --- NAVIGATION ---
document.getElementById('chatBtn').onclick = () => {
  unlockAudio();
  landingPage.style.display = 'none';
  chatPage.style.display = 'flex';

  if (!userData.setupComplete) {
    setupOverlay.style.display = 'flex';
  } else {
    appendMessage('ai', `${userData.name}… yeah i'm here. what's going on?`);
  }
};

document.getElementById('talkBtn').onclick = () => {
  unlockAudio();
  landingPage.style.display = 'none';
  chatPage.style.display = 'flex';

  if (!userData.setupComplete) {
    setupOverlay.style.display = 'flex';
  } else {
    setTimeout(startListening, 500);
  }
};

// --- SETUP ---
window.setVoice = (gender, el) => {
  userData.voicePreference = gender;

  document.querySelectorAll('.setup-btns button').forEach(btn => {
    btn.style.borderColor = 'var(--glass-border)';
  });

  if (el) el.style.borderColor = '#ff00cc';
};

document.getElementById('finishSetup').onclick = () => {
  const nameInput = document.getElementById('nameInput');
  userData.name = nameInput.value || "friend";
  userData.setupComplete = true;

  localStorage.setItem('sivarax_memory', JSON.stringify(userData));

  setupOverlay.style.display = 'none';

  appendMessage('ai', `${userData.name}… yeah i'm here. what's going on?`);
};

// --- CHAT ---
async function getAIResponse(message) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        mode: userData.mode,
        name: userData.name
      })
    });

    const data = await response.json();
    return data.reply;
  } catch (e) {
    return "server's cooked fr...";
  }
}

function appendMessage(type, text) {
  const msg = document.createElement('div');
  msg.className = type === 'user' ? 'user-msg' : 'ai-msg';
  msg.innerText = text;

  const win = document.getElementById('chatWindow');
  win.appendChild(msg);
  win.scrollTop = win.scrollHeight;
}

// --- VOICE ---
let recognition;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechConstructor = window.webkitSpeechRecognition || window.SpeechRecognition;
  recognition = new SpeechConstructor();
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    if (siriWave) siriWave.style.display = 'block';
  };

  recognition.onend = () => {
    if (siriWave) siriWave.style.display = 'none';
  };

  recognition.onresult = async (event) => {
    const speech = event.results[0][0].transcript;

    appendMessage('user', speech);

    const response = await getAIResponse(speech);

    appendMessage('ai', response);
    speakText(response);
  };
}

function startListening() {
  if (recognition) {
    try { recognition.start(); } catch {}
  } else {
    alert("Voice not supported. Use Chrome.");
  }
}

// --- SPEAK ---
function speakText(text) {
  window.speechSynthesis.cancel();

  const voices = speechSynthesis.getVoices();
  let selectedVoice;

  if (userData.voicePreference === 'female') {
    selectedVoice = voices.find(v => v.name.toLowerCase().includes('female')) 
                 || voices[0];
  } else {
    selectedVoice = voices.find(v => v.name.toLowerCase().includes('male')) 
                 || voices[1];
  }

  const utterance = new SpeechSynthesisUtterance(text);
  if (selectedVoice) utterance.voice = selectedVoice;

  utterance.rate = 0.9;
  utterance.pitch = userData.voicePreference === 'female' ? 1.1 : 0.85;

  speechSynthesis.speak(utterance);
}
