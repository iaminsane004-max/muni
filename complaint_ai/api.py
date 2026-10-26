"""
api.py
------
The AI microservice for the AI Municipal Complaint Analyzer.

This is what you (Member 3) hand off to Member 1 (frontend/citizen side)
and Member 2 (backend/database): a single HTTP endpoint that takes raw
complaint text and returns category + severity + priority, computed
automatically -- no "affected population" field required from the citizen.

Run:
    uvicorn api:app --reload --port 8001

Then POST to http://localhost:8001/analyze with JSON:
    {"complaint_text": "Live wire fell near the school gate"}

Response:
    {
      "category": "Electricity",
      "category_confidence": 0.91,
      "base_severity": "Medium",
      "final_severity": "High",
      "priority": "Urgent",
      "urgency_reasons": ["danger/safety language detected", "high-footfall/vulnerable location mentioned"]
    }

Member 2 can call this from the main backend (e.g. right after a complaint
is inserted into the database) and store the returned fields on the
complaint record. Member 1 never needs to ask the citizen to estimate
impact -- this endpoint IS the impact estimate.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os

from severity_rules import boost_severity, severity_to_priority

MODEL_DIR = "models"

app = FastAPI(
    title="AI Municipal Complaint Analyzer - AI Service",
    description="NLP classification + automatic severity/priority scoring for civic complaints.",
    version="0.1.0 (Phase 1 / MVP)",
)

category_model = None
severity_model = None


@app.on_event("startup")
def load_models():
    global category_model, severity_model
    cat_path = os.path.join(MODEL_DIR, "category_model.joblib")
    sev_path = os.path.join(MODEL_DIR, "severity_model.joblib")
    if not (os.path.exists(cat_path) and os.path.exists(sev_path)):
        raise RuntimeError(
            "Models not found. Run `python generate_dataset.py` then "
            "`python train_models.py` before starting the API."
        )
    category_model = joblib.load(cat_path)
    severity_model = joblib.load(sev_path)


class ComplaintRequest(BaseModel):
    complaint_text: str


class ComplaintResponse(BaseModel):
    category: str
    category_confidence: float
    base_severity: str
    final_severity: str
    priority: str
    urgency_reasons: list[str]


def clean_text(text: str) -> str:
    """Minimal text cleaning. Expand this later (lowercasing, removing
    special characters, spelling correction, etc.) as part of Phase 2
    'Advanced NLP / ML models' work."""
    return text.strip()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=ComplaintResponse)
def analyze_complaint(req: ComplaintRequest):
    if not req.complaint_text or not req.complaint_text.strip():
        raise HTTPException(status_code=400, detail="complaint_text cannot be empty")

    text = clean_text(req.complaint_text)

    # --- category prediction ---
    category = category_model.predict([text])[0]
    proba = category_model.predict_proba([text])[0]
    confidence = float(max(proba))

    # --- severity prediction (ML) + rule-based boost (no user input needed) ---
    base_severity = severity_model.predict([text])[0]
    final_severity, reasons = boost_severity(text, base_severity)
    priority = severity_to_priority(final_severity)

    return ComplaintResponse(
        category=category,
        category_confidence=round(confidence, 3),
        base_severity=base_severity,
        final_severity=final_severity,
        priority=priority,
        urgency_reasons=reasons,
    )
