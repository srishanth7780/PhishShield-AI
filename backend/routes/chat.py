"""
POST /api/chat — CyberShield AI Chatbot Endpoint
═════════════════════════════════════════════════
Multi-turn conversational chatbot powered by Google Gemini API.
Answers queries regarding Gmail setup, cyber risk factors, and platform usage.
"""

from typing import List, Dict, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from core.gemini_chat_service import get_gemini_chat_response

router = APIRouter()


class ChatMessageItem(BaseModel):
    role: str = Field(..., description="'user' or 'assistant' / 'model'")
    content: str = Field(..., description="Message text content")


class ChatRequest(BaseModel):
    messages: List[ChatMessageItem] = Field(..., description="Full conversation history")


class ChatResponse(BaseModel):
    status: str
    reply: str


@router.post("/api/chat", response_model=ChatResponse)
async def chat_with_cybershield(request: ChatRequest):
    """
    Conversational endpoint powered by Google Gemini API.
    Provides guidance on adding Gmail, cybersecurity risk factors, and phishing awareness.
    """
    if not request.messages:
        raise HTTPException(status_code=400, detail="Messages history cannot be empty.")

    try:
        # Convert Pydantic items to dicts
        history = [{"role": m.role, "content": m.content} for m in request.messages]
        reply_text = await get_gemini_chat_response(history)

        return ChatResponse(
            status="success",
            reply=reply_text,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot service error: {str(e)}")
