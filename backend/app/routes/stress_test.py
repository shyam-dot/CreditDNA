"""POST /api/stress-test — perturb inputs and recompute resilience score live with Firestore."""
import sys, os
from datetime import datetime
ml_dir = os.path.join(os.path.dirname(__file__), "../../../ml")
if ml_dir not in sys.path:
    sys.path.insert(0, ml_dir)

from fastapi import APIRouter, Depends
from app.database import get_db
from app.dependencies import get_current_user
from app import models, schemas
from app.routes.dashboard import get_dashboard

router = APIRouter(prefix="/api", tags=["stress-test"])

SCENARIO_LABELS = {
    "income_drop": "Income Drop",
    "job_loss": "Job Loss",
    "emergency_expense": "Emergency Expense",
    "emi_increase": "EMI Increase",
}


@router.post("/stress-test", response_model=schemas.StressTestResponse)
def run_stress_test(
    payload: schemas.StressTestRequest,
    current_user: models.User = Depends(get_current_user),
    db=Depends(get_db),
):
    from simulator import run_stress_simulation
    from llm_client import generate_explanation

    dash = get_dashboard(current_user=current_user, db=db)
    user_ref = db.collection("users").document(current_user.firebase_uid)
    entries = list(user_ref.collection("entries").stream())
    
    if entries:
        latest_entry = max([e.to_dict() for e in entries], key=lambda e: e.get("timestamp", ""))
    else:
        latest_entry = {
            "monthly_income": 85000.0,
            "monthly_expenses_total": 35000.0,
            "emi_amount": 15000.0,
            "savings_balance": 200000.0,
            "income_type": "salaried",
            "employment_tenure_months": 24,
            "missed_payments_last_year": 0,
        }

    original_score = dash.resilience_score.score if dash.resilience_score else 75.0

    # Run stress simulation
    result = run_stress_simulation(
        profile=latest_entry,
        scenario=payload.scenario,
        magnitude=payload.magnitude,
        original_score=original_score,
    )

    # Build LLM explanation context
    ctx = {
        "scenario": SCENARIO_LABELS.get(payload.scenario, payload.scenario),
        "magnitude_pct": int(payload.magnitude * 100),
        "original_score": original_score,
        "perturbed_score": result["perturbed_score"],
        "score_delta": result["score_delta"],
        "months_to_distress": result["months_to_distress"],
        "outcome_summary": result["outcome_summary"],
    }
    explanation = generate_explanation(ctx, "stress_test")

    # Record simulation result into Firestore
    try:
        db.collection("stress_test_results").add({
            "userId": current_user.firebase_uid,
            "scenario": payload.scenario,
            "magnitude": payload.magnitude,
            "original_score": original_score,
            "perturbed_score": result["perturbed_score"],
            "score_delta": result["score_delta"],
            "months_to_distress": result["months_to_distress"],
            "outcome_summary": result["outcome_summary"],
            "explanation_text": explanation,
            "created_at": datetime.utcnow().isoformat(),
        })
    except Exception as exc:
        print(f"[Firestore] Note: Could not save stress test log: {exc}")

    return schemas.StressTestResponse(
        scenario=payload.scenario,
        magnitude=payload.magnitude,
        original_score=original_score,
        perturbed_score=result["perturbed_score"],
        score_delta=result["score_delta"],
        months_to_distress=result["months_to_distress"],
        outcome_summary=result["outcome_summary"],
        explanation_text=explanation,
    )
