"""
PhishShield AI Anti-Phishing Engine — FastAPI Backend
═══════════════════════════════════════════════════════
Entry point. Run with:
    uvicorn main:app --reload --port 8000
"""

import os
import sys
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure backend directory is in sys.path for resolution
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from routes.analyze import router as analyze_router
from routes.gmail import router as gmail_router
from routes.chat import router as chat_router

# ── Load environment variables ──
load_dotenv()

# ── App Initialization ──
app = FastAPI(
    title="PhishShield AI Anti-Phishing Engine API",
    description=(
        "Backend API powering the PhishShield AI platform. "
        "Provides 3-layer real-time scam detection, Gmail inbox threat scanner, and Gemini Cyber AI Chatbot."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS Configuration ──
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register Routers ──
app.include_router(analyze_router, tags=["Scam Detection"])
app.include_router(gmail_router, tags=["Gmail Integration"])
app.include_router(chat_router, tags=["CyberShield AI Chatbot"])




# ── Health Check ──
@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": "PhishShield AI Anti-Phishing Engine",
        "version": "1.0.0",
        "api_key_configured": bool(
            os.getenv("OPENAI_API_KEY", "").strip()
            and not os.getenv("OPENAI_API_KEY", "").startswith("sk-your")
        ),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

