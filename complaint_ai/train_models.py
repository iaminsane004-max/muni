"""
train_models.py
----------------
Trains two text-classification pipelines on the complaint dataset:

  1. category_model  -> predicts the complaint category
                         (Water Supply, Roads & Potholes, etc.)
  2. severity_model  -> predicts base severity (Low / Medium / High)
                         from complaint wording alone (no affected-population
                         field needed -- see severity_rules.py for the
                         rule-based layer that sits on top of this at
                         inference time).

Both are simple, explainable scikit-learn pipelines:
    TfidfVectorizer -> LogisticRegression
This is a completely standard, defensible choice for a final-year project
at the 50% checkpoint: it's fast to train, easy to explain in a viva
("we vectorize complaint text with TF-IDF and classify with logistic
regression"), and gives calibrated probabilities you can show as
"confidence" in the dashboard.

Run:
    python generate_dataset.py   # only needed once, or to regenerate data
    python train_models.py
Produces:
    models/category_model.joblib
    models/severity_model.joblib
"""

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib


def train_pipeline(X_train, y_train):
    pipeline = Pipeline(
        [
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1, stop_words="english")),
            ("clf", LogisticRegression(max_iter=1000)),
        ]
    )
    pipeline.fit(X_train, y_train)
    return pipeline


def main():
    df = pd.read_csv("data/complaints_dataset.csv")
    print(f"Loaded {len(df)} labeled complaints.")

    X = df["complaint_text"]
    y_category = df["category"]
    y_severity = df["severity"]

    # --- Category model ---
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_category, test_size=0.2, random_state=42, stratify=y_category
    )
    category_model = train_pipeline(X_train, y_train)
    preds = category_model.predict(X_test)
    print("\n=== Category model report ===")
    print(classification_report(y_test, preds, zero_division=0))

    # --- Severity model ---
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_severity, test_size=0.2, random_state=42, stratify=y_severity
    )
    severity_model = train_pipeline(X_train, y_train)
    preds = severity_model.predict(X_test)
    print("\n=== Severity model report ===")
    print(classification_report(y_test, preds, zero_division=0))

    joblib.dump(category_model, "models/category_model.joblib")
    joblib.dump(severity_model, "models/severity_model.joblib")
    print("\nSaved models/category_model.joblib and models/severity_model.joblib")


if __name__ == "__main__":
    main()
