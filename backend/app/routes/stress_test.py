"""POST /api/stress-test — perturb inputs and recompute resilience score live with Firestore."""
import sys, os
from datetime import datetime
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../ml"))

from fastapi import APIRouter, Depends

from app.database import get_db
from app.dependencies import get_current_user
from app import models, schemas
from app.routes.utils import get_linked_demo_account, score_to_band

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
    from features import compute_features, compute_dna_scores, compute_resilience_score
    from simulator import run_stress_simulation
    from llm_client import generate_explanation

    demo = get_linked_demo_account(current_user, db)
    profile = demo.financial_profile
    original_score = float(demo.resilience_score.score)

    # Perturb the profile and recompute
    result = run_stress_simulation(
        profile=profile,
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

    # Record simulation result into Firestore stress_test_results
    try:
        db.collection("stress_test_results").add({
            "userId": current_user.firebase_uid,
            "demo_account_id": demo.id,
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

