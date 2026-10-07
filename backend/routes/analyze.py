"""
POST /api/analyze — Scam Detection Endpoint
─────────────────────────────────────────────
Stateless, zero-data-retention endpoint.
Receives email text → runs 3 AI layers → returns JSON → garbage collects.
"""

import gc
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from core.statistical_model import compute_risk_score
from core.knowledge_engine import forward_chain
from core.llm_service import generate_phishing_explanation

router = APIRouter()


class AnalyzeRequest(BaseModel):
    email_text: str = Field(
        ...,
        min_length=10,
        max_length=10000,
        description="Raw text of the suspicious email to analyze",
    )


class AnalyzeResponse(BaseModel):
    risk_score: float
    risk_label: str
    statistical_analysis: dict
    knowledge_engine: dict
    llm_explanation: str


@router.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_email(request: AnalyzeRequest):
    """
    Three-layer phishing analysis pipeline:
      Layer 1 — Statistical (Naive Bayes risk scoring)
      Layer 2 — Knowledge Engine (Forward Chaining rules)
      Layer 3 — LLM (Plain English explanation)

    All processing is done in RAM with no database writes.
    """
    email_text = request.email_text

    try:
        # ── Layer 1: Statistical Analysis ──
        statistical_result = compute_risk_score(email_text)

        # ── Layer 2: Knowledge Engine ──
        knowledge_result = forward_chain(email_text)

        # ── Layer 3: LLM Explanation ──
        llm_explanation = generate_phishing_explanation(
            email_text, statistical_result, knowledge_result
        )

        response = AnalyzeResponse(
            risk_score=statistical_result["risk_score"],
            risk_label=statistical_result["risk_label"],
            statistical_analysis=statistical_result,
            knowledge_engine=knowledge_result,
            llm_explanation=llm_explanation,
        )

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    finally:
        # ── Explicit garbage collection — zero data retention ──
        del email_text
        gc.collect()
