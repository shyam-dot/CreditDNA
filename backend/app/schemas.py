from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────

class AuthSyncRequest(BaseModel):
    firebase_uid: str
    name: str
    email: str


from typing import Optional, List, Dict, Any, Union

class AuthSyncResponse(BaseModel):
    id: Union[str, int]
    firebase_uid: str
    name: str
    email: str
    has_linked_account: bool



# ── Demo Accounts ─────────────────────────────────────────────────────────────

class DemoAccountOut(BaseModel):
    id: str
    holder_name: str
    bank_name: str
    account_suffix: str
    display_label: str

    class Config:
        from_attributes = True


# ── Link Account ──────────────────────────────────────────────────────────────

class LinkAccountRequest(BaseModel):
    demo_account_id: str


class LinkAccountResponse(BaseModel):
    message: str
    demo_account_id: str
    linked_at: datetime


# ── DNA Scores ────────────────────────────────────────────────────────────────

class DNADimension(BaseModel):
    score: float
    label: str
    explanation: Optional[str] = None


class FinancialDNAOut(BaseModel):
    income_stability: DNADimension
    cash_flow_health: DNADimension
    debt_pressure: DNADimension
    savings_resilience: DNADimension
    spending_stability: DNADimension
    payment_discipline: DNADimension
    computed_at: datetime

    class Config:
        from_attributes = True


# ── Resilience Score ──────────────────────────────────────────────────────────

class ResilienceScoreOut(BaseModel):
    score: float
    band: str        # "strong" | "moderate" | "weak"
    band_color: str  # "green" | "amber" | "red"
    explanation_text: str
    top_factors: Optional[List[Dict[str, Any]]] = None
    computed_at: datetime

    class Config:
        from_attributes = True


# ── Loan Recommendation ───────────────────────────────────────────────────────

class LoanRecommendationOut(BaseModel):
    sustainable_limit: float
    max_safe_emi: float
    recommended_tenure_months: int
    explanation_text: str
    computed_at: datetime

    class Config:
        from_attributes = True


# ── Dashboard ─────────────────────────────────────────────────────────────────

class ConnectedAccountInfo(BaseModel):
    holder_name: str
    bank_name: str
    account_suffix: str
    demo_account_id: str


class DashboardResponse(BaseModel):
    connected_account: ConnectedAccountInfo
    resilience_score: ResilienceScoreOut
    dna: FinancialDNAOut
    loan_recommendation: LoanRecommendationOut


# ── Stress Test ───────────────────────────────────────────────────────────────

class StressTestRequest(BaseModel):
    scenario: str      # "income_drop" | "job_loss" | "emergency_expense" | "emi_increase"
    magnitude: float   # 0.0 – 1.0


class StressTestResponse(BaseModel):
    scenario: str
    magnitude: float
    original_score: float
    perturbed_score: float
    score_delta: float
    months_to_distress: Optional[float]
    outcome_summary: str
    explanation_text: str


# ── Health ────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    version: str
