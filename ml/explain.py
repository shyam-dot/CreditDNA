"""
SHAP-based (or feature-importance fallback) explanation context builder.
Calls llm_client.generate_explanation() with structured context.
"""
import os
import sys
import numpy as np
from typing import Dict, Any, List, Optional

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False

from features import (
    FEATURE_NAMES, compute_features, compute_dna_scores,
    compute_resilience_score, compute_loan_recommendation
)
from llm_client import generate_explanation


def _get_top_factors(model, feature_vector: np.ndarray, n: int = 3) -> List[Dict]:
    """
    Use SHAP (if available) or fall back to permutation-style importance.
    Returns top N factors with direction and magnitude.
    """
    if SHAP_AVAILABLE:
        try:
            explainer = shap.TreeExplainer(model)
            shap_vals = explainer.shap_values(feature_vector.reshape(1, -1))
            if isinstance(shap_vals, list):
                vals = shap_vals[1][0]  # class 1 (resilient)
            else:
                vals = shap_vals[0]

            indices = np.argsort(np.abs(vals))[::-1][:n]
            return [
                {
                    "name": FEATURE_NAMES[i],
                    "label": _feature_label(FEATURE_NAMES[i]),
                    "direction": "positive" if vals[i] > 0 else "negative",
                    "magnitude": round(float(abs(vals[i])), 3),
                }
                for i in indices
            ]
        except Exception:
            pass

    # Fallback: static feature importance from DNA scores
    return []


def _feature_label(name: str) -> str:
    labels = {
        "income_to_emi_ratio": "income-to-EMI ratio",
        "savings_to_monthly_income_ratio": "savings buffer",
        "expense_to_income_ratio": "expense-to-income ratio",
        "missed_payment_rate": "payment history",
        "employment_tenure_years": "employment tenure",
        "debt_to_income_ratio": "debt-to-income ratio",
        "savings_months_of_expenses": "months of savings coverage",
        "income_volatility": "income consistency",
        "is_salaried": "employment type",
    }
    return labels.get(name, name.replace("_", " "))


def explain_resilience_score(
    profile_dict: Dict[str, Any],
    model,
    score: float,
    dna_scores: Dict[str, float],
) -> Dict[str, Any]:
    """Return explanation text + top_factors for the resilience score."""
    features = compute_features(profile_dict)
    top_factors = _get_top_factors(model, features) if model else []

    # Use DNA scores as top factors if SHAP not available
    if not top_factors:
        sorted_dims = sorted(dna_scores.items(), key=lambda x: x[1])
        top_factors = [
            {
                "name": dim,
                "label": dim.replace("_", " ").title(),
                "direction": "negative" if val < 60 else "positive",
                "magnitude": round(abs(val - 50) / 50, 2),
            }
            for dim, val in sorted_dims[:3]
        ]

    context = {
        "score": score,
        "top_factors": top_factors,
        "income": profile_dict.get("monthly_income"),
        "emi": profile_dict.get("emi_amount"),
        "missed_payments": profile_dict.get("missed_payments_last_year"),
        "savings": profile_dict.get("savings_balance"),
    }
    text = generate_explanation(context, "resilience_score")
    return {"explanation_text": text, "top_factors": top_factors}


def explain_dna_dimension(
    dimension: str, score: float, profile_dict: Dict[str, Any]
) -> str:
    """Return a plain-English explanation for one DNA dimension."""
    context = {
        "dimension": dimension.replace("_", " ").title(),
        "score": score,
        "income": profile_dict.get("monthly_income"),
        "emi": profile_dict.get("emi_amount"),
        "savings": profile_dict.get("savings_balance"),
        "missed_payments": profile_dict.get("missed_payments_last_year"),
    }
    return generate_explanation(context, "dna_dimension")


def explain_loan_recommendation(
    sustainable_limit: float, max_safe_emi: float, resilience_score: float,
    profile_dict: Dict[str, Any]
) -> str:
    context = {
        "sustainable_limit": sustainable_limit,
        "max_safe_emi": max_safe_emi,
        "resilience_score": resilience_score,
        "income": profile_dict.get("monthly_income"),
        "current_emi": profile_dict.get("emi_amount"),
    }
    return generate_explanation(context, "loan_recommendation")
