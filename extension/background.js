// PhishQuest Chrome Extension Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log("PhishQuest Shield extension installed and active.");
});

// Listener for background actions
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "LOG_EVENT") {
    console.log(`[Extension Event]: ${message.details}`);
    sendResponse({ status: "logged" });
  }
  return true;
});
