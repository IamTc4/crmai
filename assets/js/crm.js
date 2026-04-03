// crm.js - CRM Pipeline Logic

document.addEventListener('DOMContentLoaded', () => {
    // Save to local storage
    const savePipeline = () => {
        const pipelineData = {};
        document.querySelectorAll('.kanban-col').forEach((col, index) => {
            const headerEl = col.querySelector('.kanban-col-header');
            if(!headerEl) return;
            const colId = headerEl.textContent.trim();
            pipelineData[colId] = [];
            col.querySelectorAll('.lead-card').forEach(card => {
                pipelineData[colId].push(card.outerHTML);
            });
        });
        localStorage.setItem('crm_pipeline', JSON.stringify(pipelineData));
    };

    // Load from local storage
    const loadPipeline = () => {
        const saved = localStorage.getItem('crm_pipeline');
        if (saved) {
            try {
                const pipelineData = JSON.parse(saved);
                document.querySelectorAll('.kanban-col').forEach(col => {
                    const headerEl = col.querySelector('.kanban-col-header');
                    if(!headerEl) return;
                    const colId = headerEl.textContent.trim();
                    const container = col.querySelector('.kanban-cards');
                    if (pipelineData[colId] && container) {
                        container.innerHTML = pipelineData[colId].join('');
                    }
                });
            } catch(e) {
                console.error("Failed to load pipeline state");
            }
        }
        attachDragEvents();
    };

    const attachDragEvents = () => {
        const cards = document.querySelectorAll('.lead-card');
        const cols = document.querySelectorAll('.kanban-col');

        cards.forEach(card => {
            card.addEventListener('dragstart', () => {
                card.classList.add('dragging');
            });
            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
                savePipeline();
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
            col.addEventListener('drop', () => {
                col.classList.remove('drag-over');
                savePipeline();
            });
        });
    };

    loadPipeline();
});