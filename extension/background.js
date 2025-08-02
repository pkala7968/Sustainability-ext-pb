chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "analyze_product") {
    console.log("Received analyze_product request for URL:", message.url);  // ✅ DEBUG LOG
    // fetch("http://localhost:8000/analyze-product", {
    fetch("https://backend-wild-flower-7389.fly.dev/analyze-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: message.url })
    })
      .then(res => {
        if (!res.ok) throw new Error("Bad response: " + res.status);
        return res.json();
      })
      .then(data => sendResponse(data))
      .catch(err => sendResponse({ error: err.message }));

    return true; // Keep response channel open
  }
});