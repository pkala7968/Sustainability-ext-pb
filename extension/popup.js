async function fetchEcoScoreFromURL(url) {
  // const response = await fetch('http://localhost:8000/analyze-product', {
  const response = await fetch('https://backend-wild-flower-7389.fly.dev/analyze-product', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  return response.json();
}

document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById('loader');
  const resultDiv = document.getElementById('result');
  const closeBtn = document.getElementById('close-result');

  document.getElementById('analyze-btn').addEventListener('click', async () => {
    loader.style.display = 'block';
    resultDiv.style.display = 'none';

    try {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const url = tabs[0]?.url;
        if (!url) throw new Error("No active tab URL");

        const ecoScore = await fetchEcoScoreFromURL(url);
        console.log("Backend response:", ecoScore);

        if (ecoScore.error) throw new Error(ecoScore.error);

        document.getElementById('score').textContent = ecoScore.score || "N/A";
        document.getElementById('materials').textContent = (ecoScore.material_breakdown || []).join(', ') || "Not found";
        document.getElementById('reasoning').textContent = ecoScore.reasoning || "No reasoning provided.";

        if (ecoScore.alt_product) {
          const alt = ecoScore.alt_product;
          document.getElementById('alternative').innerHTML = `
            Try this instead:<br>
            <a href="${alt.url}" target="_blank">
              <strong>${alt.brand}</strong> — ${alt.materials}<br>
              <img src="${alt.image_url}" alt="${alt.brand}" width="120" style="margin-top: 6px; border-radius: 6px;" />
            </a>
          `;
        } else {
          document.getElementById('alternative').innerHTML = "";
        }

        loader.style.display = 'none';
        resultDiv.style.display = 'block';
      });
    } catch (err) {
      loader.style.display = 'none';
      resultDiv.innerHTML = "Error: " + err.message;
      resultDiv.style.display = 'block';
      console.error(err);
    }
  });

  closeBtn.addEventListener('click', () => {
    window.close();  // This will close the Chrome Extension popup
  });
});
