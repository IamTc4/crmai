// crm.js - CRM Pipeline Logic

document.addEventListener('DOMContentLoaded', () => {
    // Simple drag and drop logic
    const cards = document.querySelectorAll('.lead-card');
    const cols = document.querySelectorAll('.kanban-col');

    cards.forEach(card => {
        card.addEventListener('dragstart', () => {
            card.classList.add('dragging');
        });
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            if (typeof toast === 'function') toast('Pipeline stage updated', 'success');
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
        col.addEventListener('drop', () => col.classList.remove('drag-over'));
    });
});