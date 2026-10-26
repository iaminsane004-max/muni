# AI Municipal Complaint Analyzer — Member 3 AI Module

This is the AI/NLP piece of the team project (Member 3: NLP, severity/priority
prediction, and — in Phase 2 — image analysis and similarity checking).

## What this covers for the October (50%) checkpoint

Per the project roadmap slide, Phase 1 (MVP) only requires **"Initial AI:
NLP complaint classification, Basic severity/priority"** from the AI side —
not image analysis or similarity/duplicate detection (those are Phase 2).
This module delivers exactly that slice, working end-to-end:

1. **Category classification** — TF-IDF + Logistic Regression, trained on a
   labeled complaint dataset, predicts one of: Water Supply, Electricity,
   Roads & Potholes, Garbage & Sanitation, Streetlight, Sewage/Drainage.
2. **Severity/priority prediction** — a second TF-IDF + Logistic Regression
   model predicts Low/Medium/High severity directly from complaint wording,
   with a rule-based "urgency booster" layer (`severity_rules.py`) that
   escalates severity when danger, health-risk, or high-footfall language is
   detected (fire, live wire, sewage overflow, near a school, etc.).
3. **API** — `api.py` exposes `/analyze`, which Member 2 (backend) calls
   right after a complaint is saved to the database, and stores the
   returned category/severity/priority on the record.

## Why there's no "affected population" field

The original roadmap slide listed "Affected population tag" as something
the citizen types in on the frontend. That's a self-reported number with
two problems: citizens can't estimate it accurately, and it's easy to
inflate to get priority treatment. Since severity/priority is this module's
job anyway, it's inferred automatically from the complaint's language and
category — a live wire near a school is flagged urgent without anyone
entering a headcount. Tell Member 1 to drop that field from the citizen
form; nothing downstream depends on it.

## How to run it

```bash
pip install -r requirements.txt
python generate_dataset.py      # builds data/complaints_dataset.csv
python train_models.py          # trains + saves models/*.joblib
uvicorn api:app --reload --port 8001
```

Test it:
```bash
curl -X POST http://localhost:8001/analyze \
  -H "Content-Type: application/json" \
  -d '{"complaint_text": "A live wire has fallen near the school gate"}'
```

## What's intentionally left for Phase 2 (do not build yet)

- Image evidence analysis (OpenCV / CV model)
- Similarity / duplicate complaint detection (hashing or embedding
  similarity)
- Swapping the synthetic dataset for a real one (Kaggle municipal
  complaints dataset, or scraped/collected real complaints, if your guide
  wants it)
- Continual learning from resolved complaints

Keeping these out for now is correct, not a shortcut — the roadmap slide
explicitly scopes them to Phase 2 ("Advanced AI: Better NLP/ML models,
Image evidence analysis, Similar/repeated complaint detection").

## Files

- `generate_dataset.py` — builds the labeled training data
- `train_models.py` — trains and saves the two classifiers
- `severity_rules.py` — keyword-based urgency escalation logic
- `api.py` — FastAPI service with the `/analyze` endpoint
- `data/complaints_dataset.csv` — generated training data
- `models/*.joblib` — trained model files
