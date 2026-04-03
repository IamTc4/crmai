// analytics.js - Dashboard Charts

document.addEventListener('DOMContentLoaded', () => {
    // Mock API Fetching logic
    const fetchData = () => {
        // Here you would normally fetch from your API
        // For now, returning dynamic-looking data based on current date
        const today = new Date();
        const days = [];
        const leads = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
            // Simulate random growth
            leads.push(Math.floor(Math.random() * 30) + 10 + (6-i)*5);
        }

        // Return simulated payload
        return {
            leadsChart: { labels: days, data: leads },
            roiChart: {
                labels: ['Meta', 'Google', 'Organic', 'Referral'],
                data: [Math.floor(Math.random()*20)+40, Math.floor(Math.random()*15)+20, 15, 10]
            },
            kpis: {
                totalLeads: leads.reduce((a,b)=>a+b, 0),
                cpl: Math.floor(Math.random() * 200) + 300,
                revenue: (Math.floor(Math.random() * 5) + 1) * 1.5 + 'Cr'
            }
        };
    };

    const dashboardData = fetchData();

    // Update KPIs on index.html and analytics.html if they exist
    const totalLeadsEl = document.getElementById('kpi-total-leads');
    if (totalLeadsEl) totalLeadsEl.textContent = dashboardData.kpis.totalLeads;

    const cplEl = document.getElementById('kpi-cpl');
    if (cplEl) cplEl.textContent = '₹' + dashboardData.kpis.cpl;

    const revEl = document.getElementById('kpi-revenue');
    if (revEl) revEl.textContent = dashboardData.kpis.revenue;

    const leadsCanvas = document.getElementById('leadsChart');
    if (leadsCanvas && typeof Chart !== 'undefined') {
        const leadsCtx = leadsCanvas.getContext('2d');
        new Chart(leadsCtx, {
            type: 'line',
            data: {
                labels: dashboardData.leadsChart.labels,
                datasets: [{
                    label: 'Leads Generated',
                    data: dashboardData.leadsChart.data,
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
                labels: dashboardData.roiChart.labels,
                datasets: [{
                    data: dashboardData.roiChart.data,
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