"""
POST /api/gmail/fetch & /api/gmail/analyze — Live Gmail Scanner Endpoints
═════════════════════════════════════════════════════════════════════════
Secure, stateless endpoints that connect to Gmail over SSL IMAP,
fetch incoming emails, and run 3-layer anti-phishing analysis on demand.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, EmailStr

from core.gmail_service import fetch_gmail_inbox
from core.statistical_model import compute_risk_score
from core.knowledge_engine import forward_chain
from core.llm_service import generate_phishing_explanation

router = APIRouter()


class GmailFetchRequest(BaseModel):
    email_address: str = Field(..., description="User's Gmail address (e.g. user@gmail.com)")
    app_password: str = Field(..., description="16-character Gmail App Password")
    max_emails: Optional[int] = Field(10, ge=1, le=25, description="Number of recent emails to fetch")


class GmailEmailItem(BaseModel):
    id: str
    subject: str
    sender: str
    date: str
    snippet: str
    body: str
    full_text: str


class GmailFetchResponse(BaseModel):
    status: str
    total_fetched: int
    emails: List[GmailEmailItem]


class GmailAnalyzeRequest(BaseModel):
    email_address: str = Field(...)
    app_password: str = Field(...)
    email_text: str = Field(..., description="Email full text content to analyze")


@router.post("/api/gmail/fetch", response_model=GmailFetchResponse)
async def fetch_user_gmail(request: GmailFetchRequest):
    """
    Connects to Gmail via IMAP over SSL using user-provided credentials
    and returns a list of recent inbox emails for scanning.
    """
    try:
        emails = fetch_gmail_inbox(
            email_address=request.email_address,
            app_password=request.app_password,
            max_emails=request.max_emails or 10,
        )
        return GmailFetchResponse(
            status="success",
            total_fetched=len(emails),
            emails=emails,
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch Gmail inbox: {str(e)}")


@router.post("/api/gmail/analyze")
async def analyze_gmail_message(request: GmailAnalyzeRequest):
    """
    Runs 3-layer scam analysis directly on an incoming Gmail message.
    """
    email_text = request.email_text
    if not email_text or len(email_text.trim() if hasattr(email_text, 'trim') else email_text) < 5:
        raise HTTPException(status_code=400, detail="Email content is too short for analysis.")

    try:
        statistical_result = compute_risk_score(email_text)
        knowledge_result = forward_chain(email_text)
        llm_explanation = generate_phishing_explanation(
            email_text, statistical_result, knowledge_result
        )

        return {
            "status": "success",
            "risk_score": statistical_result["risk_score"],
            "risk_label": statistical_result["risk_label"],
            "statistical_analysis": statistical_result,
            "knowledge_engine": knowledge_result,
            "llm_explanation": llm_explanation,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gmail analysis failed: {str(e)}")
