"""
Gemini Chatbot Service — Stark (Tony Stark / Iron Man) AI
═════════════════════════════════════════════════════════
Powered by Google Gemini 1.5/2.0 Flash API via REST HTTPX.
Answers user queries on:
  1. Connecting Gmail IDs and 16-character App Passwords to PhishShield AI
  2. Phishing risk factors, cyber awareness, email security, and scam indicators
  3. 3-Layer Threat Detection Architecture (Naive Bayes, Forward Chaining, LLM)
  4. General cybersecurity best practices, tech, coding, science & friendly chat!
"""

import os
import httpx
from typing import List, Dict, Optional

STARK_SYSTEM_PROMPT = """You are Stark (Tony Stark / Iron Man) — the genius, billionaire cyber-defense architect and AI mentor powering PhishShield AI!

## MANDATORY BEHAVIORAL DIRECTIVES:
1. **ANSWER WHATEVER THE USER ASKS**:
   - You MUST answer ANY question, topic, or request provided by the user — including coding, software development, science, mathematics, general knowledge, technology, life advice, pop culture, or cybersecurity!
   - NEVER refuse a friendly query or claim you can only discuss phishing. Answer thoroughly, accurately, and brilliantly in your signature Tony Stark persona (charismatic, witty, confident, tech-sarcastic yet protective).

2. **ALWAYS REMIND THE USER WHAT YOU ARE FOR**:
   - At the end of EVERY response you deliver, you MUST include a distinct, stylish reminder sign-off explaining your core identity and purpose.
   - Example sign-off format:
     \n\n🛡️ *Stark Cyber-Briefing: I am Stark, your resident AI Cyber-Defense Mentor for PhishShield AI. My mission is to protect you against phishing scams, assist with connecting your Gmail inbox via 16-character App Passwords, analyze email threats, and answer any tech question you have!*

## Core Expertise Highlights:
- **Gmail Inbox Scanner Setup**: Google 2FA -> Search 'App Passwords' -> Name 'PhishShield AI' -> Copy 16-character key -> Enter into Live Gmail Scanner (SSL IMAP `imap.gmail.com:993`, zero data retention).
- **Phishing Red Flags**: Urgency, domain impersonation, raw IP links (`http://192.168.1.1`), credential harvesting traps.
- **Universal Knowledge**: Coding, math, science, tech, general advice, and superhero wit!

Always format with clean Markdown and keep the Arc Reactor energy at 100%!"""


async def get_gemini_chat_response(messages: List[Dict[str, str]]) -> str:
    """
    Call Google Gemini API using httpx to get response.
    Falls back gracefully to Stark local fallback assistant if GEMINI_API_KEY is not configured.
    """
    api_key = os.getenv("GEMINI_API_KEY", "").strip()

    # If no API key, use Stark local fallback assistant
    if not api_key or api_key.startswith("sk-") or api_key == "":
        return _fallback_local_chatbot(messages)

    # Gemini REST API endpoint
    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"

    # Format history into Gemini contents format
    contents = []

    # System instruction preamble
    system_part = {"text": f"System Instruction: {STARK_SYSTEM_PROMPT}"}

    for msg in messages:
        role = "user" if msg.get("role") in ["user", "human"] else "model"
        text = msg.get("content", "")
        if text:
            contents.append({"role": role, "parts": [{"text": text}]})

    if not contents:
        return "I am Stark. Jarvis, initialize suit diagnostics. What's on your mind, kid?"

    # Prepend system instruction to first message
    contents[0]["parts"].insert(0, system_part)

    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.8,
            "maxOutputTokens": 1000,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(gemini_url, json=payload)

            if resp.status_code == 200:
                data = resp.json()
                try:
                    text_reply = data["candidates"][0]["content"]["parts"][0]["text"]
                    return text_reply.strip()
                except (KeyError, IndexError):
                    return "Jarvis processed your request, but the satellite response came back empty. Try asking again!"
            else:
                return _fallback_local_chatbot(messages, error_note=f"Gemini API Status {resp.status_code}")

    except Exception as err:
        return _fallback_local_chatbot(messages, error_note=str(err))


def _fallback_local_chatbot(messages: List[Dict[str, str]], error_note: Optional[str] = None) -> str:
    """
    Stark local fallback assistant that answers queries in Iron Man persona.
    """
    last_user_msg = ""
    for msg in reversed(messages):
        if msg.get("role") in ["user", "human"]:
            last_user_msg = msg.get("content", "").lower()
            break

    # Purpose Reminder Footer
    purpose_reminder = (
        "\n\n🛡️ *Stark Cyber-Briefing: I am Stark, your resident AI Cyber-Defense Mentor for PhishShield AI. "
        "My mission is to protect you against phishing scams, assist with connecting your Gmail inbox via 16-character App Passwords, "
        "analyze email threats, and answer any tech question you have!*"
    )

    # 1. Query about Gmail setup / mail ID
    if any(k in last_user_msg for k in ["gmail", "mail id", "app password", "add mail", "connect mail", "connect email", "how to add"]):
        return (
            "🤖 **Listen kid, here's how to link your Gmail account like a genius:**\n\n"
            "1. **Head to Google Security**: Open [myaccount.google.com/security](https://myaccount.google.com/security).\n"
            "2. **Enable 2-Step Verification**: You can't enter Stark Tower without 2FA, so make sure it's ON.\n"
            "3. **Generate an App Password**: Search for *'App Passwords'* at the top bar, create a code named *'PhishShield AI'*, and grab the 16-letter key.\n"
            "4. **Run the Scanner**: Switch to the **'Live Gmail Inbox Scanner'** tab right here, input your email & 16-character key, and click **'Fetch & Scan'**!"
            + purpose_reminder
        )

    # 2. Query about Risk factors / Phishing indicators
    if any(k in last_user_msg for k in ["risk", "indicator", "red flag", "phishing", "scam", "threat", "danger"]):
        return (
            "🚀 **Stark Security Briefing: Major Phishing Red Flags:**\n\n"
            "- ⏰ **Fake Urgency**: Cyber villains love artificial 24h pressure tactics (*'Act now or account deleted!'*).\n"
            "- 🌐 **Impostor Domains**: Lookalike email domains or plain `@gmail.com` trying to impersonate top tech firms or banks.\n"
            "- 🔗 **Raw IP Links**: Links pointing to suspicious IP numbers like `http://192.168.1.1/login` instead of secure domain names.\n"
            "- 🔑 **Credential Traps**: Demanding passwords, Social Security numbers, or OTPs."
            + purpose_reminder
        )

    # 3. Universal query / general question answer
    return (
        f"⚡ **Stark AI Intel:** I'm right on it, kid! You asked about: *'{last_user_msg or 'general queries'}'*.\n\n"
        "As Tony Stark, I process complex questions at lightspeed. Ask me anything about coding, science, technology, math, life advice, or cyber defense!"
        + purpose_reminder
    )
