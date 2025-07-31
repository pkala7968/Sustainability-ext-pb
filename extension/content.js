// --- Eco Score Knowledge Base ---
const knowledgeBase = {
  "polyester": "Polyester is non-biodegradable and derived from fossil fuels.",
  "organic cotton": "Organic cotton is biodegradable and considered eco-friendly.",
  "pvc": "PVC contains harmful chemicals and is hard to recycle.",
  "recycled aluminum": "Recycled aluminum is highly sustainable.",
  "bamboo": "Bamboo is a fast-growing, renewable resource.",
  "leather": "Leather involves animal cruelty and chemical processing, though it is durable.",
  "recycled plastic": "Recycled plastic is better than virgin plastic but still not biodegradable.",
  "glass": "Glass is recyclable and inert, making it environmentally friendly.",
  "wool": "Wool is natural and biodegradable but involves animal welfare concerns.",
  "acrylic": "Acrylic is synthetic, non-biodegradable, and derived from petroleum.",
  "hemp": "Hemp is highly sustainable and requires little water or pesticides.",
  "linen": "Linen is biodegradable and made from flax, which grows with low impact.",
  "tencel": "Tencel (lyocell) is biodegradable and produced with sustainable processes.",
  "lyocell": "Tencel (lyocell) is biodegradable and produced with sustainable processes.",
  "rayon": "Rayon is semi-synthetic and its sustainability depends on production methods.",
  "steel": "Steel is recyclable and long-lasting but energy intensive to produce.",
  "plastic packaging": "Plastic packaging is usually single-use and non-biodegradable.",
  "bioplastics": "Bioplastics are marketed as eco-friendly but can still be industrially processed.",
  "natural rubber": "Natural rubber is biodegradable and renewable.",
  "faux leather": "Faux leather is synthetic and often made from PVC or PU, which are not eco-friendly.",
  "aluminum foil": "Aluminum foil is recyclable but energy-intensive to produce."
};

// --- Extract product info from supported sites ---
function extractRelevantProductInfo() {
  const hostname = window.location.hostname;
  let title = '', description = '', bullet_points = [];

  if (hostname.includes('amazon')) {
    title = document.getElementById('productTitle')?.innerText.trim() || '';
    description = document.getElementById('productDescription')?.innerText.trim() || '';
    bullet_points = Array.from(document.querySelectorAll('#feature-bullets ul li'))
      .map(li => li.innerText.trim()).filter(Boolean);

  } else if (hostname.includes('flipkart')) {
    title = document.querySelector('span.B_NuCI')?.innerText.trim() ||
            document.querySelector('span.VU-ZEz')?.innerText.trim() || '';

    bullet_points = Array.from(document.querySelectorAll('li._21Ahn-'))
      .map(li => li.innerText.trim()).filter(Boolean);

    const specs = Array.from(document.querySelectorAll('div._1QJc5I'))
      .map(el => el.innerText.trim()).filter(Boolean);

    description = specs.join('. ');
    bullet_points = bullet_points.concat(specs);

  } else if (hostname.includes('walmart')) {
    title = document.getElementById('main-title')?.innerText.trim() || '';
    const specs = Array.from(document.querySelectorAll('div.ph3.bg-white.br3.pt1.pa2'))
      .map(el => el.innerText.trim()).filter(Boolean);

    description = specs.join('. ');
    bullet_points = Array.from(document.querySelectorAll('.mt0 ul li'))
      .map(li => li.innerText.trim()).filter(Boolean);

  } else if (hostname.includes('snapdeal')) {
    title = document.querySelector('h1[itemprop="name"]')?.innerText.trim() || '';

    const specs = Array.from(document.querySelectorAll('div[itemprop="description"] p'))
      .map(el => el.innerText.trim()).filter(Boolean);

    description = specs.join('. ');

    bullet_points = Array.from(document.querySelectorAll('.dtls-list.clear ul li'))
      .map(li => li.innerText.trim()).filter(Boolean);
  }

  return { title, description, bullet_points };
}

function detectMaterials(texts) {
  const text = texts.join(' ').toLowerCase();
  const found = [];

  for (const material in knowledgeBase) {
    if (text.includes(material.toLowerCase())) {
      found.push([material, knowledgeBase[material]]);
    }
  }

  return found;
}

// function detectMaterials(texts) {
//   const combinedText = texts.join(' ').toLowerCase();

//   // Generate 1–3 word phrases
//   const phrases = [];
//   const tokens = combinedText.split(/\s+/);
//   for (let len = 1; len <= 3; len++) {
//     for (let i = 0; i <= tokens.length - len; i++) {
//       phrases.push(tokens.slice(i, i + len).join(' '));
//     }
//   }

//   const fuse = new Fuse(Object.keys(knowledgeBase), {
//     includeScore: true,
//     threshold: 0.4,
//   });

//   const found = [];

//   for (const phrase of phrases) {
//     const results = fuse.search(phrase);
//     if (results.length > 0 && results[0].score < 0.4) {
//       const material = results[0].item;
//       const reason = knowledgeBase[material];
//       if (!found.some(([m]) => m === material)) {
//         found.push([material, reason]);
//       }
//     }
//   }

//   return found;
// }

// --- Show eco material popup on page ---
function showMaterialPrompt(findings) {
  const items = findings.map(
    f => `<li><b>${f[0]}</b>: ${f[1]}</li>`
  ).join('');

  const promptDiv = document.createElement('div');
  promptDiv.id = 'ecoMaterialPrompt';
  promptDiv.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #fefefe;
      border: 2px solid #4caf50;
      padding: 16px;
      border-radius: 10px;
      font-size: 14px;
      z-index: 999999;
      max-width: 340px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-family: sans-serif;
      line-height: 1.5;
    ">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>🌱 <b>We detected eco-relevant materials:</b></div>
        <button id="ecoCloseBtn" style="
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          margin-left: 8px;
        " title="Close">&times;</button>
      </div>
      <ul style="margin-top: 10px; padding-left: 18px;">${items}</ul>
      <button id="ecoRunScanBtn" style="
        margin-top: 12px;
        padding: 8px 14px;
        border: none;
        background-color: #4caf50;
        color: white;
        border-radius: 5px;
        cursor: pointer;
      ">
        Analyze Full Eco Score
      </button>
    </div>
  `;

  document.body.appendChild(promptDiv);

  // Button listeners
  document.getElementById('ecoRunScanBtn').addEventListener('click', () => {
    alert("Click the EcoScore extension icon in your browser toolbar to scan this page.");
  });

  document.getElementById('ecoCloseBtn').addEventListener('click', () => {
    const el = document.getElementById('ecoMaterialPrompt');
    if (el) el.remove();
  });
}

// --- Auto-trigger detection on page load ---
(function autoDetectAndShow() {
  const { title, description, bullet_points } = extractRelevantProductInfo();
  const findings = detectMaterials([title, description, ...bullet_points]);

  if (findings.length > 0) {
    showMaterialPrompt(findings);
    chrome.runtime.sendMessage({
      type: 'materialsDetected',
      findings: { title, description, bullet_points }
    });
  }
})();

// --- Listen for manual trigger from popup ---
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'runScan') {
    const info = extractRelevantProductInfo();
    chrome.runtime.sendMessage({
      type: 'materialsDetected',
      findings: info
    });
  }
});