// lead-qualification.js - Lead Generation Logic

document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send');

    if (chatContainer && chatInput && chatSendBtn && typeof ChatManager !== 'undefined') {
        window.chatMgr = new ChatManager('chat-container', 'chat-input', 'chat-send', 'leads');
    }
});

async function submitLead(e) {
    e.preventDefault();
    const btn = document.getElementById('submit-lead-btn');
    btn.disabled = true;
    btn.textContent = 'Adding...';

    const name = document.getElementById('lead-name').value;
    const project = document.getElementById('lead-project').value;
    const source = document.getElementById('lead-source').value;
    const value = document.getElementById('lead-value').value || 0;

    // Simulate AI scoring before saving to CRM
    const mockScore = Math.floor(Math.random() * 50) + 40; // 40-90 score

    try {
        const token = localStorage.getItem('jwt_token');
        const res = await fetch('http://localhost:3000/api/leads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                project,
                source,
                value,
                score: mockScore,
                stage: 'New'
            })
        });

        if (!res.ok) throw new Error('Failed to add lead');

        if (typeof toast === 'function') toast(`Lead added successfully (Score: ${mockScore})`, 'success');

        // Let the AI analyze the newly added lead
        if (window.chatMgr) {
            window.chatMgr.useQuickPrompt(`I just added a new lead named ${name} interested in ${project || 'properties'}. Source: ${source}, Est. Value: ₹${value}. They scored ${mockScore}. What is your assessment and recommended next step?`);
            setTimeout(() => document.getElementById('chat-send').click(), 100);
        }

        document.getElementById('manual-lead-form').reset();
    } catch (err) {
        console.error(err);
        if (typeof toast === 'function') toast('Failed to add lead', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Add to CRM & Score';
    }
}
window.submitLead = submitLead;