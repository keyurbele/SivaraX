let userData = JSON.parse(localStorage.getItem('data')) || {
  name: '',
  voice: 'female',
  mode: 'listener',
  setup: false
};

const landing = document.querySelector('.landing-page');
const chat = document.querySelector('.chat-page');
const overlay = document.getElementById('setupOverlay');
const wave = document.getElementById('siriWave');

const sendBtn = document.getElementById('sendBtn');
const input = document.getElementById('userInput');

sendBtn.onclick = send;
input.addEventListener("keypress", e => {
  if (e.key === "Enter") send();
});

function send() {
  const msg = input.value.trim();
  if (!msg) return;

  append('user', msg);
  input.value = '';

  getAI(msg).then(r => {
    setTimeout(() => append('ai', r), 700);
  });
}

function append(type, text) {
  const div = document.createElement('div');
  div.className = type === 'user' ? 'user-msg' : 'ai-msg';
  div.innerText = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function getAI(message) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      mode: userData.mode,
      name: userData.name
    })
  });
  const data = await res.json();
  return data.reply;
}

/* nav */
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

/* setup */
function setVoice(v) { userData.voice = v; }

document.getElementById('finishSetup').onclick = () => {
  userData.name = nameInput.value || "friend";
  userData.setup = true;
  localStorage.setItem('data', JSON.stringify(userData));
  overlay.style.display = 'none';
};

/* mode */
function setMode(m, el) {
  userData.mode = m;
  localStorage.setItem('data', JSON.stringify(userData));

  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

/* voice */
let rec;
let listening = false;

function startVoice() {
  if (!('webkitSpeechRecognition' in window)) return;

  rec = new webkitSpeechRecognition();
  rec.start();
  listening = true;

  rec.onstart = () => wave.style.display = 'block';
  rec.onend = () => {
    wave.style.display = 'none';
    if (listening) rec.start();
  };

  rec.onresult = e => {
    const speech = e.results[0][0].transcript;
    append('user', speech);

    getAI(speech).then(r => {
      append('ai', r);
      speak(r);
    });
  };
}

function speak(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9;
  speechSynthesis.speak(u);
}
