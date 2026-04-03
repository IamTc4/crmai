// content-creator.js - Content Engine Logic

document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send');

    if (chatContainer && chatInput && chatSendBtn && typeof ChatManager !== 'undefined') {
        window.chatMgr = new ChatManager('chat-container', 'chat-input', 'chat-send', 'content');
    }
});

function generateQuickContent() {
    const type = document.getElementById('content-type').value;
    const topic = document.getElementById('content-topic').value;
    if (!topic) {
        if (typeof toast === 'function') toast('Please enter a topic', 'warning');
        return;
    }
    if (window.chatMgr) {
        window.chatMgr.useQuickPrompt(`Write a ${type} about: ${topic}. Include a strong hook, body, and CTA.`);
    }
}
// Attach to window so it's globally available for the onclick handler
window.generateQuickContent = generateQuickContent;