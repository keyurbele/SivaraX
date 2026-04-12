// --- INITIAL STATE & MEMORY ---
let userData = JSON.parse(localStorage.getItem('sivarax_memory')) || {
    name: '',
    voicePreference: 'female',
    mode: 'listener', 
    setupComplete: false
};

const chatBtn = document.getElementById('chatBtn');
const talkBtn = document.getElementById('talkBtn');
const backBtn = document.getElementById('backBtn');
const landingPage = document.querySelector('.landing-page');
const chatPage = document.querySelector('.chat-page');
const siriWave = document.getElementById('siriWave'); 

// --- SETUP LOGIC ---
window.onload = () => {
    if (!userData.setupComplete) {
        showSetupOverlay();
    }
};

function showSetupOverlay() {
    const name = prompt("yo, what should i call you?", "friend");
    const voice = confirm("press OK for female voice, CANCEL for male voice") ? 'female' : 'male';
    userData.name = name || "friend";
    userData.voicePreference = voice;
    userData.setupComplete = true;
    localStorage.setItem('sivarax_memory', JSON.stringify(userData));
}

function setMode(newMode) {
    userData.mode = newMode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    // Fixed: Finding the button by its onclick attribute to ensure the UI updates
    const activeBtn = document.querySelector(`[onclick="setMode('${newMode}')"]`);
    if (activeBtn) activeBtn.classList.add('active');
    localStorage.setItem('sivarax_memory', JSON.stringify(userData));
}

// --- NAVIGATION ---
chatBtn.onclick = () => { landingPage.style.display = 'none'; chatPage.style.display = 'flex'; };
backBtn.onclick = () => { landingPage.style.display = 'flex'; chatPage.style.display = 'none'; };

// --- CHAT LOGIC ---
const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');
const chatWindow = document.getElementById('chatWindow');

sendBtn.onclick = sendMessage;
userInput.addEventListener("keypress", e => { if (e.key === "Enter") sendMessage(); });

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    appendMessage('user', message);
    userInput.value = '';

    const typing = showTyping();
    const response = await getAIResponse(message);
    typing.remove();

    appendMessage('ai', response);
}

function appendMessage(type, text) {
    const msg = document.createElement('div');
    msg.classList.add('message', type === 'user' ? 'user-msg' : 'ai-msg');
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
            body: JSON.stringify({ 
                message, 
                context: userData 
            })
        });
        const data = await response.json();
        return data.reply;
    } catch (error) {
        return "server's cooked rn... my bad";
    }
}

// --- VOICE MODE (HOLD TO TALK) ---
let recognition;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

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

// Siri-style Hold to Talk logic (Desktop + Mobile)
const startListening = () => {
    if (recognition) {
        try {
            recognition.start();
            if (siriWave) siriWave.style.display = 'block';
        } catch (e) {
            console.log("Already listening...");
        }
    }
};

const stopListening = () => {
    if (recognition) {
        recognition.stop();
        if (siriWave) siriWave.style.display = 'none';
    }
};

// Listen for both mouse and touch (for premium mobile feel)
talkBtn.addEventListener('mousedown', startListening);
talkBtn.addEventListener('mouseup', stopListening);
talkBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startListening(); });
talkBtn.addEventListener('touchend', stopListening);

function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = userData.voicePreference === 'female' ? 1.2 : 0.85;
    utterance.rate = 1;
    speechSynthesis.speak(utterance);
}
