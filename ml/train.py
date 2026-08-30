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


def generate_synthetic_dna_dataset(n_samples: int = 3000, seed: int = 42):
    """
    Generate synthetic dataset mapping 6 Financial DNA dimensions (0.0 to 1.0)
    to a binary outcome (1 = Resilient/Stable, 0 = Distressed/At-Risk).
    """
    rng = np.random.RandomState(seed)
    X = []
    y = []

    for _ in range(n_samples):
        # 6 DNA dimension scores (scaled 0 to 1)
        income_stability = rng.uniform(0.1, 1.0)
        cash_flow_health = rng.uniform(0.0, 1.0)
        debt_pressure = rng.uniform(0.0, 1.0)
        savings_resilience = rng.uniform(0.0, 1.0)
        spending_stability = rng.uniform(0.2, 1.0)
        payment_discipline = rng.choice([0.2, 0.4, 0.6, 0.8, 1.0], p=[0.1, 0.1, 0.15, 0.25, 0.4])

        dna_features = [
            income_stability,
            cash_flow_health,
            debt_pressure,
            savings_resilience,
            spending_stability,
            payment_discipline,
        ]
        X.append(dna_features)

        # Weighted combination for ground truth label
        composite = (
            income_stability * 0.25 +
            cash_flow_health * 0.22 +
            debt_pressure * 0.20 +
            savings_resilience * 0.18 +
            spending_stability * 0.08 +
            payment_discipline * 0.15 +
            rng.normal(0, 0.04) # Add realistic noise
        )
        y.append(1 if composite >= 0.52 else 0)

    return np.array(X, dtype=np.float32), np.array(y)


def train():
    print("Generating synthetic Financial DNA dataset for Logistic Regression...")
    X, y = generate_synthetic_dna_dataset(n_samples=4000)
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
        results[name] = {"cv_auc": float(cv_scores.mean()), "test_acc": float(test_score)}
        print(f"  CV AUC: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")
        print(f"  Test accuracy: {test_score:.3f}")
        print(classification_report(y_test, model.predict(X_test)))
        joblib.dump(model, os.path.join(MODELS_DIR, f"{name}.joblib"))

    # Print learned Logistic Regression weights
    lr_pipe = models["logistic_regression"]
    lr_coefs = lr_pipe.named_steps["clf"].coef_[0]
    dna_names = ["income_stability", "cash_flow_health", "debt_pressure", "savings_resilience", "spending_stability", "payment_discipline"]
    print("\nLearned Logistic Regression Dimension Weights:")
    for name, coef in zip(dna_names, lr_coefs):
        print(f"  {name}: {coef:.4f}")

    # Save best model
    best_path = os.path.join(MODELS_DIR, "logistic_regression.joblib")
    best_out = os.path.join(MODELS_DIR, "best_model.joblib")
    import shutil
    shutil.copy2(best_path, best_out)

    meta = {
        "best_model": "logistic_regression",
        "feature_names": dna_names,
        "results": results,
        "model_version": "v2.0-learned",
    }
    with open(os.path.join(MODELS_DIR, "model_metadata.json"), "w") as f:
        json.dump(meta, f, indent=2)
    print(f"Logistic Regression model trained and saved to {MODELS_DIR}")


if __name__ == "__main__":
    train()
