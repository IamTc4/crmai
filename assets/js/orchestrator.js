// orchestrator.js - Master Orchestrator Logic

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Chat Manager for the Master Orchestrator
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send');

    if (chatContainer && chatInput && chatSendBtn && typeof ChatManager !== 'undefined') {
        window.chatMgr = new ChatManager('chat-container', 'chat-input', 'chat-send', 'orchestrator');
    }
});