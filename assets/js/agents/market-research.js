// market-research.js - Research Intel Logic

document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send');

    if (chatContainer && chatInput && chatSendBtn && typeof ChatManager !== 'undefined') {
        window.chatMgr = new ChatManager('chat-container', 'chat-input', 'chat-send', 'research');
    }
});

function runAnalysis() {
    const loc = document.getElementById('research-location').value;
    const seg = document.getElementById('research-segment').value;
    if (!loc || !seg) return; // Handled by HTML5 validation, but good practice

    if (window.chatMgr) {
        window.chatMgr.useQuickPrompt(`Please run a comprehensive competitor analysis for the ${seg} segment in ${loc}. Include estimated per-sqft pricing and current supply vs demand.`);
        setTimeout(() => document.getElementById('chat-send').click(), 100);
    }
}
// Attach to window so it's globally available
window.runAnalysis = runAnalysis;