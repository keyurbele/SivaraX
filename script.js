let userData = JSON.parse(localStorage.getItem('data')) || {
  name: '',
  voice: 'female',
  mode: 'listener',
  setup: false
};

const landing = document.querySelector('.landing-page');
const chat = document.querySelector('.chat-page');
const overlay = document.getElementById('setupOverlay');

const input = document.getElementById('userInput');
const chatWindow = document.getElementById('chatWindow');
const wave = document.getElementById('siriWave');

let rec;
let listening = false;

/* SEND MESSAGE */
document.getElementById('sendBtn').onclick = send;

input.addEventListener("keypress", e => {
  if (e.key === "Enter") send();
});

function send() {
  const msg = input.value.trim();
  if (!msg) return;

  append('user', msg);
  input.value = '';

  getAI(msg).then(r => {
    setTimeout(() => append('ai', r), 600);
  });
}

/* CHAT UI */
function append(type, text) {
  const div = document.createElement('div');
  div.className = type === 'user' ? 'user-msg' : 'ai-msg';
  div.innerText = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* AI */
async function getAI(message) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      message,
      mode: userData.mode,
      name: userData.name
    })
  });

  const data = await res.json();
  return data.reply;
}

/* NAV */
document.getElementById('chatBtn').onclick = () => {
  landing.style.display = 'none';
  chat.style.display = 'flex';
  if (!userData.setup) overlay.style.display = 'flex';
};

document.getElementById('talkBtn').onclick = () => {
  landing.style.display = 'none';
  chat.style.display = 'flex';
  if (!userData.setup) overlay.style.display = 'flex';
  else startVoice();
};

document.getElementById('backBtn').onclick = () => {
  stopVoice();
  chat.style.display = 'none';
  landing.style.display = 'flex';
};

/* SETUP */
function setVoice(v, el) {
  userData.voice = v;
}

document.getElementById('finishSetup').onclick = () => {
  userData.name = nameInput.value || "friend";
  userData.setup = true;
  localStorage.setItem('data', JSON.stringify(userData));
  overlay.style.display = 'none';
};

/* MODE */
function setMode(m, el) {
  userData.mode = m;
  localStorage.setItem('data', JSON.stringify(userData));

  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

/* SETTINGS */
document.getElementById('settingsBtn').onclick = () => {
  const panel = document.getElementById('settingsPanel');
  const box = document.getElementById('memoryBox');

  box.innerHTML = `
    Name: ${userData.name}<br>
    Mode: ${userData.mode}<br>
    Voice: ${userData.voice}
  `;

  panel.style.display = 'block';
};

function closeSettings() {
  document.getElementById('settingsPanel').style.display = 'none';
}

/* VOICE */
function startVoice() {
  if (!('webkitSpeechRecognition' in window)) return;

  rec = new webkitSpeechRecognition();
  rec.continuous = false;
  rec.lang = 'en-US';
  listening = true;

  rec.onstart = () => wave.style.display = 'block';
  rec.onend = () => {
    wave.style.display = 'none';
    if (listening) rec.start();
  };

  rec.onresult = e => {
    const text = e.results[0][0].transcript;
    append('user', text);

    getAI(text).then(r => {
      append('ai', r);
      speak(r);
    });
  };

  rec.start();
}

function stopVoice() {
  listening = false;
  if (rec) rec.stop();
}

/* SPEAK */
function speak(text) {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9;
  speechSynthesis.speak(u);
}
