"""
Knowledge Representation & Reasoning Module (Modules V & VI)
─────────────────────────────────────────────────────────────
Implements a Forward Chaining inference engine for rule-based
phishing detection.  Rules encode expert heuristics as
IF-THEN productions over extracted facts.
"""

import re
from typing import Dict, List, Set

# ──────────────────────────────────────────────────────────────
#  Fact Extraction — turn raw email text into a set of logical facts
# ──────────────────────────────────────────────────────────────

KNOWN_INSTITUTIONS = [
    "bank of america", "chase", "wells fargo", "citibank", "hsbc",
    "paypal", "venmo", "zelle", "apple", "microsoft", "google",
    "amazon", "netflix", "irs", "social security administration",
    "facebook", "instagram", "whatsapp", "meta",
]

LEGITIMATE_DOMAINS = {
    "bank of america": ["bankofamerica.com"],
    "chase": ["chase.com"],
    "wells fargo": ["wellsfargo.com"],
    "citibank": ["citi.com", "citibank.com"],
    "paypal": ["paypal.com"],
    "apple": ["apple.com", "icloud.com"],
    "microsoft": ["microsoft.com", "outlook.com", "live.com"],
    "google": ["google.com", "gmail.com"],
    "amazon": ["amazon.com"],
    "netflix": ["netflix.com"],
    "irs": ["irs.gov"],
    "facebook": ["facebook.com"],
    "instagram": ["instagram.com"],
    "meta": ["meta.com"],
}


def extract_facts(email_text: str) -> Set[str]:
    """
    Parse email text and produce a set of propositional facts.

    Possible facts:
        claims_institution:<name>
        contains_urgency
        contains_link
        domain_mismatch
        requests_credentials
        requests_payment
        requests_personal_info
        has_attachment_mention
        has_threatening_language
        has_spelling_errors
        sender_uses_freemail
        contains_ip_url
        impersonates_authority
    """
    facts: Set[str] = set()
    text_lower = email_text.lower()

    # ── Institution claims ──
    for inst in KNOWN_INSTITUTIONS:
        if inst in text_lower:
            facts.add(f"claims_institution:{inst}")

    # ── Urgency language ──
    urgency_patterns = [
        r"urgent", r"immediately", r"act now", r"expire",
        r"suspended", r"within \d+ hours?", r"final notice",
        r"action required", r"time sensitive",
    ]
    for pat in urgency_patterns:
        if re.search(pat, text_lower):
            facts.add("contains_urgency")
            break

    # ── Links ──
    if re.search(r"https?://", text_lower):
        facts.add("contains_link")
    if re.search(r"https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", text_lower):
        facts.add("contains_ip_url")

    # ── Domain mismatch check ──
    email_domains = re.findall(r"@([\w\-]+\.[\w\.\-]+)", text_lower)
    url_domains = re.findall(r"https?://([\w\-]+\.[\w\.\-]+)", text_lower)
    all_domains = set(email_domains + url_domains)

    for inst_fact in [f for f in facts if f.startswith("claims_institution:")]:
        inst_name = inst_fact.split(":")[1]
        legit_domains = LEGITIMATE_DOMAINS.get(inst_name, [])
        if legit_domains and all_domains:
            if not any(
                any(legit in domain for legit in legit_domains)
                for domain in all_domains
            ):
                facts.add("domain_mismatch")

    # ── Credential requests ──
    cred_patterns = [
        r"password", r"login", r"sign.?in", r"credential",
        r"username", r"pin\b", r"security code", r"otp",
        r"verification code",
    ]
    for pat in cred_patterns:
        if re.search(pat, text_lower):
            facts.add("requests_credentials")
            break

    # ── Payment requests ──
    payment_patterns = [
        r"wire transfer", r"send money", r"bitcoin", r"gift card",
        r"pay (?:a |the )?(?:fee|fine|penalty)", r"western union",
        r"money ?gram", r"crypto",
    ]
    for pat in payment_patterns:
        if re.search(pat, text_lower):
            facts.add("requests_payment")
            break

    # ── Personal info requests ──
    personal_patterns = [
        r"social security", r"ssn", r"date of birth", r"mother'?s maiden",
        r"tax.?id", r"driver'?s license", r"passport number",
    ]
    for pat in personal_patterns:
        if re.search(pat, text_lower):
            facts.add("requests_personal_info")
            break

    # ── Attachment mentions ──
    if re.search(r"attachment|attached file|open the file|download", text_lower):
        facts.add("has_attachment_mention")

    # ── Threatening language ──
    threat_patterns = [
        r"legal action", r"arrest", r"prosecut", r"law enforcement",
        r"account.*clos", r"permanently.*delet",
    ]
    for pat in threat_patterns:
        if re.search(pat, text_lower):
            facts.add("has_threatening_language")
            break

    # ── Free-mail sender ──
    free_providers = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com"]
    for domain in email_domains:
        if any(fp in domain for fp in free_providers):
            # Only flag if claiming to be an institution
            if any(f.startswith("claims_institution:") for f in facts):
                facts.add("sender_uses_freemail")

    # ── Authority impersonation ──
    authority_patterns = [
        r"federal", r"government", r"fbi", r"cia", r"police",
        r"customs", r"tax authority", r"commissioner",
    ]
    for pat in authority_patterns:
        if re.search(pat, text_lower):
            facts.add("impersonates_authority")
            break

    return facts


# ──────────────────────────────────────────────────────────────
#  Rule Definitions (IF conditions → THEN conclusion)
# ──────────────────────────────────────────────────────────────

class Rule:
    """A production rule for forward chaining."""

    def __init__(self, name: str, conditions: Set[str], conclusion: str, explanation: str):
        self.name = name
        self.conditions = conditions
        self.conclusion = conclusion
        self.explanation = explanation

    def is_applicable(self, facts: Set[str]) -> bool:
        """Check if all conditions are satisfied by current facts."""
        for cond in self.conditions:
            if cond.startswith("claims_institution:"):
                # Wildcard match — any institution claim satisfies
                if cond == "claims_institution:*":
                    if not any(f.startswith("claims_institution:") for f in facts):
                        return False
                elif cond not in facts:
                    return False
            elif cond not in facts:
                return False
        return True


RULES: List[Rule] = [
    Rule(
        name="R1: Institution + Domain Mismatch",
        conditions={"claims_institution:*", "domain_mismatch"},
        conclusion="FLAG:domain_impersonation",
        explanation="The email claims to be from a known institution but the sender/link domain does not match the legitimate domain. This is a classic impersonation tactic.",
    ),
    Rule(
        name="R2: Credential Phishing",
        conditions={"requests_credentials", "contains_link"},
        conclusion="FLAG:credential_phishing",
        explanation="The email requests login credentials and contains a link — likely directing to a fake login page to harvest passwords.",
    ),
    Rule(
        name="R3: Urgency + Credential Request",
        conditions={"contains_urgency", "requests_credentials"},
        conclusion="FLAG:pressure_credential_theft",
        explanation="Combining urgent language with credential requests is a social engineering tactic to rush the victim into revealing passwords without thinking.",
    ),
    Rule(
        name="R4: Payment Scam",
        conditions={"requests_payment", "contains_urgency"},
        conclusion="FLAG:payment_scam",
        explanation="Demanding immediate payment (especially via wire transfer, gift cards, or crypto) under time pressure is a hallmark of financial fraud.",
    ),
    Rule(
        name="R5: Identity Theft Attempt",
        conditions={"requests_personal_info", "claims_institution:*"},
        conclusion="FLAG:identity_theft",
        explanation="An entity claiming to be a legitimate institution is requesting sensitive personal information (SSN, DOB, etc.) — real institutions never do this via email.",
    ),
    Rule(
        name="R6: Malicious Attachment",
        conditions={"has_attachment_mention", "contains_urgency"},
        conclusion="FLAG:malicious_attachment",
        explanation="Urgent emails pressuring you to open attachments often contain malware, ransomware, or trojans.",
    ),
    Rule(
        name="R7: Authority Impersonation Threat",
        conditions={"impersonates_authority", "has_threatening_language"},
        conclusion="FLAG:authority_scam",
        explanation="Impersonating law enforcement or government agencies with threats of arrest or legal action is a well-known intimidation scam.",
    ),
    Rule(
        name="R8: Free-mail Institutional Fraud",
        conditions={"sender_uses_freemail", "claims_institution:*"},
        conclusion="FLAG:freemail_impersonation",
        explanation="A legitimate institution would never contact you from a free email provider (Gmail, Yahoo, etc.). This strongly indicates impersonation.",
    ),
    Rule(
        name="R9: IP-based URL Obfuscation",
        conditions={"contains_ip_url"},
        conclusion="FLAG:url_obfuscation",
        explanation="Using an IP address instead of a domain name in a URL is a technique to hide the true destination and evade spam filters.",
    ),
    Rule(
        name="R10: Full Spectrum Phishing",
        conditions={"claims_institution:*", "domain_mismatch", "requests_credentials", "contains_urgency"},
        conclusion="FLAG:confirmed_phishing",
        explanation="This email exhibits ALL classic phishing markers: impersonation, domain mismatch, credential harvesting, and urgency pressure. This is almost certainly a phishing attack.",
    ),
]


# ──────────────────────────────────────────────────────────────
#  Forward Chaining Engine
# ──────────────────────────────────────────────────────────────

def forward_chain(email_text: str) -> Dict:
    """
    Run forward chaining over the extracted facts.

    Returns:
        {
            "extracted_facts": [...],
            "fired_rules": [
                { "rule": "...", "conclusion": "...", "explanation": "..." },
                ...
            ],
            "flags": [...],
        }
    """
    facts = extract_facts(email_text)
    fired_rules: List[Dict] = []
    flags: Set[str] = set()

    # Iterative forward chaining — keep firing until no new conclusions
    changed = True
    max_iterations = 20  # safety valve
    iteration = 0

    while changed and iteration < max_iterations:
        changed = False
        iteration += 1
        for rule in RULES:
            if rule.conclusion not in facts and rule.is_applicable(facts):
                facts.add(rule.conclusion)
                flags.add(rule.conclusion)
                fired_rules.append({
                    "rule": rule.name,
                    "conclusion": rule.conclusion,
                    "explanation": rule.explanation,
                })
                changed = True

    return {
        "extracted_facts": sorted([f for f in facts if not f.startswith("FLAG:")]),
        "fired_rules": fired_rules,
        "flags": sorted(list(flags)),
    }
