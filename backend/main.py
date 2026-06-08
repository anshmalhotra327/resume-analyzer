from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import pdfplumber
import io
import json

from google import genai

app = FastAPI(title="Resume Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ML model
model = joblib.load("resume_model.pkl")

# Configure Gemini
client = genai.Client(api_key="YOUR_GEMINI_KEY_HERE")


def extract_text(pdf_bytes: bytes) -> str:
    text = ""
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


def extract_features(text: str) -> dict:
    text_lower = text.lower()
    features = {
        "job_category": "Unknown",
        "education_level": "Unknown",
        "gpa": 0,
        "years_experience": 0,
        "num_skills": 0,
        "skills": "",
        "num_projects": 0,
        "num_internships": 0,
        "has_linkedin": 0,
        "has_github": 0,
        "has_portfolio": 0,
        "has_links": 0,
        "has_summary_section": 0,
        "num_certifications": 0,
        "resume_word_length": len(text.split()),
        "resume_pages": 1,
        "num_quantified_achievements": 0,
        "num_action_verbs": 0,
        "has_volunteer_work": 0,
        "has_awards": 0,
        "has_publications": 0,
        "num_languages_known": 0,
        "formatting_quality_score": 5,
        "job_title_match": 0
    }

    features["has_linkedin"] = int("linkedin.com" in text_lower)
    features["has_github"] = int("github.com" in text_lower)
    portfolio_words = ["portfolio", "behance", "dribbble"]
    features["has_portfolio"] = int(any(w in text_lower for w in portfolio_words))
    features["has_links"] = int(
        features["has_linkedin"] or features["has_github"] or features["has_portfolio"]
    )
    summary_words = ["summary", "objective", "profile", "about me"]
    features["has_summary_section"] = int(any(w in text_lower for w in summary_words))
    features["num_projects"] = text_lower.count("project")
    cert_words = ["certificate", "certification", "certified"]
    features["num_certifications"] = sum(text_lower.count(w) for w in cert_words)
    features["has_awards"] = int("award" in text_lower)
    features["has_publications"] = int("publication" in text_lower or "published" in text_lower)
    features["has_volunteer_work"] = int("volunteer" in text_lower)

    return features


@app.post("/analyze")
async def analyze_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    pdf_bytes = await file.read()
    resume_text = extract_text(pdf_bytes)

    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")

    features = extract_features(resume_text)
    df = pd.DataFrame([features])
    score = round(float(model.predict(df)[0]), 2)

    return {
        "score": score,
        "resume_text": resume_text,
        "features": features
    }


class SuggestRequest(BaseModel):
    resume_text: str
    score: float


@app.post("/suggestions")
async def get_suggestions(req: SuggestRequest):
    prompt = f"""
    You are an expert resume reviewer.
    Resume Score: {req.score}/100
    Resume:
    {req.resume_text}

    Analyze and provide structured JSON with:
    {{
      "strengths": ["..."],
      "weaknesses": ["..."],
      "improvements": ["..."],
      "missing_sections": ["..."],
      "final_recommendation": "..."
    }}
    Return ONLY the JSON, no extra text.
    """
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    text = response.text.strip().lstrip("```json").rstrip("```").strip()
    try:
        return json.loads(text)
    except Exception:
        return {"raw": response.text}


class QuestionsRequest(BaseModel):
    resume_text: str


@app.post("/questions")
async def get_questions(req: QuestionsRequest):
    prompt = f"""
    This is a candidate resume:
    {req.resume_text}

    Generate 5 technical interview questions as JSON:
    {{"questions": ["Q1...", "Q2...", "Q3...", "Q4...", "Q5..."]}}
    Return ONLY the JSON, no extra text.
    """
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    text = response.text.strip().lstrip("```json").rstrip("```").strip()
    try:
        return json.loads(text)
    except Exception:
        return {"questions": [response.text]}


class EvaluateRequest(BaseModel):
    question: str
    answer: str


@app.post("/evaluate")
async def evaluate_answer(req: EvaluateRequest):
    prompt = f"""
    Question: {req.question}
    Candidate Answer: {req.answer}

    Evaluate as JSON:
    {{
      "score": 8,
      "strengths": ["..."],
      "weaknesses": ["..."],
      "correct_answer": "..."
    }}
    Return ONLY the JSON, no extra text.
    """
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    text = response.text.strip().lstrip("```json").rstrip("```").strip()
    try:
        return json.loads(text)
    except Exception:
        return {"raw": response.text}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)