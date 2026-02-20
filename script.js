const analyzeBtn = document.getElementById('analyzeBtn');
const urlInput = document.getElementById('urlInput');

// Inside your async function...
const data = await response.json();
console.log("Full API Response:", data); // Check your F12 console for this!

if (!data.lighthouseResult) {
    alert("API Error: " + (data.error ? data.error.message : "Check console"));
    return;
}

const categories = data.lighthouseResult.categories;
const scores = {
    performance: (categories.performance.score || 0) * 100,
    accessibility: (categories.accessibility.score || 0) * 100,
    bestPractices: (categories['best-practices'].score || 0) * 100,
    seo: (categories.seo.score || 0) * 100
};

renderChart(scores);

analyzeBtn.addEventListener('click', async () => {
    const url = urlInput.value;
    if (!url) return alert('Please enter a URL');

    toggleLoading(true);
try {
    console.log("Fetching data for:", url); // Debug 1
    const apiEndpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=ACCESSIBILITY&category=BEST_PRACTICES&category=PERFORMANCE&category=SEO`;
    
    const response = await fetch(apiEndpoint);
    const data = await response.json();
    
    console.log("API Response:", data); 

    // If the API returns an error, it will be inside data.error
    if (data.error) {
        alert(`Error: ${data.error.message}`);
        return;
    }

    const scores = {
        performance: data.lighthouseResult.categories.performance.score * 100,
        accessibility: data.lighthouseResult.categories.accessibility.score * 100,
        bestPractices: data.lighthouseResult.categories['best-practices'].score * 100,
        seo: data.lighthouseResult.categories.seo.score * 100
    };

    renderChart(scores);
}

function renderChart(scores) {
    const ctx = document.getElementById('scoreChart').getContext('2d');
 
    if(window.myChart) window.myChart.destroy();

    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Performance', 'Accessibility', 'Best Practices', 'SEO'],
            datasets: [{
                label: 'Lighthouse Score',
                data: [scores.performance, scores.accessibility, scores.bestPractices, scores.seo],
                backgroundColor: ['#ff4e42', '#ffa400', '#00c345', '#00b0ff']
            }]
        },
        options: {
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });
}

function toggleLoading(show) {
    document.getElementById('loading').classList.toggle('hidden', !show);
}