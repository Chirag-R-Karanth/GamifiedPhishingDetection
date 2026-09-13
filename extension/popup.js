document.addEventListener("DOMContentLoaded", async () => {
  const tabScan = document.getElementById("tab-scan");
  const tabSettings = document.getElementById("tab-settings");
  const contentScan = document.getElementById("content-scan");
  const contentSettings = document.getElementById("content-settings");
  
  const mailSender = document.getElementById("mail-sender");
  const mailSubject = document.getElementById("mail-subject");
  const btnScan = document.getElementById("btn-scan");
  const scanLoader = document.getElementById("scan-loader");
  
  const resultHud = document.getElementById("result-hud");
  const resultCircle = document.getElementById("result-circle");
  const resultScore = document.getElementById("result-score");
  const resultBanner = document.getElementById("result-banner");
  const reasonsList = document.getElementById("reasons-list");
  
  const tokenInput = document.getElementById("token-input");
  const btnSaveSettings = document.getElementById("btn-save-settings");
  const apiStatus = document.getElementById("api-status");
  
  let capturedEmailData = null;

  // 1. Setup Tab Switching
  tabScan.addEventListener("click", () => {
    tabScan.classList.add("active");
    tabSettings.classList.remove("active");
    contentScan.classList.add("active");
    contentSettings.classList.remove("active");
  });

  tabSettings.addEventListener("click", () => {
    tabSettings.classList.add("active");
    tabScan.classList.remove("active");
    contentSettings.classList.add("active");
    contentScan.classList.remove("active");
  });

  // 2. Load Saved Token from Storage
  chrome.storage.local.get(["token"], (result) => {
    if (result.token) {
      tokenInput.value = result.token;
    }
  });

  btnSaveSettings.addEventListener("click", () => {
    const rawToken = tokenInput.value.trim();
    // Support typing Bearer prefix or not
    const token = rawToken.startsWith("Bearer ") ? rawToken.split(" ")[1] : rawToken;
    chrome.storage.local.set({ token }, () => {
      alert("Platform token configuration updated.");
      tabScan.click();
    });
  });

  // 3. Ping local backend api status
  async function checkApiStatus() {
    try {
      const res = await fetch("http://localhost:5001/");
      if (res.ok) {
        apiStatus.innerText = "API: ONLINE";
        apiStatus.style.borderColor = "#00ff66";
        apiStatus.style.color = "#00ff66";
      }
    } catch (err) {
      apiStatus.innerText = "API: OFFLINE";
      apiStatus.style.borderColor = "#ff3b30";
      apiStatus.style.color = "#ff3b30";
    }
  }
  checkApiStatus();

  // 4. Request email content from injected content script
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: "GET_EMAIL_CONTENT" }, (response) => {
        if (chrome.runtime.lastError) {
          mailSender.innerText = "Please refresh the page to allow the extension to inject.";
          return;
        }
        
        if (response && response.success) {
          capturedEmailData = response.data;
          
          // Display short preview
          mailSender.innerHTML = `<span>From:</span> ${escapeHtml(capturedEmailData.sender)}`;
          mailSubject.innerHTML = `<span>Subj:</span> ${escapeHtml(capturedEmailData.subject)}`;
          
          // Enable trigger button
          btnScan.removeAttribute("disabled");
        } else {
          mailSender.innerText = "No email body container active on tab.";
        }
      });
    } else {
      mailSender.innerText = "No active tab detected.";
    }
  } catch (err) {
    console.error("Popup activation failure:", err);
    mailSender.innerText = "Active browser tab evaluation failed.";
  }

  // 5. Submit Scan Execution
  btnScan.addEventListener("click", async () => {
    if (!capturedEmailData) return;

    try {
      btnScan.style.display = "none";
      scanLoader.style.display = "block";
      resultHud.style.display = "none";
      reasonsList.innerHTML = "";

      // Load token from storage
      const storage = await new Promise(resolve => chrome.storage.local.get(["token"], resolve));
      const token = storage.token;

      const headers = {
        "Content-Type": "application/json"
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Execute scan API
      const res = await fetch("http://localhost:5001/api/emails/scan", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(capturedEmailData)
      });

      if (!res.ok) {
        throw new Error(`Inference fail: ${res.statusText}`);
      }

      const scanResult = await res.json();
      
      // Update UI Result Details
      resultScore.innerText = `${scanResult.riskScore}%`;
      
      if (scanResult.finalPrediction === "phishing") {
        resultCircle.className = "risk-circle phishing";
        resultBanner.innerText = "HIGH RISK PHISHING";
        resultBanner.className = "result-banner result-phishing";
      } else {
        resultCircle.className = "risk-circle safe";
        resultBanner.innerText = "SAFE / SECURE";
        resultBanner.className = "result-banner result-safe";
      }

      // Populate explanations
      if (scanResult.explanation && scanResult.explanation.length > 0) {
        scanResult.explanation.forEach(exp => {
          const li = document.createElement("li");
          li.innerHTML = `<strong>${escapeHtml(exp.feature)} (${escapeHtml(exp.impact)}):</strong> ${escapeHtml(exp.description)}`;
          reasonsList.appendChild(li);
        });
      } else {
        const li = document.createElement("li");
        li.innerText = "Semantic vectors verified safe. No suspicious features triggered.";
        reasonsList.appendChild(li);
      }

      resultHud.style.display = "block";

    } catch (err) {
      console.error(err);
      alert(`Threat scan connection failed: ${err.message}`);
      btnScan.style.display = "block";
    } finally {
      scanLoader.style.display = "none";
    }
  });

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
});
