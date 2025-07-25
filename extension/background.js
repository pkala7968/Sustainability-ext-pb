// background.js
// Handles communication between content script and popup if needed

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchEcoScore") {
        fetch('http://localhost:8000/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request.productInfo)
        })
        .then(response => response.json())
        .then(data => sendResponse({ result: data }))
        .catch(error => sendResponse({ error: error.toString() }));
        // Required for async response
        return true;
    }
});
