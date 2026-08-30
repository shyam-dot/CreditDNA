"""
Dynamic Dashboard & Financial Entries API:
Handles user-submitted financial snapshots, calculates ML Logistic Regression Resilience Scores,
builds DNA profiles, sustainable credit limits, and maintains timestamped score history.
"""
import os
import sys
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from typing import List, Dict, Any

from app.database import get_db
from app.dependencies import get_current_user
from app import models, schemas
from app.routes.utils import score_to_band

# Import ML engine functions
ml_dir = os.path.join(os.path.dirname(__file__), "..", "..", "ml")
if ml_dir not in sys.path:
    sys.path.insert(0, ml_dir)

try:
    from features import (
        compute_dna_scores,
        compute_resilience_score,
        compute_loan_recommendation,
        _get_lr_model,
    )
    from explain import (
        explain_resilience_score,
        explain_dna_dimension,
        explain_loan_recommendation,
    )
except Exception as e:
    print(f"Error importing ML engine: {e}")

router = APIRouter(prefix="/api", tags=["dashboard"])


def _calculate_user_dashboard(
    user_ref,
    current_user: models.User,
    latest_entry_dict: Dict[str, Any],
    db,
    save_history: bool = False,
) -> schemas.DashboardResponse:
    """Calculate DNA, ML Resilience Score, and Loan Limit for entry, optionally save score history, return Dashboard."""
    dna_dict = compute_dna_scores(latest_entry_dict)
    score_val = compute_resilience_score(dna_dict)
    band, color = score_to_band(score_val)

    # Generate explanations
    model = _get_lr_model()
    res_exp = explain_resilience_score(latest_entry_dict, model, score_val, dna_dict)
    loan_rec = compute_loan_recommendation(latest_entry_dict, score_val)
    loan_exp = explain_loan_recommendation(
        loan_rec["sustainable_limit"],
        loan_rec["max_safe_emi"],
        score_val,
        latest_entry_dict,
    )

    now_iso = datetime.utcnow().isoformat()
    now_dt = datetime.utcnow()

    # Build DNA dimension schemas with explanations
    dna_out = schemas.FinancialDNAOut(
        income_stability=schemas.DNADimension(
            score=dna_dict["income_stability"],
            label="Income Stability",
            explanation=explain_dna_dimension("income_stability", dna_dict["income_stability"], latest_entry_dict),
        ),
        cash_flow_health=schemas.DNADimension(
            score=dna_dict["cash_flow_health"],
            label="Cash-Flow Health",
            explanation=explain_dna_dimension("cash_flow_health", dna_dict["cash_flow_health"], latest_entry_dict),
        ),
        debt_pressure=schemas.DNADimension(
            score=dna_dict["debt_pressure"],
            label="Debt Pressure",
            explanation=explain_dna_dimension("debt_pressure", dna_dict["debt_pressure"], latest_entry_dict),
        ),
        savings_resilience=schemas.DNADimension(
            score=dna_dict["savings_resilience"],
            label="Savings Resilience",
            explanation=explain_dna_dimension("savings_resilience", dna_dict["savings_resilience"], latest_entry_dict),
        ),
        spending_stability=schemas.DNADimension(
            score=dna_dict["spending_stability"],
            label="Spending Stability",
            explanation=explain_dna_dimension("spending_stability", dna_dict["spending_stability"], latest_entry_dict),
        ),
        payment_discipline=schemas.DNADimension(
            score=dna_dict["payment_discipline"],
            label="Payment Discipline",
            explanation=explain_dna_dimension("payment_discipline", dna_dict["payment_discipline"], latest_entry_dict),
        ),
        computed_at=now_dt,
    )

    resilience_out = schemas.ResilienceScoreOut(
        score=score_val,
        band=band,
        band_color=color,
        explanation_text=res_exp["explanation_text"],
        top_factors=res_exp.get("top_factors"),
        computed_at=now_dt,
    )

    loan_out = schemas.LoanRecommendationOut(
        sustainable_limit=loan_rec["sustainable_limit"],
        max_safe_emi=loan_rec["max_safe_emi"],
        recommended_tenure_months=loan_rec["recommended_tenure_months"],
        explanation_text=loan_exp,
        computed_at=now_dt,
    )

    # Save timestamped score to scores subcollection ONLY when saving a new entry
    if save_history:
        score_doc = {
            "timestamp": latest_entry_dict.get("timestamp", now_iso),
            "score": score_val,
            "band": band,
            "monthly_income": float(latest_entry_dict.get("monthly_income", 0.0)),
            "savings_balance": float(latest_entry_dict.get("savings_balance", 0.0)),
        }
        user_ref.collection("scores").add(score_doc)

    # Fetch full score history
    score_history_docs = list(user_ref.collection("scores").stream())
    # Sort docs chronologically by raw timestamp
    score_history_docs.sort(key=lambda d: d.to_dict().get("timestamp", ""))
    
    score_history: List[schemas.ScoreHistoryPoint] = []
    for doc in score_history_docs:
        d = doc.to_dict()
        ts = d.get("timestamp", now_iso)
        try:
            parsed_dt = datetime.fromisoformat(ts)
            display_ts = parsed_dt.strftime("%b %d, %H:%M")
        except Exception:
            display_ts = ts[:16]

        score_history.append(
            schemas.ScoreHistoryPoint(
                timestamp=display_ts,
                score=float(d.get("score", 0.0)),
                band=d.get("band", "moderate"),
                monthly_income=float(d.get("monthly_income", 0.0)),
                savings_balance=float(d.get("savings_balance", 0.0)),
            )
        )

    # If score_history is empty, supply at least the current score
    if not score_history:
        score_history.append(
            schemas.ScoreHistoryPoint(
                timestamp="Current",
                score=score_val,
                band=band,
                monthly_income=float(latest_entry_dict.get("monthly_income", 0.0)),
                savings_balance=float(latest_entry_dict.get("savings_balance", 0.0)),
            )
        )

    return schemas.DashboardResponse(
        user_name=current_user.name,
        user_email=current_user.email,
        has_onboarded=True,
        resilience_score=resilience_out,
        dna=dna_out,
        loan_recommendation=loan_out,
        score_history=score_history,
    )


@router.post("/entries", response_model=schemas.DashboardResponse)
def create_financial_entry(
    payload: schemas.FinancialEntryCreate,
    current_user: models.User = Depends(get_current_user),
    db=Depends(get_db),
):
    """Add a new dated financial entry (onboarding or month simulation) and recalculate score history."""
    user_ref = db.collection("users").document(current_user.firebase_uid)

    entry_data = {
        "timestamp": datetime.utcnow().isoformat(),
        "monthly_income": float(payload.monthly_income),
        "monthly_expenses_total": float(payload.monthly_expenses_total),
        "emi_amount": float(payload.emi_amount),
        "savings_balance": float(payload.savings_balance),
        "income_type": payload.income_type,
        "employment_tenure_months": int(payload.employment_tenure_months),
        "missed_payments_last_year": int(payload.missed_payments_last_year),
        "note": payload.note or "Monthly Snapshot",
    }
    user_ref.collection("entries").add(entry_data)

    return _calculate_user_dashboard(user_ref, current_user, entry_data, db, save_history=True)


@router.get("/dashboard", response_model=schemas.DashboardResponse)
def get_dashboard(
    current_user: models.User = Depends(get_current_user),
    db=Depends(get_db),
):
    """Get the current dashboard data, score trends, and financial DNA for the signed in user."""
    user_ref = db.collection("users").document(current_user.firebase_uid)
    entries_query = user_ref.collection("entries").stream()
    entries_list = [doc.to_dict() for doc in entries_query]

    if not entries_list:
        return schemas.DashboardResponse(
            user_name=current_user.name,
            user_email=current_user.email,
            has_onboarded=False,
            resilience_score=None,
            dna=None,
            loan_recommendation=None,
            score_history=[],
        )

    # Get latest entry
    latest_entry = max(entries_list, key=lambda e: e.get("timestamp", ""))
    return _calculate_user_dashboard(user_ref, current_user, latest_entry, db, save_history=False)


@router.get("/profile/dna", response_model=schemas.FinancialDNAOut)
def get_dna_profile(
    current_user: models.User = Depends(get_current_user),
    db=Depends(get_db),
):
    dash = get_dashboard(current_user=current_user, db=db)
    if not dash.dna:
        raise HTTPException(status_code=400, detail="User has not onboarded financial data yet.")
    return dash.dna
