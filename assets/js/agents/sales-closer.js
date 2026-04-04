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
    const comp = document.getElementById('comp-name').value;
    const btn = document.getElementById('gen-comp-btn');

    if(!comp) return;

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Generating...';

    setTimeout(() => {
        if(window.chatMgr) {
            window.chatMgr.useQuickPrompt(`Generate a 3-point battle card comparing our project against ${comp}. Focus on why our value proposition is stronger to help me close.`);
            setTimeout(() => document.getElementById('chat-send').click(), 100);
        }
        btn.disabled = false;
        btn.innerHTML = 'Auto-Generate vs Competitor';
        document.getElementById('comparison-form').reset();
    }, 500);
}
window.genComparison = genComparison;