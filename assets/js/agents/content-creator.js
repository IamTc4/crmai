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
    const btn = document.getElementById('generate-content-btn');

    if (!type || !topic) return;

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Generating...';

    // Small delay to make it feel like the form processed before chat takeover
    setTimeout(() => {
        if (window.chatMgr) {
            window.chatMgr.useQuickPrompt(`Please write a highly engaging ${type} focusing on the following topic/angle: "${topic}". Ensure the tone is aspirational and includes a clear hook and call-to-action.`);
            setTimeout(() => document.getElementById('chat-send').click(), 100);
        }
        btn.disabled = false;
        btn.innerHTML = 'Generate Script';
        document.getElementById('quick-content-form').reset();
    }, 500);
}
window.generateQuickContent = generateQuickContent;
