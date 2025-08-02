(async () => {
  const productUrl = window.location.href;

  // Avoid injecting multiple times
  if (document.getElementById("eco-score-loader")) return;

  const loader = document.createElement('div');
  loader.id = "eco-score-loader";
  loader.innerText = "Analyzing eco score...";
  Object.assign(loader.style, {
    position: 'fixed',
    top: '10px',
    right: '10px',
    background: '#fff',
    padding: '10px 14px 14px 14px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    zIndex: 9999,
    fontSize: '14px',
    maxWidth: '320px',
    lineHeight: '1.4',
    fontFamily: 'Arial, sans-serif',
  });

  document.body.appendChild(loader);

  const renderResult = (ecoScore) => {
    loader.innerHTML = `
      <div style="position: relative;">
        <button id="close-eco-score" style="
          position: absolute;
          top: -8px;
          right: -8px;
          background: #eee;
          border: none;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          font-size: 16px;
          cursor: pointer;
        ">&times;</button>

        ♻️ <strong>Eco Score:</strong> ${ecoScore.score || "N/A"}<br>
        <strong>Materials:</strong> ${ecoScore.material_breakdown?.join(', ') || "Not found"}<br>
        <strong>Why:</strong> ${ecoScore.reasoning || "No reasoning provided"}<br>
        ${ecoScore.alt_product ? `
          <br><em>Try this instead:</em><br>
          <a href="${ecoScore.alt_product.url}" target="_blank" style="text-decoration: none;">
            <strong>${ecoScore.alt_product.brand}</strong> — ${ecoScore.alt_product.materials}<br>
            <img src="${ecoScore.alt_product.image_url}" alt="${ecoScore.alt_product.brand}" width="120" style="margin-top: 6px; border-radius: 6px;" />
          </a>
        ` : ""}
      </div>
    `;

    // Add close functionality
    const closeBtn = document.getElementById("close-eco-score");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => loader.remove());
    }
  };

  try {
    chrome.runtime.sendMessage(
      { action: "analyze_product", url: productUrl },
      (ecoScore) => {
        if (chrome.runtime.lastError) {
          loader.innerText = "⚠️ Eco score error: " + chrome.runtime.lastError.message;
          return;
        }

        if (!ecoScore || ecoScore.error) {
          loader.innerText = "⚠️ Eco score failed: " + (ecoScore?.error || "No response");
          return;
        }

        renderResult(ecoScore);
      }
    );
  } catch (err) {
    loader.innerText = "⚠️ Unexpected error: " + err.message;
    console.error("Eco score error:", err);
  }
})();