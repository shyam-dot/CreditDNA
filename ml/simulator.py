"""
Financial stress simulator.
Perturbs the financial profile by a given scenario + magnitude,
then recomputes the resilience score and estimates months-to-distress.
"""
from typing import Dict, Any, Optional
import copy

from features import (
    compute_dna_scores,
    compute_resilience_score,
    profile_to_dict,
)


SCENARIO_CONFIG = {
    "income_drop": {
        "label": "Income Drop",
        "description": "Monthly income reduced by the specified percentage.",
    },
    "job_loss": {
        "label": "Job Loss",
        "description": "Income drops to zero; savings cover monthly obligations.",
    },
    "emergency_expense": {
        "label": "Emergency Expense",
        "description": "One-time depletion of savings by the specified percentage.",
    },
    "emi_increase": {
        "label": "EMI Increase",
        "description": "Existing EMI increases by the specified percentage.",
    },
}


def _perturb_profile(
    profile_dict: Dict[str, Any], scenario: str, magnitude: float
) -> Dict[str, Any]:
    """Return a new profile dict with the shock applied."""
    p = copy.deepcopy(profile_dict)
    magnitude = max(0.0, min(magnitude, 1.0))

    if scenario == "income_drop":
        p["monthly_income"] = max(0.0, float(p.get("monthly_income", 0.0)) * (1.0 - magnitude))

    elif scenario == "job_loss":
        p["monthly_income"] = 0.0
        p["income_type"] = "freelance"
        p["employment_tenure_months"] = 0

    elif scenario == "emergency_expense":
        current_savings = float(p.get("savings_balance", 0.0))
        # If user has savings, deplete by magnitude (e.g. 50% drain); if savings is 0 or low, shock adds to expense obligations
        if current_savings > 1000:
            p["savings_balance"] = max(0.0, current_savings * (1.0 - magnitude))
        else:
            p["savings_balance"] = 0.0
            p["monthly_expenses_total"] = float(p.get("monthly_expenses_total", 0.0)) * (1.0 + magnitude * 0.5)

    elif scenario == "emi_increase":
        p["emi_amount"] = float(p.get("emi_amount", 0.0)) * (1.0 + magnitude)
        if p.get("existing_loans"):
            for loan in p["existing_loans"]:
                loan["emi"] = float(loan.get("emi", 0.0)) * (1.0 + magnitude)

    return p


def _estimate_months_to_distress(
    profile_dict: Dict[str, Any], perturbed: Dict[str, Any]
) -> Optional[float]:
    """
    Estimate how many months of savings runway the person has after the shock.
    Returns None if financially stable (positive monthly surplus).
    """
    income = float(perturbed.get("monthly_income", 0.0))
    expenses = float(perturbed.get("monthly_expenses_total", 0.0))
    emi = float(perturbed.get("emi_amount", 0.0))
    savings = float(perturbed.get("savings_balance", 0.0))

    monthly_deficit = (expenses + emi) - income
    if monthly_deficit <= 0:
        return None  # Surplus — maintaining monthly cash flow

    if savings <= 0:
        return 0.0

    months = savings / monthly_deficit
    return round(months, 1)


def run_stress_simulation(
    profile,  # SQLAlchemy FinancialProfile row OR dict
    scenario: str,
    magnitude: float,
    original_score: float,
) -> Dict[str, Any]:
    """
    Run a stress simulation.

    Args:
        profile: FinancialProfile ORM row or dict.
        scenario: One of "income_drop" | "job_loss" | "emergency_expense" | "emi_increase"
        magnitude: Float [0, 1] — severity of the shock.
        original_score: The pre-shock resilience score.

    Returns:
        Dict with perturbed_score, score_delta, months_to_distress, outcome_summary.
    """
    if hasattr(profile, "__dict__"):
        profile_dict = profile_to_dict(profile)
    else:
        profile_dict = profile

    perturbed = _perturb_profile(profile_dict, scenario, magnitude)
    dna_perturbed = compute_dna_scores(perturbed)
    perturbed_score = compute_resilience_score(dna_perturbed)
    score_delta = round(perturbed_score - original_score, 1)
    months_to_distress = _estimate_months_to_distress(profile_dict, perturbed)

    # Build outcome summary
    scenario_label = SCENARIO_CONFIG.get(scenario, {}).get("label", scenario)
    pct = int(magnitude * 100)

    if months_to_distress is None:
        outcome_summary = (
            f"Even after a {pct}% {scenario_label.lower()}, "
            f"you maintain a positive monthly surplus. Resilience score: {perturbed_score}."
        )
    elif months_to_distress < 3:
        outcome_summary = (
            f"A {pct}% {scenario_label.lower()} would exhaust savings in "
            f"{months_to_distress:.0f} months — immediate action needed."
        )
    else:
        outcome_summary = (
            f"A {pct}% {scenario_label.lower()} would give you roughly "
            f"{months_to_distress:.0f} months of runway before finances become strained."
        )

    return {
        "perturbed_score": perturbed_score,
        "score_delta": score_delta,
        "months_to_distress": months_to_distress,
        "outcome_summary": outcome_summary,
        "dna_perturbed": dna_perturbed,
    }
