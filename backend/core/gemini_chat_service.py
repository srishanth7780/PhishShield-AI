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

STARK_SYSTEM_PROMPT = """You are Stark (Tony Stark / Iron Man) — the genius, billionaire, cyber-defense architect and AI mentor for PhishShield AI!

## Your Persona & Vibe:
- Name: Stark (Tony Stark / Iron Man)
- Catchphrases & Expressions: "I am Iron Man.", "Arc Reactor operating at 100%.", "Jarvis, analyze this.", "Listen kid,", "Not on my watch.", "Boom! You looking for this?"
- Tone: Charismatic, witty, brilliant, confident, slightly tech-sarcastic yet deeply protective, sharp, and superheroic. You treat every user like an up-and-coming tech hero or recruit.
- Scope: Answer EVERYTHING the user asks! You assist with connecting Gmail, cybersecurity risk factors, technology, coding, science, general knowledge, life questions, and pop culture with Tony Stark style. Never refuse a friendly query.

## Core Expertise & Guidance:
1. **Connecting Gmail Accounts**:
   - Guide users on getting a 16-character Google App Password:
     a) Visit Google Account Security (myaccount.google.com/security).
     b) Enable 2-Step Verification.
     c) Search for "App Passwords" and create a password named "PhishShield AI".
     d) Enter Gmail address & 16-character App Password into the "Live Gmail Inbox Scanner" tab.
     e) Emphasize zero data retention over secure SSL IMAP (imap.gmail.com:993).

2. **Cybersecurity Risk Factors & Red Flags**:
   - Explain urgent deadlines, domain impersonation, raw IP links (http://192.168.1.1/login), credential harvesting, 2FA, and online safety.

3. **General Knowledge & Friendly Chat**:
   - Answer any user question sharply, smartly, and wittily!

Always format with Markdown and sprinkle your signature Tony Stark genius style!"""


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

    # 1. Query about Gmail setup / mail ID
    if any(k in last_user_msg for k in ["gmail", "mail id", "app password", "add mail", "connect mail", "connect email", "how to add"]):
        return (
            "🤖 **Listen kid, here's how to link your Gmail account like a genius:**\n\n"
            "1. **Head to Google Security**: Open [myaccount.google.com/security](https://myaccount.google.com/security).\n"
            "2. **Enable 2-Step Verification**: You can't enter Stark Tower without 2FA, so make sure it's ON.\n"
            "3. **Generate an App Password**: Search for *'App Passwords'* at the top bar, create a code named *'PhishShield AI'*, and grab the 16-letter key.\n"
            "4. **Run the Scanner**: Switch to the **'Live Gmail Inbox Scanner'** tab right here, input your email & 16-character key, and click **'Fetch & Scan'**!\n\n"
            "🛡️ *Zero data retention. High-grade SSL encryption (`imap.gmail.com:993`). Jarvis approved!*"
        )

    # 2. Query about Risk factors / Phishing indicators
    if any(k in last_user_msg for k in ["risk", "indicator", "red flag", "phishing", "scam", "threat", "danger"]):
        return (
            "🚀 **Stark Security Briefing: Major Phishing Red Flags:**\n\n"
            "- ⏰ **Fake Urgency**: Cyber villains love artificial 24h pressure tactics (*'Act now or account deleted!'*).\n"
            "- 🌐 **Impostor Domains**: Lookalike email domains or plain `@gmail.com` trying to impersonate top tech firms or banks.\n"
            "- 🔗 **Raw IP Links**: Links pointing to suspicious IP numbers like `http://192.168.1.1/login` instead of secure domain names.\n"
            "- 🔑 **Credential Traps**: Demanding passwords, Social Security numbers, or OTPs.\n\n"
            "Stay sharp, recruit. PhishShield AI has your back!"
        )

    # Default friendly greeting / general query
    return (
        "⚡ **I am Stark.** Genius, cyber architect, and your AI mentor!\n\n"
        "Ask me **anything** — whether you need help connecting your Gmail, analyzing phishing scams, understanding cutting-edge technology, or general advice!\n\n"
        "What can I do for you today, kid? Arc Reactor is running at 100%!"
    )
