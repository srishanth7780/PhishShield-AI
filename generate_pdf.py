import os
from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_font("helvetica", "B", 18)
        self.cell(0, 10, "PhishShield-AI Architecture Documentation", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font("helvetica", "I", 8)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

def create_pdf():
    pdf = PDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    # 1. System Architecture
    pdf.set_font("helvetica", "B", 14)
    pdf.cell(0, 10, "1. Overall System Architecture", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("helvetica", "", 11)
    
    body = """The application is built using a modern decoupled architecture:

- Frontend (Client Layer): Built with Next.js 14 (App Router), React, Tailwind CSS, and Lucide icons. It provides the UI for the 10-module AI Masterclass, the Live Scam Detector interface, and the AI Tutor chat window. (Deployed on Vercel)
- Backend (API Layer): Built with Python 3 and FastAPI. It handles all the heavy lifting for AI processing, logic, and external API communication. (Deployed on Render)
- External APIs (LLM Layer): Integrates with OpenAI (for deep phishing analysis) and Google Gemini (for the interactive AI tutor).
"""
    pdf.multi_cell(0, 7, body, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)

    # 2. Deep Dive
    pdf.set_font("helvetica", "B", 14)
    pdf.cell(0, 10, "2. Deep Dive into the Backend (Python & AI)", new_x="LMARGIN", new_y="NEXT")
    
    # Layer One
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 10, "Layer One: Statistical Model (statistical_model.py)", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("helvetica", "", 11)
    layer1 = """This layer acts as the first line of defense using a Naive-Bayes-inspired probabilistic risk scorer.
- How it works: It takes the raw text of an email and extracts features based on weighted keyword dictionaries.
- Feature Vectors Analyzed:
  * Urgency Words (e.g., "act now", "expire", "suspended")
  * Financial Keywords (e.g., "wire transfer", "SSN", "crypto")
  * Threat Language (e.g., "legal action", "arrest warrant")
  * Suspicious Link Patterns (e.g., IP-based URLs, URL shorteners)
  * Formatting Anomalies (e.g., ALL-CAPS ratio, excessive exclamation marks)
- Output: Computes a final probability score (0.0 to 1.0) and assigns a risk label ("Low", "Medium", "High", or "Critical")."""
    pdf.multi_cell(0, 7, layer1, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)

    # Layer Two
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 10, "Layer Two: Knowledge Engine (knowledge_engine.py)", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("helvetica", "", 11)
    layer2 = """This is an implementation of Knowledge Representation & Reasoning (Forward Chaining). It acts as the "expert system" that mimics how a human cybersecurity analyst thinks.
- Fact Extraction: Scans the email to establish logical facts (e.g. "claims_institution:bank of america", "requests_credentials").
- Rule Engine: Applies 10 hard-coded expert rules (IF-THEN conditions). Example: IF requests_credentials AND contains_link THEN flag as credential_phishing.
- Forward Chaining: Iteratively applies rules until it reaches a final conclusion about the threat."""
    pdf.multi_cell(0, 7, layer2, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)

    # Layer Three
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 10, "Layer Three: LLM Analysis (llm_service.py)", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("helvetica", "", 11)
    layer3 = """While the first two layers are deterministic and fast, this third layer uses Generative AI to explain the threat to the user in plain English.
- Integration: Connects to the OpenAI API (gpt-4o-mini).
- How it works: Takes the raw email text, the statistical risk score, and the fired rules, feeding them into a specific System Prompt.
- Output: Generates a 3-5 paragraph plain-English summary explaining what tactics the attacker used, why it's dangerous, and what the user should do."""
    pdf.multi_cell(0, 7, layer3, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)

    # AI Tutor Bot
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 10, "The AI Tutor Bot - 'Stark' (gemini_chat_service.py)", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("helvetica", "", 11)
    bot = """Separate from the scam detector, the backend also hosts an interactive conversational tutor.
- Integration: Powered by the Google Gemini 1.5/2.0 Flash API.
- Persona: Adopt the persona of Tony Stark (Iron Man) - confident, witty, and highly technical.
- Capabilities: Helps users set up their Gmail Live Scanner, explain phishing red flags, and act as a general tutor for the 10-module AI Masterclass."""
    pdf.multi_cell(0, 7, bot, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)

    # 3. Project Structure
    pdf.set_font("helvetica", "B", 14)
    pdf.cell(0, 10, "3. Backend Project Structure", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("courier", "", 10)
    structure = r"""backend/
|-- core/
|   |-- statistical_model.py  # Layer 1: Math & Probabilities
|   |-- knowledge_engine.py   # Layer 2: Logical Rules & Forward Chaining
|   |-- llm_service.py        # Layer 3: OpenAI GPT-4o-mini explanations
|   |-- gemini_chat_service.py# AI Tutor: Google Gemini powered Tony Stark bot
|   \-- gmail_service.py      # Handles live email fetching via IMAP
|-- routes/
|   |-- analyze.py            # API Endpoint for the 3-layer detection
|   \-- chat.py               # API Endpoint for the AI Tutor
|-- main.py                   # FastAPI server entry point
\-- requirements.txt          # Python dependencies"""
    pdf.multi_cell(0, 6, structure, new_x="LMARGIN", new_y="NEXT")

    output_path = os.path.join(os.getcwd(), "PhishShield_Architecture.pdf")
    pdf.output(output_path)
    print(f"PDF successfully generated at {output_path}")

if __name__ == "__main__":
    create_pdf()
