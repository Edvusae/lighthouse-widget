// 1. Select Elements
const analyzeBtn = document.getElementById('analyzeBtn');
const urlInput = document.getElementById('urlInput');
const loadingIndicator = document.getElementById('loading');

// 2. Main Event Listener
analyzeBtn.addEventListener('click', async () => {
    // Basic validation & cleanup
    const url = urlInput.value.trim();
    
    if (!url) {
        alert('Please enter a URL first!');
        return;
    }

    // Start UI feedback
    toggleLoading(true);

    try {
        console.log("Starting audit for:", url);
        
        // Construct API URL
        const apiEndpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=ACCESSIBILITY&category=BEST_PRACTICES&category=PERFORMANCE&category=SEO`;
        
        // Fetch data
        const response = await fetch(apiEndpoint);
        const data = await response.json();
        
        console.log("API Data received:", data);

        // Error Handling for API response
        if (data.error) {
            throw new Error(data.error.message);
        }

        if (!data.lighthouseResult) {
            throw new Error("Lighthouse results not found in response.");
        }

        // Extract and Scale Scores
        const categories = data.lighthouseResult.categories;
        const scores = {
            performance: (categories.performance.score || 0) * 100,
            accessibility: (categories.accessibility.score || 0) * 100,
            bestPractices: (categories['best-practices'].score || 0) * 100,
            seo: (categories.seo.score || 0) * 100
        };

        // Render the UI
        renderChart(scores);

    } catch (error) {
    console.error("Audit Failed:", error);
    
    // Check if it's a quota error
    if (error.message.includes("Quota exceeded")) {
        alert("API Limit hit! Showing demo data for your screenshot...");
        const demoScores = {
            performance: 92,
            accessibility: 100,
            bestPractices: 96,
            seo: 100
        };
        renderChart(demoScores);
    } else {
        alert(`Failed to analyze site: ${error.message}`);
    }
} finally {
    
    toggleLoading(false);
}

});

// 3. Chart Rendering Logic
function renderChart(scores) {
    const ctx = document.getElementById('scoreChart').getContext('2d');

    // Destroy existing chart to prevent hover flickering/ghosting
    if (window.myChart instanceof Chart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Performance', 'Accessibility', 'Best Practices', 'SEO'],
            datasets: [{
                label: 'Score (0-100)',
                data: [scores.performance, scores.accessibility, scores.bestPractices, scores.seo],
                backgroundColor: [
                    '#ff4e42', // Red
                    '#ffa400', // Orange
                    '#00c345', // Green
                    '#00b0ff'  // Blue
                ],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: '#334155' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    ticks: { color: '#94a3b8' }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// 4. UI Helpers
function toggleLoading(show) {
    loadingIndicator.classList.toggle('hidden', !show);
    analyzeBtn.disabled = show;
    analyzeBtn.textContent = show ? 'Analyzing...' : 'Analyze';
}