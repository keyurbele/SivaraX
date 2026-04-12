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

// --- FIX: Unlock Audio for Browsers ---
function unlockAudio() {
    const speech = new SpeechSynthesisUtterance(' ');
    window.speechSynthesis.speak(speech);
}

// --- NAVIGATION ---
document.getElementById('chatBtn').onclick = () => {
    unlockAudio();
    landingPage.style.display = 'none';
    chatPage.style.display = 'flex';
    if (!userData.setupComplete) {
        setupOverlay.style.display = 'flex';
    } else {
        appendMessage('ai', `yo ${userData.name}, what's on your mind?`);
    }
};

document.getElementById('talkBtn').onclick = () => {
    unlockAudio();
    landingPage.style.display = 'none';
    chatPage.style.display = 'flex';
    if (!userData.setupComplete) {
        setupOverlay.style.display = 'flex';
    } else {
        setTimeout(startListening, 500); // Give it a moment to switch screens
    }
};

// --- SETUP LOGIC ---
window.setVoice = (gender) => {
    userData.voicePreference = gender;
    // Add visual feedback to buttons
    document.querySelectorAll('.setup-btns button').forEach(btn => btn.style.borderColor = 'var(--glass-border)');
    event.target.style.borderColor = 'var(--accent-pink)';
};

document.getElementById('finishSetup').onclick = () => {
    const nameInput = document.getElementById('nameInput');
    userData.name = nameInput.value || "friend";
    userData.setupComplete = true;
    localStorage.setItem('sivarax_memory', JSON.stringify(userData));
    setupOverlay.style.display = 'none';
    appendMessage('ai', `yo ${userData.name}, i'm locked in. talk to me.`);
};

// --- VOICE LOGIC ---
let recognition;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechConstructor = window.webkitSpeechRecognition || window.SpeechRecognition;
    recognition = new SpeechConstructor();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => { 
        if(siriWave) siriWave.style.display = 'block'; 
    };
    recognition.onend = () => { 
        if(siriWave) siriWave.style.display = 'none'; 
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
        try { recognition.start(); } catch (e) { console.log("Mic already active"); }
    } else {
        alert("Voice not supported on this browser. Use Chrome/Safari.");
    }
}

// --- CHAT & API ---
async function getAIResponse(message) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, context: userData })
        });
        const data = await response.json();
        return data.reply;
    } catch (e) { return "server's cooked fr..."; }
}

function appendMessage(type, text) {
    const msg = document.createElement('div');
    msg.className = type === 'user' ? 'user-msg' : 'ai-msg';
    msg.innerText = text;
    const win = document.getElementById('chatWindow');
    win.appendChild(msg);
    win.scrollTop = win.scrollHeight;
}

function speakText(text) {
    window.speechSynthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = userData.voicePreference === 'female' ? 1.2 : 0.85;
    window.speechSynthesis.speak(utterance);
}
