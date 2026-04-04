// orchestrator.js - Master Orchestrator Logic

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Chat Manager for the Master Orchestrator
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send');

    if (chatContainer && chatInput && chatSendBtn && typeof ChatManager !== 'undefined') {
        window.chatMgr = new ChatManager('chat-container', 'chat-input', 'chat-send', 'orchestrator');

        // Enhance chat manager with Intent Detection for Master Orchestrator
        const originalSend = window.chatMgr.send.bind(window.chatMgr);
        window.chatMgr.send = async function() {
            if (this.streaming || !this.input) return;
            const text = this.input.value.trim();
            if (!text) return;

            // First pass text to orchestrator normally, but pre-process for intents if needed
            // For now, let the AI act as Orchestrator, but inject instructions locally if needed
            originalSend();
        }
    }
});