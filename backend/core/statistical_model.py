"""
Statistical Learning Module (Modules VIII & IX)
─────────────────────────────────────────────────
Implements a Naive-Bayes-inspired probabilistic risk scorer that evaluates
email text against multiple heuristic feature vectors:
  • Urgency word frequency
  • ALL-CAPS ratio
  • Suspicious link patterns
  • Financial / credential keywords
  • Sender domain mismatch indicators
"""

import re
import math
from typing import Dict, List, Tuple

# ──────────────────────────────────────────────────────────────
#  Feature Dictionaries  (weights calibrated via prior research)
# ──────────────────────────────────────────────────────────────

URGENCY_WORDS: Dict[str, float] = {
    "urgent": 0.85, "immediately": 0.80, "act now": 0.90,
    "expire": 0.75, "suspended": 0.82, "verify": 0.70,
    "confirm": 0.65, "deadline": 0.72, "limited time": 0.88,
    "warning": 0.78, "alert": 0.74, "attention": 0.68,
    "asap": 0.80, "hurry": 0.76, "within 24 hours": 0.92,
    "within 48 hours": 0.88, "final notice": 0.91,
    "last chance": 0.89, "account will be": 0.83,
    "action required": 0.87, "respond immediately": 0.90,
    "do not ignore": 0.85, "time sensitive": 0.86,
}

FINANCIAL_KEYWORDS: Dict[str, float] = {
    "bank": 0.60, "credit card": 0.72, "social security": 0.90,
    "password": 0.78, "ssn": 0.92, "pin": 0.70,
    "wire transfer": 0.88, "bitcoin": 0.80, "crypto": 0.75,
    "paypal": 0.65, "routing number": 0.90, "account number": 0.85,
    "tax refund": 0.82, "irs": 0.78, "lottery": 0.88,
    "inheritance": 0.86, "million dollars": 0.92, "prize": 0.80,
    "winner": 0.78, "unclaimed funds": 0.90, "beneficiary": 0.82,
    "payment": 0.55, "invoice": 0.58, "transaction": 0.52,
}

THREAT_PHRASES: Dict[str, float] = {
    "account will be closed": 0.90, "legal action": 0.88,
    "law enforcement": 0.85, "arrest warrant": 0.92,
    "unauthorized access": 0.80, "suspicious activity": 0.78,
    "identity theft": 0.75, "compromised": 0.82,
    "prosecuted": 0.88, "court order": 0.86,
    "penalty": 0.72, "fine": 0.65,
}

SUSPICIOUS_LINK_PATTERNS: List[str] = [
    r"http[s]?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}",  # IP-based URLs
    r"http[s]?://[a-z0-9\-]+\.[a-z]{2,3}/[a-z0-9]{20,}",  # Long random paths
    r"bit\.ly|tinyurl|goo\.gl|t\.co|shorturl",  # URL shorteners
    r"@[a-z]+\.[a-z]+",  # embedded @ in URL
    r"\.ru/|\.cn/|\.tk/|\.ml/|\.ga/|\.cf/",  # suspicious TLDs
    r"login|signin|verify|secure|account|update|confirm",  # phishing path keywords
]


def _count_pattern_hits(text: str, patterns: Dict[str, float]) -> Tuple[int, float, List[str]]:
    """Count how many pattern keywords appear in text and sum their weights."""
    text_lower = text.lower()
    hits = 0
    weight_sum = 0.0
    matched: List[str] = []
    for keyword, weight in patterns.items():
        count = text_lower.count(keyword)
        if count > 0:
            hits += count
            weight_sum += weight * min(count, 3)  # cap contribution at 3 occurrences
            matched.append(keyword)
    return hits, weight_sum, matched


def _caps_ratio(text: str) -> float:
    """Fraction of alphabetical characters that are uppercase."""
    alpha_chars = [c for c in text if c.isalpha()]
    if not alpha_chars:
        return 0.0
    upper = sum(1 for c in alpha_chars if c.isupper())
    return upper / len(alpha_chars)


def _suspicious_link_score(text: str) -> Tuple[float, List[str]]:
    """Score based on presence of suspicious URL patterns."""
    score = 0.0
    found: List[str] = []
    for pattern in SUSPICIOUS_LINK_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            score += 0.15 * len(matches)
            found.extend(matches[:3])
    return min(score, 1.0), found


def _exclamation_density(text: str) -> float:
    """Ratio of exclamation marks to total sentence-ending punctuation."""
    excl = text.count("!")
    total_punct = excl + text.count(".") + text.count("?")
    if total_punct == 0:
        return 0.0
    return excl / total_punct


def compute_risk_score(email_text: str) -> Dict:
    """
    Compute a probabilistic phishing risk score using a Naive-Bayes-inspired
    multi-feature analysis.  Returns a dict with:
      • risk_score       (0.0 – 1.0)
      • risk_label       ("Low" / "Medium" / "High" / "Critical")
      • feature_breakdown (per-feature scores and matched keywords)
    """
    # ── Feature extraction ──
    urgency_hits, urgency_weight, urgency_matched = _count_pattern_hits(email_text, URGENCY_WORDS)
    finance_hits, finance_weight, finance_matched = _count_pattern_hits(email_text, FINANCIAL_KEYWORDS)
    threat_hits, threat_weight, threat_matched = _count_pattern_hits(email_text, THREAT_PHRASES)
    caps_r = _caps_ratio(email_text)
    link_score, link_matched = _suspicious_link_score(email_text)
    excl_density = _exclamation_density(email_text)

    # ── Normalize feature scores to [0, 1] ──
    urgency_score = min(urgency_weight / 3.0, 1.0)
    finance_score = min(finance_weight / 3.0, 1.0)
    threat_score = min(threat_weight / 2.5, 1.0)
    caps_score = min(caps_r * 2.0, 1.0)  # >50% caps → max
    excl_score = min(excl_density * 1.5, 1.0)

    # ── Weighted combination (Naive Bayes posterior approximation) ──
    weights = {
        "urgency": 0.25,
        "financial": 0.25,
        "threat": 0.15,
        "caps": 0.10,
        "links": 0.15,
        "exclamation": 0.10,
    }
    scores = {
        "urgency": urgency_score,
        "financial": finance_score,
        "threat": threat_score,
        "caps": caps_score,
        "links": link_score,
        "exclamation": excl_score,
    }

    raw_score = sum(scores[k] * weights[k] for k in weights)
    # Apply sigmoid-like squash for calibration
    risk_score = 1 / (1 + math.exp(-8 * (raw_score - 0.35)))
    risk_score = round(risk_score, 3)

    # ── Label assignment ──
    if risk_score >= 0.85:
        risk_label = "Critical"
    elif risk_score >= 0.60:
        risk_label = "High"
    elif risk_score >= 0.35:
        risk_label = "Medium"
    else:
        risk_label = "Low"

    return {
        "risk_score": risk_score,
        "risk_label": risk_label,
        "feature_breakdown": {
            "urgency": {
                "score": round(urgency_score, 3),
                "weight": weights["urgency"],
                "matched_keywords": urgency_matched,
            },
            "financial_keywords": {
                "score": round(finance_score, 3),
                "weight": weights["financial"],
                "matched_keywords": finance_matched,
            },
            "threat_language": {
                "score": round(threat_score, 3),
                "weight": weights["threat"],
                "matched_keywords": threat_matched,
            },
            "caps_ratio": {
                "score": round(caps_score, 3),
                "weight": weights["caps"],
                "raw_ratio": round(caps_r, 3),
            },
            "suspicious_links": {
                "score": round(link_score, 3),
                "weight": weights["links"],
                "matched_patterns": link_matched,
            },
            "exclamation_density": {
                "score": round(excl_score, 3),
                "weight": weights["exclamation"],
                "raw_density": round(excl_density, 3),
            },
        },
    }
