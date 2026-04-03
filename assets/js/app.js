// app.js - Global App Logic & State Management

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Model Selector if container exists
    const modelContainer = document.getElementById('model-selector-container');
    if (modelContainer && typeof buildModelSelector === 'function') {
        buildModelSelector('model-selector-container');
    }

    // Sidebar Toggle Logic for Mobile
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');

    if (toggleBtn && sidebar) {
        if (window.innerWidth <= 768) {
            toggleBtn.style.display = 'block';
        }

        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Handle Window Resize to show/hide toggle button correctly
    window.addEventListener('resize', () => {
        if (toggleBtn) {
            if (window.innerWidth <= 768) {
                toggleBtn.style.display = 'block';
            } else {
                toggleBtn.style.display = 'none';
                if(sidebar) sidebar.classList.remove('open');
            }
        }
    });
});
