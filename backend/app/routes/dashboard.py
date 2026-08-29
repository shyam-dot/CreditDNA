"""GET /api/dashboard — one-shot payload for the home screen from Firestore."""
from fastapi import APIRouter, Depends
from datetime import datetime

from app.database import get_db
from app.dependencies import get_current_user
from app import models, schemas
from app.routes.utils import get_linked_demo_account, score_to_band

router = APIRouter(prefix="/api", tags=["dashboard"])


def _build_dna_out(dna: models.FinancialDNAScore) -> schemas.FinancialDNAOut:
    computed_at = dna.computed_at
    if isinstance(computed_at, str):
        try:
            computed_at = datetime.fromisoformat(computed_at)
        except Exception:
            computed_at = datetime.utcnow()

    return schemas.FinancialDNAOut(
        income_stability=schemas.DNADimension(
            score=float(dna.income_stability),
            label="Income Stability",
            explanation=dna.income_stability_explanation,
        ),
        cash_flow_health=schemas.DNADimension(
            score=float(dna.cash_flow_health),
            label="Cash-Flow Health",
            explanation=dna.cash_flow_health_explanation,
        ),
        debt_pressure=schemas.DNADimension(
            score=float(dna.debt_pressure),
            label="Debt Pressure",
            explanation=dna.debt_pressure_explanation,
        ),
        savings_resilience=schemas.DNADimension(
            score=float(dna.savings_resilience),
            label="Savings Resilience",
            explanation=dna.savings_resilience_explanation,
        ),
        spending_stability=schemas.DNADimension(
            score=float(dna.spending_stability),
            label="Spending Stability",
            explanation=dna.spending_stability_explanation,
        ),
        payment_discipline=schemas.DNADimension(
            score=float(dna.payment_discipline),
            label="Payment Discipline",
            explanation=dna.payment_discipline_explanation,
        ),
        computed_at=computed_at or datetime.utcnow(),
    )


@router.get("/dashboard", response_model=schemas.DashboardResponse)
def get_dashboard(
    current_user: models.User = Depends(get_current_user),
    db=Depends(get_db),
):
    demo = get_linked_demo_account(current_user, db)

    resilience = demo.resilience_score
    dna = demo.dna_score
    loan_rec = demo.loan_recommendation

    band, color = score_to_band(float(resilience.score))

    res_computed_at = resilience.computed_at
    if isinstance(res_computed_at, str):
        try:
            res_computed_at = datetime.fromisoformat(res_computed_at)
        except Exception:
            res_computed_at = datetime.utcnow()

    loan_computed_at = loan_rec.computed_at
    if isinstance(loan_computed_at, str):
        try:
            loan_computed_at = datetime.fromisoformat(loan_computed_at)
        except Exception:
            loan_computed_at = datetime.utcnow()

    return schemas.DashboardResponse(
        connected_account=schemas.ConnectedAccountInfo(
            holder_name=demo.holder_name,
            bank_name=demo.bank_name,
            account_suffix=demo.account_suffix,
            demo_account_id=demo.id,
        ),
        resilience_score=schemas.ResilienceScoreOut(
            score=float(resilience.score),
            band=band,
            band_color=color,
            explanation_text=resilience.explanation_text or "",
            top_factors=resilience.top_factors,
            computed_at=res_computed_at or datetime.utcnow(),
        ),
        dna=_build_dna_out(dna),
        loan_recommendation=schemas.LoanRecommendationOut(
            sustainable_limit=float(loan_rec.sustainable_limit),
            max_safe_emi=float(loan_rec.max_safe_emi),
            recommended_tenure_months=int(loan_rec.recommended_tenure_months),
            explanation_text=loan_rec.explanation_text or "",
            computed_at=loan_computed_at or datetime.utcnow(),
        ),
    )


@router.get("/profile/dna", response_model=schemas.FinancialDNAOut)
def get_dna_profile(
    current_user: models.User = Depends(get_current_user),
    db=Depends(get_db),
):
    demo = get_linked_demo_account(current_user, db)
    return _build_dna_out(demo.dna_score)

