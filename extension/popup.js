// Helper: extract product info from the page via content script
function getProductInfoFromTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return reject("No active tab found");

      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => {
            const hostname = window.location.hostname;
            let title = '', description = '', bullet_points = [];

            if (hostname.includes('amazon')) {
              title = document.getElementById('productTitle')?.innerText.trim() || '';
              description = document.getElementById('productDescription')?.innerText.trim() || '';
              bullet_points = Array.from(document.querySelectorAll('#feature-bullets ul li'))
                .map(li => li.innerText.trim()).filter(Boolean);

            } else if (hostname.includes('flipkart')) {
              // Flipkart title
              title = document.querySelector('span.B_NuCI')?.innerText.trim() ||
                      document.querySelector('span.VU-ZEz')?.innerText.trim() || '';

              // Flipkart bullet points
              bullet_points = Array.from(document.querySelectorAll('li._21Ahn-'))
                .map(li => li.innerText.trim()).filter(Boolean);

              // Specs (general info)
              const specs = Array.from(document.querySelectorAll('div._1QJc5I'))
                .map(el => el.innerText.trim()).filter(Boolean);

              description = specs.join('. ');
              bullet_points = bullet_points.concat(specs);

            } else if (hostname.includes('walmart')) {
              title = document.getElementById('main-title')?.innerText.trim() || '';
              const specs = Array.from(document.querySelectorAll('div.ph3 bg-white br3 pt1 pa2'))
                .map(el => el.innerText.trim()).filter(Boolean);

              description = specs.join('. ');
              bullet_points = Array.from(document.querySelectorAll('.mt0 ul li'))
                .map(li => li.innerText.trim()).filter(Boolean);

            } else if (hostname.includes('snapdeal')) {
              const titleElement = document.querySelector('h1[itemprop="name"]');
              const title = titleElement ? titleElement.innerText.trim() : '';

              const specs = Array.from(document.querySelectorAll('div[itemprop="description"] p'))
                .map(el => el.innerText.trim()).filter(Boolean);
              description = specs.join('. ');

              bullet_points = Array.from(document.querySelectorAll('.dtls-list clear ul li'))
                .map(li => li.innerText.trim()).filter(Boolean);
            }

            return { title, description, bullet_points };
          }
        },
        (results) => {
          if (chrome.runtime.lastError) {
            reject("Script error: " + chrome.runtime.lastError.message);
          } else if (results && results[0]/*&& results[0].result*/) {
            resolve(results[0].result);
          } else {
            reject("No product info found");
          }
        }
      );
    });
  });
}


// Call backend API
async function fetchEcoScore(productInfo) {
    const response = await fetch('https://backend-wild-flower-7389.fly.dev/score', {
    // const response = await fetch('http://localhost:8000/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productInfo)
    });
    return response.json();
}

// UI logic
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('analyze-btn').addEventListener('click', async () => {
      const loader = document.getElementById('loader');
      const resultDiv = document.getElementById('result');

      // Show loader and hide result initially
      loader.style.display = 'block';
      resultDiv.style.display = 'none';

      try {
          const productInfo = await getProductInfoFromTab();

          if (!productInfo.title) {
              loader.style.display = 'none';
              resultDiv.innerHTML = "No product info found on this page.";
              resultDiv.style.display = 'block';
              return;
          }

          const ecoScore = await fetchEcoScore(productInfo);
          console.log("Backend response:", ecoScore);

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
          }else {
            document.getElementById('alternative').innerHTML = "";
          }
          
          loader.style.display = 'none';
          resultDiv.style.display = 'block';
      } catch (err) {
          console.error("Error:", err);
          loader.style.display = 'none';
          resultDiv.innerHTML = "Error: " + err;
          resultDiv.style.display = 'block';
      }
  });
});