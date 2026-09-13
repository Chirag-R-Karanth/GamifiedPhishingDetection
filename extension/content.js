// Listen for scan scan requests from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_EMAIL_CONTENT") {
    try {
      const emailData = extractEmailDetails();
      sendResponse({ success: true, data: emailData });
    } catch (err) {
      console.error("PhishQuest parsing error:", err);
      sendResponse({ success: false, error: err.message });
    }
  }
  return true; // Keep response channel open for async returns
});

function extractEmailDetails() {
  const url = window.location.href;
  
  if (url.includes("mail.google.com")) {
    return parseGmail();
  } else if (url.includes("outlook.live.com") || url.includes("outlook.office")) {
    return parseOutlook();
  } else {
    return parseGeneric();
  }
}

// GMAIL DOM PARSER
function parseGmail() {
  // 1. Get Subject
  let subject = "";
  const subjectEl = document.querySelector("h1.ha, h2.hP, .hP");
  if (subjectEl) {
    subject = subjectEl.innerText.trim();
  }

  // 2. Get Sender
  let sender = "";
  // Gmail stores sender emails in 'email' attribute of gD elements
  const senderEl = document.querySelector("span.gD[email], span[email]");
  if (senderEl) {
    const emailAttr = senderEl.getAttribute("email");
    const nameText = senderEl.innerText.trim();
    sender = emailAttr ? `${nameText} <${emailAttr}>` : nameText;
  } else {
    // Fallback: look for span with class 'go' which displays sender email address
    const emailFallback = document.querySelector(".gD, .go");
    if (emailFallback) {
      sender = emailFallback.innerText.trim();
    }
  }

  // 3. Get Body and Links
  let body = "";
  const links = [];
  // Gmail message bodies are inside '.a3s' container
  const bodyEl = document.querySelector(".a3s");
  if (bodyEl) {
    body = bodyEl.innerText.trim();
    
    // Extract hyperlinks from body container
    const linkEls = bodyEl.querySelectorAll("a[href]");
    linkEls.forEach(el => {
      const href = el.getAttribute("href");
      if (href && !href.startsWith("mailto:") && !links.includes(href)) {
        links.push(href);
      }
    });
  }

  // 4. Get Attachments
  const attachments = [];
  // Gmail attachments are displayed in div with class 'aYy' or 'aZx'
  const attachmentEls = document.querySelectorAll(".aYy, .aZx, [role='listitem'] .aYy");
  attachmentEls.forEach(el => {
    const filename = el.innerText.trim();
    if (filename && !attachments.includes(filename)) {
      attachments.push(filename);
    }
  });

  return {
    sender: sender || "unknown-sender@gmail-fallback.com",
    subject: subject || "No Subject Intercepted",
    body: body || "Empty message body or parsing block restricted.",
    links: links,
    attachments: attachments,
    timestamp: new Date().toISOString()
  };
}

// OUTLOOK WEB DOM PARSER
function parseOutlook() {
  // 1. Get Subject
  let subject = "";
  const subjectEl = document.querySelector("[role='heading'][aria-level='2'], .wd4y, h1, h2");
  if (subjectEl) {
    subject = subjectEl.innerText.trim();
  }

  // 2. Get Sender
  let sender = "";
  // Outlook often displays sender in elements with title or inside sender headers
  const senderEl = document.querySelector("span[title*='@'], [data-test-id='sender'], [class*='Sender']");
  if (senderEl) {
    sender = senderEl.getAttribute("title") || senderEl.innerText.trim();
  } else {
    // Attempt search of elements with class showing email address patterns
    const allSpans = document.querySelectorAll("span");
    for (const span of allSpans) {
      const text = span.innerText;
      if (text.includes("@") && text.includes("<")) {
        sender = text.trim();
        break;
      }
    }
  }

  // 3. Get Body & Links
  let body = "";
  const links = [];
  // Outlook bodies typically have class messageBody, dLw47, or role='document'
  const bodyEl = document.querySelector("[role='document'], .dLw47, div[class*='messageBody'], [aria-label='Message body']");
  if (bodyEl) {
    body = bodyEl.innerText.trim();
    
    const linkEls = bodyEl.querySelectorAll("a[href]");
    linkEls.forEach(el => {
      const href = el.getAttribute("href");
      if (href && !href.startsWith("mailto:") && !links.includes(href)) {
        links.push(href);
      }
    });
  }

  // 4. Get Attachments
  const attachments = [];
  const attachmentEls = document.querySelectorAll("[data-test-id='attachment'], [class*='attachment'], [aria-label*='attachment']");
  attachmentEls.forEach(el => {
    const text = el.innerText.trim();
    if (text && !attachments.includes(text)) {
      attachments.push(text);
    }
  });

  return {
    sender: sender || "unknown-sender@outlook-fallback.com",
    subject: subject || "No Subject Intercepted",
    body: body || "Empty message body or parsing block restricted.",
    links: links,
    attachments: attachments,
    timestamp: new Date().toISOString()
  };
}

// GENERIC FALLBACK PARSER (Useful for raw view or other clients)
function parseGeneric() {
  // Regex to scrape any email on the page as sender candidate
  const textOnPage = document.body.innerText;
  const emails = textOnPage.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi) || [];
  const sender = emails.length > 0 ? emails[0] : "guest-operator@localhost";
  
  return {
    sender: sender,
    subject: document.title || "Generic Subject Webmail",
    body: "Plain text mode: " + textOnPage.slice(0, 1000),
    links: [],
    attachments: [],
    timestamp: new Date().toISOString()
  };
}
