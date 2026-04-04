// crm.js - CRM Pipeline Logic (API-Driven)

const PROXY_BASE_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    fetchLeads();
});

function formatCurrency(val) {
    if (val >= 10000000) return '₹' + (val / 10000000).toFixed(2) + 'Cr';
    if (val >= 100000) return '₹' + (val / 100000).toFixed(2) + 'L';
    return '₹' + val.toLocaleString('en-IN');
}

function createLeadCard(lead) {
    const card = document.createElement('div');
    card.className = 'lead-card';
    card.draggable = true;
    card.dataset.id = lead.id;

    // Determine badge colors based on score
    let badgeClass = 'badge-cold';
    if (lead.score >= 80) badgeClass = 'badge-hot';
    else if (lead.score >= 50) badgeClass = 'badge-warm';

    card.innerHTML = `
        <div class="lead-card-header">
            <div>
                <div class="lead-card-name">${lead.name}</div>
                <div class="lead-card-project">${lead.project}</div>
            </div>
            <div class="lead-card-value">${formatCurrency(lead.value)}</div>
        </div>
        <div class="lead-card-meta">
            <span class="lead-card-tag badge ${badgeClass}">Score: ${lead.score}</span>
            <span class="lead-card-tag" style="background:rgba(255,255,255,0.05); border:1px solid var(--border);">${lead.source}</span>
        </div>
        <div class="lead-card-days">⏳ ${lead.days_in_stage} days in stage</div>
        <div class="lead-card-actions">
            <button onclick="window.chatMgr.useQuickPrompt('Generate WhatsApp follow-up for ${lead.name} regarding ${lead.project}')">📱 WhatsApp</button>
            <button onclick="window.chatMgr.useQuickPrompt('Generate email follow-up for ${lead.name} regarding ${lead.project}')">✉️ Email</button>
        </div>
    `;
    return card;
}

async function fetchLeads() {
    try {
        const token = localStorage.getItem('jwt_token');
        const res = await fetch(`${PROXY_BASE_URL}/api/leads`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch leads');
        const leads = await res.json();
        renderPipeline(leads);
    } catch (err) {
        console.error(err);
        if (typeof toast === 'function') toast('Failed to load CRM data', 'error');
    }
}

function renderPipeline(leads) {
    // Clear existing cards
    document.querySelectorAll('.kanban-cards').forEach(container => {
        container.innerHTML = '';
    });

    // Populate leads
    leads.forEach(lead => {
        const colHeader = Array.from(document.querySelectorAll('.kanban-col-title span')).find(
            span => span.textContent.trim() === lead.stage
        );
        if (colHeader) {
            const container = colHeader.closest('.kanban-col').querySelector('.kanban-cards');
            container.appendChild(createLeadCard(lead));
        }
    });

    // Update counts
    document.querySelectorAll('.kanban-col').forEach(col => {
        const count = col.querySelectorAll('.lead-card').length;
        const countBadge = col.querySelector('.kanban-count');
        if (countBadge) countBadge.textContent = count;
    });

    attachDragEvents();
}

async function updateLeadStage(leadId, newStage) {
    try {
        const token = localStorage.getItem('jwt_token');
        const res = await fetch(`${PROXY_BASE_URL}/api/leads/${leadId}/stage`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ stage: newStage })
        });

        if (!res.ok) throw new Error('Failed to update stage');
        if (typeof toast === 'function') toast('Pipeline stage updated', 'success');

        // Update column counts
        document.querySelectorAll('.kanban-col').forEach(col => {
            const count = col.querySelectorAll('.lead-card').length;
            const countBadge = col.querySelector('.kanban-count');
            if (countBadge) countBadge.textContent = count;
        });

    } catch (err) {
        console.error(err);
        if (typeof toast === 'function') toast('Failed to update stage', 'error');
        fetchLeads(); // Revert on failure
    }
}

function attachDragEvents() {
    const cards = document.querySelectorAll('.lead-card');
    const cols = document.querySelectorAll('.kanban-col');

    cards.forEach(card => {
        card.addEventListener('dragstart', () => {
            card.classList.add('dragging');
        });
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });
    });

    cols.forEach(col => {
        col.addEventListener('dragover', e => {
            e.preventDefault();
            col.classList.add('drag-over');
            const dragging = document.querySelector('.dragging');
            const cardsContainer = col.querySelector('.kanban-cards');
            if (dragging && cardsContainer) cardsContainer.appendChild(dragging);
        });

        col.addEventListener('dragleave', () => col.classList.remove('drag-over'));

        col.addEventListener('drop', (e) => {
            col.classList.remove('drag-over');
            const dragging = document.querySelector('.dragging');
            if (dragging) {
                const leadId = dragging.dataset.id;
                // Select the text span, bypassing the empty colored dot span
                const newStage = col.querySelector('.kanban-col-title div span:last-child').textContent.trim();
                updateLeadStage(leadId, newStage);
            }
        });
    });
}