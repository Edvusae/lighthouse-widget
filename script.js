const CONFIG = {
    // Pro-tip: Get your free key at https://developers.google.com/speed/docs/insights/v5/get-started
    API_KEY: "YOUR_API_KEY_HERE", 
    CATEGORIES: ['performance', 'accessibility', 'best-practices', 'seo']
};

const state = {
    scores: null,
    currentUrl: ""
};

// Selectors
const analyzeBtn = document.getElementById('analyzeBtn');
const urlInput = document.getElementById('urlInput');
const loading = document.getElementById('loading');
const resultsSection = document.getElementById('resultsSection');

analyzeBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) return;

    toggleUI(true);

    try {
        const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&${CONFIG.CATEGORIES.map(c => `category=${c.toUpperCase()}`).join('&')}&key=${CONFIG.API_KEY}`;
        
        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.error) throw new Error(data.error.message);

        processResults(data.lighthouseResult.categories, url);
    } catch (err) {
        handleError(err);
    } finally {
        toggleUI(false);
    }
});

function processResults(categories, url) {
    state.currentUrl = url;
    state.scores = {
        Performance: categories.performance.score * 100,
        Accessibility: categories.accessibility.score * 100,
        "Best Practices": categories['best-practices'].score * 100,
        SEO: categories.seo.score * 100
    };

    renderUI();
}

function getStatusColor(score) {
    if (score >= 90) return '#00c345'; // Pass
    if (score >= 50) return '#ffa400'; // Average
    return '#ff4e42'; // Fail
}

function renderUI() {
    resultsSection.classList.remove('hidden');
    const grid = document.getElementById('scoreGrid');
    grid.innerHTML = '';

    Object.entries(state.scores).forEach(([label, value]) => {
        const color = getStatusColor(value);
        grid.innerHTML += `
            <div class="score-card" style="border-color: ${color}">
                <h3>${label}</h3>
                <div class="value" style="color: ${color}">${Math.round(value)}</div>
            </div>
        `;
    });

    renderChart();
}

function renderChart() {
    const ctx = document.getElementById('scoreChart').getContext('2d');
    if (window.myChart) window.myChart.destroy();

    const dataValues = Object.values(state.scores);
    
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(state.scores),
            datasets: [{
                data: dataValues,
                backgroundColor: dataValues.map(v => getStatusColor(v)),
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, max: 100, ticks: { color: '#94a3b8' } },
                x: { ticks: { color: '#94a3b8' } }
            }
        }
    });
}

function toggleUI(isLoading) {
    loading.classList.toggle('hidden', !isLoading);
    analyzeBtn.disabled = isLoading;
    if (isLoading) resultsSection.classList.add('hidden');
}

function handleError(err) {
    console.error(err);
    // If quota hit, show mock data so user can still take a screenshot
    if (err.message.includes("Quota")) {
        alert("Quota exceeded! Displaying demo data for screenshot.");
        processResults({
            performance: {score: 0.92},
            accessibility: {score: 1.0},
            'best-practices': {score: 0.96},
            seo: {score: 0.98}
        }, "demo-mode");
    } else {
        alert("Error: " + err.message);
    }
}