# 🧠 AI Masterclass & Interactive Anti-Phishing Engine

A hybrid educational platform featuring a **10-module AI Masterclass**, a **live interactive scam detection engine**, and a **conversational AI tutor bot**.

## 🏗️ Architecture

| Component | Tech Stack | Deployment |
|-----------|-----------|------------|
| Frontend  | Next.js 14, React, Tailwind CSS, Lucide | Vercel |
| Backend   | Python, FastAPI, OpenAI API | Render |

## 🚀 Quick Start

### Backend (FastAPI)

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
cp .env.example .env         # Add your OpenAI API key
uvicorn main:app --reload --port 8000
```

The API docs will be at: `http://localhost:8000/docs`

### Frontend (Next.js)

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## 🛡️ Scam Detection Engine (3 Layers)

1. **Statistical Model** — Naive Bayes risk scoring across 6 feature vectors (urgency, financial keywords, threat language, caps ratio, suspicious links, exclamation density)
2. **Knowledge Engine** — Forward chaining inference with 10 expert-coded rules and automatic fact extraction
3. **LLM Analysis** — GPT-powered plain-English explanation of detected phishing tactics

## 🤖 AI Tutor Bot (ARIA)

A conversational AI tutor that can explain any topic from the 10-module curriculum. Maintains conversation context across turns.

## 📚 Course Modules

| # | Module | Focus |
|---|--------|-------|
| I | Introduction to AI | Foundations, agents, ethics |
| II | Uninformed Search | BFS, DFS, UCS, IDDFS |
| III | Informed Search | A*, hill climbing, beam search |
| IV | Game Theory | Minimax, alpha-beta, MCTS |
| V | Inferences | FOL, forward/backward chaining |
| VI | Knowledge Representation | KB agents, frames, ontologies |
| VII | State Space Planning | Partial-order, hierarchical |
| VIII | Uncertainty | Bayesian networks, inference |
| IX | Learning Agents | Decision trees, RL |
| X | AI Applications | Healthcare, finance, agriculture |

## 📁 Project Structure

```
├── frontend/               # Next.js 14 (App Router)
│   ├── src/
│   │   ├── app/            # Pages & layout
│   │   ├── components/     # React components
│   │   └── data/           # Course module data
│
├── backend/                # Python FastAPI
│   ├── core/               # AI engine modules
│   │   ├── statistical_model.py
│   │   ├── knowledge_engine.py
│   │   └── llm_service.py
│   └── routes/             # API endpoints
│       ├── analyze.py
│       └── chat.py
```

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze` | 3-layer phishing analysis |
| `POST` | `/api/chat` | Conversational AI tutor |
| `GET`  | `/health` | Health check |
