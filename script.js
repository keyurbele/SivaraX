// --- INITIAL STATE & MEMORY ---
let userData = JSON.parse(localStorage.getItem('sivarax_memory')) || {
    name: '',
    voicePreference: 'female',
    mode: 'listener', 
    setupComplete: false
};

// UI Elements
const landingPage = document.querySelector('.landing-page');
const chatPage = document.querySelector('.chat-page');
const setupOverlay = document.getElementById('setupOverlay');
const nameInput = document.getElementById('nameInput');
const siriWave = document.getElementById('siriWave');
const chatWindow = document.getElementById('chatWindow');

// --- SETUP LOGIC (The Premium Way) ---
window.onload = () => {
    if (!userData.setupComplete) {
        setupOverlay.style.display = 'flex';
    }
};

// These functions connect to the onclicks in your HTML
window.setVoice = (gender) => {
    userData.voicePreference = gender;
    // Simple visual feedback
    console.log("Voice set to:", gender);
};

document.getElementById('finishSetup').onclick = () => {
    if (nameInput.value.trim() === "") {
        alert("at least give me a name, fam");
        return;
    }
    userData.name = nameInput.value.trim();
    userData.setupComplete = true;
    localStorage.setItem('sivarax_memory', JSON.stringify(userData));
    setupOverlay.style.display = 'none';
};

// --- NAVIGATION & QUICK START ---
document.getElementById('chatBtn').onclick = () => {
    landingPage.style.display = 'none';
    chatPage.style.display = 'flex';
    appendMessage('ai', `yo ${userData.name}, i'm locked in. what's on your mind?`);
};

document.getElementById('talkBtn').onclick = () => {
    landingPage.style.display = 'none';
    chatPage.style.display = 'flex';
    appendMessage('ai', `listening...`);
    startListening(); // Immediate start from landing page
};

document.getElementById('backBtn').onclick = () => {
    landingPage.style.display = 'flex';
    chatPage.style.display = 'none';
};

// --- CHAT LOGIC ---
const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');

sendBtn.onclick = sendMessage;
userInput.addEventListener("keypress", e => { if (e.key === "Enter") sendMessage(); });

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;
    appendMessage('user', text);
    userInput.value = '';
    const typing = showTyping();
    const response = await getAIResponse(text);
    typing.remove();
    appendMessage('ai', response);
}

function appendMessage(type, text) {
    const msg = document.createElement('div');
    msg.className = type === 'user' ? 'user-msg' : 'ai-msg';
    msg.innerText = text;
    chatWindow.appendChild(msg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showTyping() {
    const typing = document.createElement('div');
    typing.id = "typing-indicator";
    typing.innerText = "sivarax is thinking...";
    chatWindow.appendChild(typing);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return typing;
}

async function getAIResponse(message) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, context: userData })
        });
        const data = await response.json();
        return data.reply;
    } catch (e) { return "server's cooked fr... try later"; }
}

// --- VOICE LOGIC (SIRI STYLE) ---
let recognition;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => { siriWave.style.display = 'block'; };
    recognition.onend = () => { siriWave.style.display = 'none'; };

    recognition.onresult = async (event) => {
        const speech = event.results[0][0].transcript;
        appendMessage('user', speech);
        const typing = showTyping();
        const response = await getAIResponse(speech);
        typing.remove();
        appendMessage('ai', response);
        speakText(response);
    };
}

function startListening() {
    if (recognition) {
        try { recognition.start(); } catch (e) { console.log("already listening"); }
    }
}

function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = userData.voicePreference === 'female' ? 1.2 : 0.85;
    window.speechSynthesis.speak(utterance);
}
