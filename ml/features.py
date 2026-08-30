"""Feature engineering: convert a FinancialProfile DB row into a numpy feature vector."""
import numpy as np
from typing import Dict, Any


# ── Dimension weights for the composite resilience score ──────────────────────
DIMENSION_WEIGHTS = {
    "income_stability": 0.20,
    "cash_flow_health": 0.20,
    "debt_pressure": 0.20,
    "savings_resilience": 0.22,
    "spending_stability": 0.08,
    "payment_discipline": 0.10,
}

FEATURE_NAMES = [
    "income_to_emi_ratio",
    "savings_to_monthly_income_ratio",
    "expense_to_income_ratio",
    "missed_payment_rate",
    "employment_tenure_years",
    "debt_to_income_ratio",
    "savings_months_of_expenses",
    "income_volatility",
    "is_salaried",
]


def profile_to_dict(profile) -> Dict[str, Any]:
    """Convert a FinancialProfile object or dict to a plain dict."""
    if isinstance(profile, dict):
        return profile
    if hasattr(profile, "to_dict"):
        return profile.to_dict()
    return {
        "monthly_income": getattr(profile, "monthly_income", 0.0),
        "income_type": getattr(profile, "income_type", "salaried"),
        "employment_tenure_months": getattr(profile, "employment_tenure_months", 0),
        "monthly_expenses_total": getattr(profile, "monthly_expenses_total", 0.0),
        "emi_amount": getattr(profile, "emi_amount", 0.0),
        "savings_balance": getattr(profile, "savings_balance", 0.0),
        "missed_payments_last_year": getattr(profile, "missed_payments_last_year", 0),
        "payment_history": getattr(profile, "payment_history", []),
        "monthly_transactions": getattr(profile, "monthly_transactions", []),
        "existing_loans": getattr(profile, "existing_loans", []),
    }


def compute_income_volatility(monthly_transactions: list) -> float:
    """Compute coefficient of variation of monthly credits. Lower = more stable."""
    credits = [m.get("credits", 0) for m in monthly_transactions]
    if not credits or len(credits) < 2:
        return 0.0
    mean = np.mean(credits)
    if mean == 0:
        return 1.0
    return float(np.std(credits) / mean)


def compute_features(profile_dict: Dict[str, Any]) -> np.ndarray:
    """
    Returns a 1D numpy array of shape (len(FEATURE_NAMES),) with all raw features
    normalised to roughly [0, 1] for ML inference.
    """
    income = max(float(profile_dict.get("monthly_income", 0.0)), 1.0)
    emi = float(profile_dict.get("emi_amount", 0.0))
    savings = float(profile_dict.get("savings_balance", 0.0))
    expenses = float(profile_dict.get("monthly_expenses_total", 0.0))
    missed = int(profile_dict.get("missed_payments_last_year", 0))
    tenure_months = int(profile_dict.get("employment_tenure_months", 0))
    income_type = profile_dict.get("income_type", "salaried")
    transactions = profile_dict.get("monthly_transactions", [])

    total_loans = sum(
        loan.get("amount", 0) for loan in profile_dict.get("existing_loans", [])
    )

    income_to_emi = min(income / max(emi, 1.0), 10.0) / 10.0  # cap at 10x
    savings_to_income = min(savings / max(income, 1.0), 24.0) / 24.0  # cap at 24 months
    expense_to_income = min(expenses / max(income, 1.0), 2.0) / 2.0
    missed_rate = min(missed / 12.0, 1.0)
    tenure_years = min(tenure_months / 12.0, 10.0) / 10.0  # cap at 10 years
    debt_to_income = min(total_loans / max(income * 12.0, 1.0), 10.0) / 10.0
    savings_months = min(savings / max(expenses + emi, 1.0), 24.0) / 24.0
    volatility = compute_income_volatility(transactions)
    is_salaried = 1.0 if income_type == "salaried" else 0.0

    return np.array([
        income_to_emi,
        savings_to_income,
        expense_to_income,
        missed_rate,
        tenure_years,
        debt_to_income,
        savings_months,
        min(volatility, 1.0),
        is_salaried,
    ], dtype=np.float32)


def compute_dna_scores(profile_dict: Dict[str, Any]) -> Dict[str, float]:
    """
    Compute the six Financial DNA dimension scores (0–100 each).
    These are deterministic formula-based scores.
    """
    income = max(float(profile_dict.get("monthly_income", 0.0)), 1.0)
    emi = max(float(profile_dict.get("emi_amount", 0.0)), 0.0)
    savings = max(float(profile_dict.get("savings_balance", 0.0)), 0.0)
    expenses = max(float(profile_dict.get("monthly_expenses_total", 0.0)), 0.0)
    missed = max(int(profile_dict.get("missed_payments_last_year", 0)), 0)
    tenure_months = max(int(profile_dict.get("employment_tenure_months", 0)), 0)
    income_type = profile_dict.get("income_type", "salaried")
    transactions = profile_dict.get("monthly_transactions", [])

    # 1. Income Stability (0–100)
    volatility = compute_income_volatility(transactions)
    salaried_bonus = 20 if income_type == "salaried" else 5
    tenure_score = min(tenure_months / 36.0, 1.0) * 35
    stability_score = max(0, (1 - volatility) * 45 + tenure_score + salaried_bonus)
    income_stability = min(stability_score, 100)

    # 2. Cash-Flow Health (0–100): surplus percentage after obligations
    total_outflow = expenses + emi
    surplus_ratio = (income - total_outflow) / income
    if surplus_ratio < 0:
        cash_flow_health = max(0, 50 + surplus_ratio * 100)
    else:
        cash_flow_health = min(surplus_ratio * 160, 100)

    # 3. Debt Pressure (0–100): FOIR / EMI load
    emi_to_income = emi / income
    debt_pressure = max(0, min((1 - emi_to_income * 2.2) * 100, 100))

    # 4. Savings Resilience (0–100): months of essential expenses covered
    monthly_need = max(expenses + emi, 1.0)
    coverage_months = savings / monthly_need
    savings_resilience = min((coverage_months / 6.0) * 100.0, 100.0)

    # 5. Spending Stability (0–100)
    debits = [m.get("debits", 0) for m in transactions]
    if len(debits) >= 2:
        spend_cv = np.std(debits) / max(np.mean(debits), 1)
        spending_stability = max(0, min((1 - spend_cv) * 100, 100))
    else:
        expense_ratio = expenses / income
        spending_stability = max(30, min((1 - expense_ratio) * 100, 85))

    # 6. Payment Discipline (0–100): penalise missed payments
    payment_discipline = max(0, 100 - missed * 22)

    return {
        "income_stability": round(float(income_stability), 1),
        "cash_flow_health": round(float(cash_flow_health), 1),
        "debt_pressure": round(float(debt_pressure), 1),
        "savings_resilience": round(float(savings_resilience), 1),
        "spending_stability": round(float(spending_stability), 1),
        "payment_discipline": round(float(payment_discipline), 1),
    }


# ── 6 Financial DNA Dimensions ─────────────────────────────────────────────────
DNA_DIMENSIONS = [
    "income_stability",
    "cash_flow_health",
    "debt_pressure",
    "savings_resilience",
    "spending_stability",
    "payment_discipline",
]

_cached_model = None

def _get_lr_model():
    global _cached_model
    if _cached_model is not None:
        return _cached_model
    import os
    import joblib
    models_dir = os.path.join(os.path.dirname(__file__), "models")
    model_path = os.path.join(models_dir, "logistic_regression.joblib")
    if os.path.exists(model_path):
        try:
            _cached_model = joblib.load(model_path)
            return _cached_model
        except Exception:
            pass
    return None


def compute_resilience_score(dna_scores: Dict[str, float]) -> float:
    """
    Computes final resilience score (0–100) as a weighted composite of the 6
    Financial DNA dimensions with liquidity vulnerability penalty.
    """
    base_score = sum(dna_scores[dim] * weight for dim, weight in DIMENSION_WEIGHTS.items())

    # Severe liquidity penalty if savings resilience is critical (< 25% or < 1.5 months runway)
    sav_score = dna_scores.get("savings_resilience", 50.0)
    if sav_score < 25.0:
        liquidity_penalty = ((25.0 - sav_score) / 25.0) * 22.0
        base_score -= liquidity_penalty

    # Cash flow deficit penalty if cash flow health is critically low
    cf_score = dna_scores.get("cash_flow_health", 50.0)
    if cf_score < 25.0:
        deficit_penalty = ((25.0 - cf_score) / 25.0) * 16.0
        base_score -= deficit_penalty

    final = max(5.0, min(base_score, 98.0))
    return round(float(final), 1)


def compute_loan_recommendation(
    profile_dict: Dict[str, Any], resilience_score: float
) -> Dict[str, Any]:
    """
    Compute a sustainable borrowing limit based on resilience score and
    income minus existing obligations.
    """
    income = max(float(profile_dict.get("monthly_income", 0.0)), 0.0)
    emi = max(float(profile_dict.get("emi_amount", 0.0)), 0.0)
    expenses = max(float(profile_dict.get("monthly_expenses_total", 0.0)), 0.0)
    savings = max(float(profile_dict.get("savings_balance", 0.0)), 0.0)

    # Residual income after current obligations
    residual = income - emi - expenses
    monthly_need = max(expenses + emi, 1.0)
    coverage_months = savings / monthly_need

    # If resilience score is weak (< 40) or no surplus or zero savings runway, limit is restricted
    if resilience_score < 40 or residual <= 0 or coverage_months < 0.5:
        return {
            "sustainable_limit": 0.0,
            "max_safe_emi": 0.0,
            "recommended_tenure_months": 36,
        }

    # Maximum additional EMI affordable = 30% of residual (stress-test adjusted)
    resilience_factor = (resilience_score / 100.0) ** 1.2
    max_additional_emi = max(0.0, residual * 0.28 * resilience_factor)

    # Assume a 5-year (60-month) personal loan at ~12% annual interest
    r = 0.12 / 12  # monthly rate
    n = 60         # tenure months
    if max_additional_emi > 0 and r > 0:
        principal = max_additional_emi * ((1 + r) ** n - 1) / (r * (1 + r) ** n)
    else:
        principal = 0

    # Round down to nearest 10,000
    sustainable_limit = max(0.0, (principal // 10000) * 10000)
    recommended_tenure = 60

    return {
        "sustainable_limit": float(sustainable_limit),
        "max_safe_emi": round(float(max_additional_emi), 0),
        "recommended_tenure_months": recommended_tenure,
    }
