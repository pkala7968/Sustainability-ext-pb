chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'materialsDetected') {
    chrome.tabs.sendMessage(sender.tab.id, {
      type: 'showMaterialPrompt',
      findings: message.findings
    });
  }
});