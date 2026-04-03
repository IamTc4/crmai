// analytics.js - Dashboard Charts

document.addEventListener('DOMContentLoaded', () => {
    // Init mock charts
    const leadsCanvas = document.getElementById('leadsChart');
    if (leadsCanvas && typeof Chart !== 'undefined') {
        const leadsCtx = leadsCanvas.getContext('2d');
        new Chart(leadsCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Leads Generated',
                    data: [12, 19, 15, 25, 22, 30, 48],
                    borderColor: '#6366F1',
                    tension: 0.4,
                    backgroundColor: 'rgba(99,102,241,0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8b9cc8' } },
                    x: { grid: { display: false }, ticks: { color: '#8b9cc8' } }
                }
            }
        });
    }

    const roiCanvas = document.getElementById('roiChart');
    if (roiCanvas && typeof Chart !== 'undefined') {
        const roiCtx = roiCanvas.getContext('2d');
        new Chart(roiCtx, {
            type: 'doughnut',
            data: {
                labels: ['Meta', 'Google', 'Organic', 'Referral'],
                datasets: [{
                    data: [45, 30, 15, 10],
                    backgroundColor: ['#2563EB', '#D97706', '#10B981', '#BE185D'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right', labels: { color: '#8b9cc8' } } }
            }
        });
    }
});