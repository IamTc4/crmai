// sales-closer.js - Sales Conversion Logic

document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send');

    if (chatContainer && chatInput && chatSendBtn && typeof ChatManager !== 'undefined') {
        window.chatMgr = new ChatManager('chat-container', 'chat-input', 'chat-send', 'sales');
    }
});

function genComparison() {
    const comp = document.getElementById('comp-name').value || 'Competitor';
    if (window.chatMgr) {
        window.chatMgr.useQuickPrompt(`Generate a 3-point battlecard comparing our project against ${comp}. Focus on why our value proposition is superior for closing the deal.`);
    }
}
window.genComparison = genComparison;