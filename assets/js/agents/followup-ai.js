// followup-ai.js - CRM Follow-up Agent Logic

document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send');

    if (chatContainer && chatInput && chatSendBtn && typeof ChatManager !== 'undefined') {
        window.chatMgr = new ChatManager('chat-container', 'chat-input', 'chat-send', 'crm');

        // Auto-open chat sidebar if a chat manager method is called via quick prompt
        const originalUsePrompt = window.chatMgr.useQuickPrompt.bind(window.chatMgr);
        window.chatMgr.useQuickPrompt = function(text) {
            document.getElementById('ai-chat-sidebar').classList.add('open');
            originalUsePrompt(text);
        };
    }
});

function toggleAIChat() {
    document.getElementById('ai-chat-sidebar').classList.toggle('open');
}
window.toggleAIChat = toggleAIChat;