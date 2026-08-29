"""
Train Logistic Regression, Random Forest, and XGBoost on a synthetic
financial resilience dataset. Save the best model to ml/models/.
"""
import os
import sys
import json
import numpy as np
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
import xgboost as xgb

from features import FEATURE_NAMES, compute_features

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)


def generate_synthetic_dataset(n_samples: int = 2000, seed: int = 42):
    """
    Generate a synthetic labeled dataset of financial profiles.
    Label: 1 = resilient (score >= 60), 0 = not resilient.
    """
    rng = np.random.RandomState(seed)
    X = []
    y = []

    for _ in range(n_samples):
        income = rng.uniform(20000, 200000)
        emi = rng.uniform(0, income * 0.6)
        savings = rng.uniform(0, income * 30)
        expenses = rng.uniform(income * 0.2, income * 0.9)
        missed = rng.choice([0, 0, 0, 0, 1, 2, 3, 4, 5], p=[0.4, 0.2, 0.15, 0.1, 0.06, 0.04, 0.02, 0.02, 0.01])
        tenure_months = rng.randint(0, 180)
        income_type = rng.choice(["salaried", "freelance"], p=[0.6, 0.4])
        total_loans = rng.uniform(0, income * 20)
        volatility = rng.uniform(0, 0.8) if income_type == "freelance" else rng.uniform(0, 0.2)

        income_to_emi = min(income / max(emi, 1), 10.0) / 10.0
        savings_to_income = min(savings / max(income, 1), 24.0) / 24.0
        expense_to_income = min(expenses / max(income, 1), 2.0) / 2.0
        missed_rate = min(missed / 12.0, 1.0)
        tenure_years = min(tenure_months / 12.0, 10.0) / 10.0
        debt_to_income = min(total_loans / max(income * 12, 1), 10.0) / 10.0
        savings_months = min(savings / max(expenses + emi, 1), 24.0) / 24.0
        is_salaried = 1.0 if income_type == "salaried" else 0.0

        features = [
            income_to_emi, savings_to_income, expense_to_income,
            missed_rate, tenure_years, debt_to_income,
            savings_months, volatility, is_salaried
        ]
        X.append(features)

        # Label logic: resilient if good income buffer, savings, and no missed payments
        score = (
            income_to_emi * 25
            + savings_to_income * 20
            + (1 - expense_to_income) * 15
            + (1 - missed_rate) * 15
            + tenure_years * 10
            + (1 - debt_to_income) * 10
            + savings_months * 15
            + is_salaried * 5
            - volatility * 10
        )
        y.append(1 if score > 60 else 0)

    return np.array(X, dtype=np.float32), np.array(y)


def train():
    print("Generating synthetic dataset...")
    X, y = generate_synthetic_dataset(n_samples=3000)
    print(f"Dataset shape: {X.shape}, class balance: {y.mean():.2%} resilient")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    models = {
        "logistic_regression": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(max_iter=1000, random_state=42)),
        ]),
        "random_forest": RandomForestClassifier(
            n_estimators=200, max_depth=8, random_state=42, n_jobs=-1
        ),
        "xgboost": xgb.XGBClassifier(
            n_estimators=200, max_depth=6, learning_rate=0.1,
            random_state=42, eval_metric="logloss", verbosity=0
        ),
    }

    results = {}
    for name, model in models.items():
        print(f"\nTraining {name}...")
        cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring="roc_auc")
        model.fit(X_train, y_train)
        test_score = model.score(X_test, y_test)
        results[name] = {"cv_auc": cv_scores.mean(), "test_acc": test_score}
        print(f"  CV AUC: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")
        print(f"  Test accuracy: {test_score:.3f}")
        print(classification_report(y_test, model.predict(X_test)))
        joblib.dump(model, os.path.join(MODELS_DIR, f"{name}.joblib"))

    # Pick best by CV AUC
    best_name = max(results, key=lambda n: results[n]["cv_auc"])
    print(f"\nBest model: {best_name} (CV AUC: {results[best_name]['cv_auc']:.3f})")

    # Save a symlink / copy as "best_model.joblib"
    best_path = os.path.join(MODELS_DIR, f"{best_name}.joblib")
    best_out = os.path.join(MODELS_DIR, "best_model.joblib")
    import shutil
    shutil.copy2(best_path, best_out)

    # Save metadata
    meta = {
        "best_model": best_name,
        "feature_names": FEATURE_NAMES,
        "results": results,
        "model_version": "v1.0",
    }
    with open(os.path.join(MODELS_DIR, "model_metadata.json"), "w") as f:
        json.dump(meta, f, indent=2)
    print(f"Models saved to {MODELS_DIR}")


if __name__ == "__main__":
    train()
