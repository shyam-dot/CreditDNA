"""GET /api/loan-recommendation — sustainable borrowing limit + LLM explanation."""
from fastapi import APIRouter, Depends
from datetime import datetime

from app.database import get_db
from app.dependencies import get_current_user
from app import models, schemas
from app.routes.utils import get_linked_demo_account

router = APIRouter(prefix="/api", tags=["loan"])


@router.get("/loan-recommendation", response_model=schemas.LoanRecommendationOut)
def get_loan_recommendation(
    current_user: models.User = Depends(get_current_user),
    db=Depends(get_db),
):
    demo = get_linked_demo_account(current_user, db)
    rec = demo.loan_recommendation

    computed_at = rec.computed_at
    if isinstance(computed_at, str):
        try:
            computed_at = datetime.fromisoformat(computed_at)
        except Exception:
            computed_at = datetime.utcnow()

    return schemas.LoanRecommendationOut(
        sustainable_limit=float(rec.sustainable_limit),
        max_safe_emi=float(rec.max_safe_emi),
        recommended_tenure_months=int(rec.recommended_tenure_months),
        explanation_text=rec.explanation_text or "",
        computed_at=computed_at or datetime.utcnow(),
    )

