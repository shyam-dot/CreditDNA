"""GET /api/loan-recommendation — sustainable borrowing limit + LLM explanation."""
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime

from app.database import get_db
from app.dependencies import get_current_user
from app import models, schemas
from app.routes.dashboard import get_dashboard

router = APIRouter(prefix="/api", tags=["loan"])


@router.get("/loan-recommendation", response_model=schemas.LoanRecommendationOut)
def get_loan_recommendation(
    current_user: models.User = Depends(get_current_user),
    db=Depends(get_db),
):
    dash = get_dashboard(current_user=current_user, db=db)
    if not dash.loan_recommendation:
        raise HTTPException(status_code=400, detail="User has not onboarded financial data yet.")
    return dash.loan_recommendation
