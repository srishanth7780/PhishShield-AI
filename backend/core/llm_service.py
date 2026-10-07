"""
LLM Integration Service
───────────────────────
Provides generate_phishing_explanation — one-shot plain-English summary of
phishing tactics found in an email (used by the Anti-Phishing Scam Detector).

Uses OpenAI's Chat Completions API. Swap the client for Anthropic
or any other provider by updating the call in _call_llm().
"""

import os
from typing import Dict, List, Optional
from openai import OpenAI, APIError, APIConnectionError

# ──────────────────────────────────────────────────────────────
#  Client Initialization
# ──────────────────────────────────────────────────────────────

def _get_client() -> Optional[OpenAI]:
    """Return an OpenAI client if the API key is set, else None."""
    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key or api_key.startswith("sk-your"):
        return None
    return OpenAI(api_key=api_key)


def _call_llm(messages: List[Dict[str, str]], max_tokens: int = 1024) -> str:
    """
    Send messages to the LLM and return the assistant's reply.
    Falls back to a graceful placeholder if no API key is configured.
    """
    client = _get_client()
    if client is None:
        return _fallback_response(messages)

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=max_tokens,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except (APIError, APIConnectionError) as e:
        return f"⚠️ LLM service temporarily unavailable: {str(e)}"
    except Exception as e:
        return f"⚠️ Unexpected error: {str(e)}"


def _fallback_response(messages: List[Dict[str, str]]) -> str:
    """Provide a useful response when no LLM API key is configured."""
    return (
        "🛡️ **LLM Analysis (Offline Mode)**\n\n"
        "The LLM API key is not configured in backend `.env`. "
        "The Scam Detector has successfully analyzed this message using our deterministic "
        "**Naive Bayes NLP Model** and **Rule-Based Knowledge Engine** above!\n\n"
        "To activate deep generative natural language explanations, add your OpenAI or Anthropic API key to `.env`."
    )


# ──────────────────────────────────────────────────────────────
#  Phishing Explanation Generator
# ──────────────────────────────────────────────────────────────

PHISHING_SYSTEM_PROMPT = """You are a cybersecurity expert AI assistant. Your job is to analyze a suspicious email or message and explain, in plain English, what phishing tactics it uses.

You will be given:
1. The raw message text
2. A statistical risk analysis (features and scores)
3. A knowledge-engine analysis (rules that fired and why)

Your task:
- Write a clear, concise explanation (3-5 paragraphs) suitable for a non-technical user.
- Highlight specific red flags found in the message.
- Explain WHY each tactic is dangerous.
- Give practical advice on what the user should do.
- Use a friendly but authoritative tone.
- Format your response with bullet points and bold text for key takeaways.
- Do NOT reproduce the full message text in your response."""


def generate_phishing_explanation(
    email_text: str,
    statistical_result: Dict,
    knowledge_result: Dict,
) -> str:
    """
    Generate a plain-English explanation of phishing tactics detected.
    This is a one-shot call with no conversation history retained.
    """
    user_content = f"""## Email Text to Analyze:
{email_text[:3000]}

## Statistical Analysis Results:
- Overall Risk Score: {statistical_result.get('risk_score', 'N/A')} ({statistical_result.get('risk_label', 'N/A')})
- Key Features: {', '.join(
    f"{k}: {v.get('score', 0)}"
    for k, v in statistical_result.get('feature_breakdown', {}).items()
    if v.get('score', 0) > 0.1
)}

## Knowledge Engine Results:
- Facts Extracted: {', '.join(knowledge_result.get('extracted_facts', []))}
- Rules Fired: {'; '.join(
    r['rule'] + ': ' + r['explanation'][:80]
    for r in knowledge_result.get('fired_rules', [])
)}
- Flags Raised: {', '.join(knowledge_result.get('flags', []))}"""

    messages = [
        {"role": "system", "content": PHISHING_SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]

    return _call_llm(messages, max_tokens=1500)

