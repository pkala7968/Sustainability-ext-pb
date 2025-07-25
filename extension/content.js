function extractProductInfo() {
    // Amazon example selectors
    const title = document.getElementById('productTitle')?.innerText.trim() || '';
    const description = document.getElementById('productDescription')?.innerText.trim() || '';
    const bullets = Array.from(document.querySelectorAll('#feature-bullets ul li'))
        .map(li => li.innerText.trim()).filter(Boolean);
    return { title, description, bullet_points: bullets };
}

async function getEcoScore(productInfo) {
    const response = await fetch('http://localhost:8000/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productInfo)
    });
    return response.json();
}

function injectWidget(score, breakdown, reasoning) {
    const existing = document.getElementById('eco-score-widget');
    if (existing) existing.remove();

    const widget = document.createElement('div');
    widget.id = 'eco-score-widget';
    widget.style = `
        position:fixed;
        top:20px;
        right:20px;
        z-index:99999;
        background:#e8f5e9;
        padding:14px;
        border:2px solid #4caf50;
        border-radius:8px;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        font-size:14px;
        color:#2e7d32;
        max-width:300px;
        line-height:1.4;
    `;
    widget.innerHTML = `
        <strong>Eco Score: ${score}/5</strong><br>
        <strong>Materials:</strong> ${breakdown.join(', ')}<br>
        <strong>Why:</strong> <i>${reasoning}</i>
    `;
    document.body.appendChild(widget);
}

(async function() {
    if (window.location.hostname.includes('amazon.com')) {
        const info = extractProductInfo();
        if (info.title) {
            const result = await getEcoScore(info);
            injectWidget(result.score, result.material_breakdown, result.reasoning);
        }
    }
})();