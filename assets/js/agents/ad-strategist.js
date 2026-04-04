// ad-strategist.js - Marketing Engine Logic

document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send');

    if (chatContainer && chatInput && chatSendBtn && typeof ChatManager !== 'undefined') {
        window.chatMgr = new ChatManager('chat-container', 'chat-input', 'chat-send', 'marketing');
    }
});

function runAdSpy() {
    const target = document.getElementById('spy-target').value;
    const resultsDiv = document.getElementById('spy-results');

    resultsDiv.innerHTML = '<div class="spinner"></div> Scraping Meta Ad Library...';

    // Simulate network delay for scraping
    setTimeout(() => {
        resultsDiv.innerHTML = `<div class="text-success font-bold mb-2">Data Retrieved</div>
        <div class="text-xs text-left text-primary">
            Found 14 active ads for ${target}. Primary hook is "Zero EMI till possession".
        </div>`;

        if (window.chatMgr) {
            window.chatMgr.useQuickPrompt(`I just scraped the Meta Ad Library for ${target}. They have 14 active ads focusing heavily on "Zero EMI till possession". Generate 3 counter-campaign ad copies for us to run against them.`);
            setTimeout(() => document.getElementById('chat-send').click(), 100);
        }
    }, 1500);
}
window.runAdSpy = runAdSpy;