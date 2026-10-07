"""
Gmail Integration Module — PhishShield AI
═════════════════════════════════════════
Fetches incoming emails from Gmail IMAP over SSL.
Parses sender, subject, date, snippet, and plain text / HTML body content for anti-phishing analysis.
"""

import imaplib
import email
import re
from email.header import decode_header
from typing import List, Dict


def _decode_mime_header(header_value: str) -> str:
    """Safely decode MIME headers like Subject or From."""
    if not header_value:
        return ""
    decoded_parts = decode_header(header_value)
    result = []
    for content, encoding in decoded_parts:
        if isinstance(content, bytes):
            try:
                result.append(content.decode(encoding or "utf-8", errors="replace"))
            except Exception:
                result.append(content.decode("latin-1", errors="replace"))
        else:
            result.append(str(content))
    return "".join(result)


def _extract_body(msg: email.message.Message) -> str:
    """Extract plain text or HTML body from MIME email message."""
    body = ""
    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition", ""))

            # Skip attachments
            if "attachment" in content_disposition:
                continue

            if content_type == "text/plain":
                try:
                    payload = part.get_payload(decode=True)
                    if payload:
                        charset = part.get_content_charset() or "utf-8"
                        body = payload.decode(charset, errors="replace")
                        break
                except Exception:
                    pass
            elif content_type == "text/html" and not body:
                try:
                    payload = part.get_payload(decode=True)
                    if payload:
                        charset = part.get_content_charset() or "utf-8"
                        raw_html = payload.decode(charset, errors="replace")
                        # Basic html tag cleanup
                        body = re.sub(r'<[^>]+>', ' ', raw_html)
                except Exception:
                    pass
    else:
        try:
            payload = msg.get_payload(decode=True)
            if payload:
                charset = msg.get_content_charset() or "utf-8"
                body = payload.decode(charset, errors="replace")
        except Exception:
            body = str(msg.get_payload())

    return body.strip()


def fetch_gmail_inbox(
    email_address: str, app_password: str, max_emails: int = 10
) -> List[Dict]:
    """
    Connect to Gmail via IMAP over SSL (imap.gmail.com:993) and fetch recent inbox messages.
    """
    if not email_address or not app_password:
        raise ValueError("Gmail address and App Password are required.")

    # Format app password (strip spaces if user pasted with spaces like 'abcd efgh ijkl mnop')
    clean_password = app_password.replace(" ", "")

    try:
        # Connect over SSL
        mail = imaplib.IMAP4_SSL("imap.gmail.com", 993)
        mail.login(email_address, clean_password)
        mail.select("INBOX")

        # Search for all emails
        status, response = mail.search(None, "ALL")
        if status != "OK":
            mail.logout()
            return []

        email_ids = response[0].split()
        if not email_ids:
            mail.logout()
            return []

        # Get latest N emails
        recent_ids = email_ids[-max_emails:]
        recent_ids.reverse()  # Newest first

        fetched_emails = []

        for e_id in recent_ids:
            res_status, msg_data = mail.fetch(e_id, "(RFC822)")
            if res_status != "OK" or not msg_data:
                continue

            for response_part in msg_data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])
                    subject = _decode_mime_header(msg.get("Subject", "(No Subject)"))
                    sender = _decode_mime_header(msg.get("From", "(Unknown Sender)"))
                    date_str = msg.get("Date", "")
                    body = _extract_body(msg)

                    raw_full_text = f"Subject: {subject}\nFrom: {sender}\nDate: {date_str}\n\n{body}"

                    fetched_emails.append({
                        "id": e_id.decode("utf-8") if isinstance(e_id, bytes) else str(e_id),
                        "subject": subject,
                        "sender": sender,
                        "date": date_str,
                        "snippet": body[:180] + "..." if len(body) > 180 else body,
                        "body": body,
                        "full_text": raw_full_text,
                    })

        mail.logout()
        return fetched_emails

    except imaplib.IMAP4.error as err:
        raise ValueError(
            f"Gmail Authentication Failed. Please check your email and 16-character App Password. Error: {str(err)}"
        )
    except Exception as err:
        raise Exception(f"Failed to connect to Gmail IMAP: {str(err)}")
