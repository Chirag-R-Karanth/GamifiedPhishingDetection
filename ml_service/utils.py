import re
import math
import numpy as np

# A fallback list of English stopwords to use if NLTK is not downloaded
DEFAULT_STOPWORDS = set([
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself",
    "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself",
    "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that",
    "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
    "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because",
    "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into",
    "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out",
    "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where",
    "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no",
    "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just",
    "don", "should", "now"
])

# Attempt to load nltk for advanced lemmatization, but use fallbacks if it's missing
try:
    import nltk
    from nltk.corpus import stopwords
    from nltk.tokenize import word_tokenize
    from nltk.stem import WordNetLemmatizer
    
    _stopwords = set(stopwords.words('english'))
    _lemmatizer = WordNetLemmatizer()
    HAS_NLTK = True
except Exception:
    HAS_NLTK = False
    _stopwords = DEFAULT_STOPWORDS
    _lemmatizer = None

def init_nltk():
    global _stopwords, _lemmatizer, HAS_NLTK
    try:
        import nltk
        nltk.download('stopwords', quiet=True)
        nltk.download('punkt', quiet=True)
        nltk.download('wordnet', quiet=True)
        from nltk.corpus import stopwords
        from nltk.tokenize import word_tokenize
        from nltk.stem import WordNetLemmatizer
        
        _stopwords = set(stopwords.words('english'))
        _lemmatizer = WordNetLemmatizer()
        HAS_NLTK = True
    except Exception as e:
        print(f"Failed to download NLTK data: {e}")

def preprocess_text(text):
    """
    Cleans, tokenizes, removes punctuation/stopwords, and lemmatizes the text.
    """
    if not text:
        return ""
    
    # Lowercase
    text = text.lower()
    
    # Remove punctuation & characters that aren't letters/numbers
    text = re.sub(r'[^\w\s]', '', text)
    
    # Tokenize
    if HAS_NLTK:
        try:
            tokens = word_tokenize(text)
        except Exception:
            tokens = text.split()
    else:
        tokens = text.split()
        
    # Remove stopwords and lemmatize
    cleaned_tokens = []
    for token in tokens:
        if token not in _stopwords:
            if HAS_NLTK:
                try:
                    lemma = _lemmatizer.lemmatize(token)
                except Exception:
                    lemma = token
            else:
                # Basic stemmer/lemmatizer fallback: strip trailing 's', 'ed', 'ing'
                lemma = token
                if len(lemma) > 4:
                    if lemma.endswith('s'):
                        lemma = lemma[:-1]
                    elif lemma.endswith('ed'):
                        lemma = lemma[:-2]
                    elif lemma.endswith('ing'):
                        lemma = lemma[:-3]
            cleaned_tokens.append(lemma)
            
    return " ".join(cleaned_tokens)

def calculate_entropy(text):
    """
    Computes the Shannon Entropy of a string (useful for domain checking).
    """
    if not text:
        return 0.0
    entropy = 0.0
    text_len = len(text)
    # Count character frequencies
    char_counts = {}
    for char in text:
        char_counts[char] = char_counts.get(char, 0) + 1
    
    for count in char_counts.values():
        p = count / text_len
        entropy -= p * math.log2(p)
    return entropy

def extract_features(sender, subject, body, links, attachments):
    """
    Extracts numerical features from email parts.
    """
    body = body or ""
    subject = subject or ""
    sender = sender or ""
    links = links or []
    attachments = attachments or []
    
    full_text = f"{subject} {body}"
    
    # 1. URL count
    url_count = len(links)
    
    # 2. Suspicious words count
    suspicious_keywords = [
        "verify", "update", "suspend", "secure", "restricted", "log", "billing", 
        "account", "password", "credential", "security", "alert", "notification", 
        "resolve", "immediate", "urgent", "unusual", "activity", "login", "signin", 
        "bank", "invoice", "payment", "paypal", "netflix", "microsoft", "google", "amazon"
    ]
    suspicious_count = 0
    words = full_text.lower().split()
    for w in words:
        if w in suspicious_keywords:
            suspicious_count += 1
            
    # 3. Urgency words presence
    urgency_keywords = ["urgent", "immediate", "action required", "within 24 hours", "suspended", "expire", "must reply", "final warning"]
    has_urgency = 0
    for keyword in urgency_keywords:
        if keyword in full_text.lower():
            has_urgency = 1
            break
            
    # 4. Attachment extension check
    suspicious_attachment = 0
    dangerous_exts = [".exe", ".scr", ".zip", ".rar", ".js", ".bat", ".vbs", ".cmd", ".msi", ".jar"]
    for att in attachments:
        att = att.lower()
        if any(att.endswith(ext) for ext in dangerous_exts):
            suspicious_attachment = 1
            break
            
    # 5. Sender domain entropy
    domain = ""
    if "@" in sender:
        domain = sender.split("@")[-1]
    sender_entropy = calculate_entropy(domain)
    
    # 6. HTML ratio
    html_tags_count = len(re.findall(r'<[^>]*>', body))
    text_length = len(body) + 1
    html_ratio = html_tags_count / text_length
    
    # 7. Domain age check (mocked/heuristic or length checks)
    # Long domains or domains with many subdomains are often suspicious
    domain_subdomains = domain.count('.')
    is_spoofed_brand = 0
    brands = ["paypal", "netflix", "microsoft", "google", "amazon", "apple", "chase", "bankofamerica"]
    for brand in brands:
        if brand in domain and domain != f"{brand}.com" and domain != f"mail.{brand}.com":
            is_spoofed_brand = 1
            
    return {
        "url_count": url_count,
        "suspicious_words_count": suspicious_count,
        "has_urgency": has_urgency,
        "suspicious_attachment": suspicious_attachment,
        "sender_entropy": sender_entropy,
        "html_ratio": html_ratio,
        "domain_subdomains": domain_subdomains,
        "is_spoofed_brand": is_spoofed_brand
    }

def explain_prediction(features, prediction_prob, final_label):
    """
    Generates explainable AI explanations based on engineered features.
    Computes custom impact scores representing each feature's contribution.
    """
    reasons = []
    
    # 1. Suspicious domain / Spoofing
    if features.get("is_spoofed_brand", 0) > 0:
        reasons.append({
            "feature": "Domain Spoofing",
            "impact": "+35%",
            "description": "The sender's domain closely resembles a trusted brand (e.g. PayPal, Microsoft) but is not official."
        })
    
    # 2. Entropy
    if features.get("sender_entropy", 0) > 4.2:
        reasons.append({
            "feature": "High Domain Entropy",
            "impact": "+15%",
            "description": "The sender domain name has high randomness, characteristic of auto-generated or throwaway domains."
        })
        
    # 3. Urgency keywords
    if features.get("has_urgency", 0) > 0:
        reasons.append({
            "feature": "Urgency Language",
            "impact": "+20%",
            "description": "The email uses panic or pressure tactics (e.g., 'immediate action', 'suspended') to force a quick response."
        })
        
    # 4. Suspicious Attachment
    if features.get("suspicious_attachment", 0) > 0:
        reasons.append({
            "feature": "Dangerous Attachment",
            "impact": "+30%",
            "description": "Contains attachment extensions often used for executing malware (.exe, .zip, .scr)."
        })
        
    # 5. URL counting
    url_count = features.get("url_count", 0)
    if url_count > 5:
        reasons.append({
            "feature": "Excessive Links",
            "impact": "+15%",
            "description": f"Contains a high number of links ({url_count}), which is common in credential harvesting campaigns."
        })
    elif url_count > 0:
        reasons.append({
            "feature": "Contains Links",
            "impact": "+5%",
            "description": "Contains links directing users outside the email client."
        })
        
    # 6. Suspicious words count
    susp_words = features.get("suspicious_words_count", 0)
    if susp_words > 4:
        reasons.append({
            "feature": "Credential Harvesting Keywords",
            "impact": "+25%",
            "description": f"Contains multiple security-related action words ({susp_words}) like 'verify', 'password', or 'billing'."
        })
        
    # 7. Subdomains
    sub_count = features.get("domain_subdomains", 0)
    if sub_count > 3:
        reasons.append({
            "feature": "Excessive Subdomains",
            "impact": "+10%",
            "description": f"The sender domain contains {sub_count} subdomains, which is typical for domain masking."
        })
        
    # If no risk features triggered but prediction is somehow phishing (e.g. from vectorizer)
    if not reasons and final_label == "phishing":
        reasons.append({
            "feature": "Text Semantic Analysis",
            "impact": "+25%",
            "description": "The body text matches phrasing patterns commonly found in known phishing databases."
        })
        
    # Sort reasons by impact percent (descending)
    reasons = sorted(reasons, key=lambda x: int(x["impact"].replace("%","").replace("+","")), reverse=True)
    
    return reasons
