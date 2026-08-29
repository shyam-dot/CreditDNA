"""Data models and helper classes for Firestore collections in Credit DNA."""
from typing import Optional, Dict, Any, List
from datetime import datetime


class User:
    """Represents a document in the 'users' Firestore collection."""
    def __init__(
        self,
        firebase_uid: str,
        name: str,
        email: str,
        id: Optional[str] = None,
        bank: Optional[str] = None,
        account: Optional[str] = None,
        employment: Optional[str] = None,
        resilience_score: Optional[float] = None,
        linked_demo_account_id: Optional[str] = None,
        created_at: Optional[Any] = None,
        **kwargs
    ):
        self.id = id or firebase_uid
        self.firebase_uid = firebase_uid
        self.name = name
        self.email = email
        self.bank = bank
        self.account = account
        self.employment = employment
        self.resilience_score = resilience_score
        self.linked_demo_account_id = linked_demo_account_id
        self.created_at = created_at or datetime.utcnow()

    @property
    def linked_account(self):
        if self.linked_demo_account_id:
            return LinkedAccount(
                user_id=self.firebase_uid,
                demo_account_id=self.linked_demo_account_id
            )
        return None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "userId": self.firebase_uid,
            "firebase_uid": self.firebase_uid,
            "name": self.name,
            "email": self.email,
            "bank": self.bank,
            "account": self.account,
            "employment": self.employment,
            "resilienceScore": self.resilience_score,
            "linked_demo_account_id": self.linked_demo_account_id,
            "created_at": self.created_at.isoformat() if hasattr(self.created_at, "isoformat") else self.created_at,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any], doc_id: Optional[str] = None) -> "User":
        uid = data.get("userId") or data.get("firebase_uid") or doc_id
        return cls(
            id=doc_id or uid,
            firebase_uid=uid,
            name=data.get("name", ""),
            email=data.get("email", ""),
            bank=data.get("bank"),
            account=data.get("account"),
            employment=data.get("employment"),
            resilience_score=data.get("resilienceScore") or data.get("resilience_score"),
            linked_demo_account_id=data.get("linked_demo_account_id"),
            created_at=data.get("created_at"),
        )


class LinkedAccount:
    """Helper representing a user-to-demo-account link."""
    def __init__(self, user_id: str, demo_account_id: str, linked_at: Optional[Any] = None):
        self.user_id = user_id
        self.demo_account_id = demo_account_id
        self.linked_at = linked_at or datetime.utcnow()


class FinancialProfile:
    """Represents the financial profile data stored in Firestore."""
    def __init__(
        self,
        monthly_income: float = 0.0,
        income_type: str = "salaried",
        employment_tenure_months: int = 0,
        monthly_expenses_total: float = 0.0,
        expenses_breakdown: Optional[Dict[str, Any]] = None,
        emi_amount: float = 0.0,
        existing_loans: Optional[List[Dict[str, Any]]] = None,
        savings_balance: float = 0.0,
        missed_payments_last_year: int = 0,
        payment_history: Optional[List[Dict[str, Any]]] = None,
        monthly_transactions: Optional[List[Dict[str, Any]]] = None,
        **kwargs
    ):
        self.monthly_income = monthly_income
        self.income_type = income_type
        self.employment_tenure_months = employment_tenure_months
        self.monthly_expenses_total = monthly_expenses_total
        self.expenses_breakdown = expenses_breakdown or {}
        self.emi_amount = emi_amount
        self.existing_loans = existing_loans or []
        self.savings_balance = savings_balance
        self.missed_payments_last_year = missed_payments_last_year
        self.payment_history = payment_history or []
        self.monthly_transactions = monthly_transactions or []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "monthly_income": self.monthly_income,
            "income_type": self.income_type,
            "employment_tenure_months": self.employment_tenure_months,
            "monthly_expenses_total": self.monthly_expenses_total,
            "expenses_breakdown": self.expenses_breakdown,
            "emi_amount": self.emi_amount,
            "existing_loans": self.existing_loans,
            "savings_balance": self.savings_balance,
            "missed_payments_last_year": self.missed_payments_last_year,
            "payment_history": self.payment_history,
            "monthly_transactions": self.monthly_transactions,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "FinancialProfile":
        return cls(**data)


class FinancialDNAScore:
    """Represents Financial DNA scores and explanations."""
    def __init__(
        self,
        income_stability: float = 0.0,
        cash_flow_health: float = 0.0,
        debt_pressure: float = 0.0,
        savings_resilience: float = 0.0,
        spending_stability: float = 0.0,
        payment_discipline: float = 0.0,
        income_stability_explanation: Optional[str] = None,
        cash_flow_health_explanation: Optional[str] = None,
        debt_pressure_explanation: Optional[str] = None,
        savings_resilience_explanation: Optional[str] = None,
        spending_stability_explanation: Optional[str] = None,
        payment_discipline_explanation: Optional[str] = None,
        computed_at: Optional[Any] = None,
        **kwargs
    ):
        self.income_stability = income_stability
        self.cash_flow_health = cash_flow_health
        self.debt_pressure = debt_pressure
        self.savings_resilience = savings_resilience
        self.spending_stability = spending_stability
        self.payment_discipline = payment_discipline
        self.income_stability_explanation = income_stability_explanation
        self.cash_flow_health_explanation = cash_flow_health_explanation
        self.debt_pressure_explanation = debt_pressure_explanation
        self.savings_resilience_explanation = savings_resilience_explanation
        self.spending_stability_explanation = spending_stability_explanation
        self.payment_discipline_explanation = payment_discipline_explanation
        self.computed_at = computed_at or datetime.utcnow()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "income_stability": self.income_stability,
            "cash_flow_health": self.cash_flow_health,
            "debt_pressure": self.debt_pressure,
            "savings_resilience": self.savings_resilience,
            "spending_stability": self.spending_stability,
            "payment_discipline": self.payment_discipline,
            "income_stability_explanation": self.income_stability_explanation,
            "cash_flow_health_explanation": self.cash_flow_health_explanation,
            "debt_pressure_explanation": self.debt_pressure_explanation,
            "savings_resilience_explanation": self.savings_resilience_explanation,
            "spending_stability_explanation": self.spending_stability_explanation,
            "payment_discipline_explanation": self.payment_discipline_explanation,
            "computed_at": self.computed_at.isoformat() if hasattr(self.computed_at, "isoformat") else self.computed_at,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "FinancialDNAScore":
        return cls(**data)


class ResilienceScore:
    """Represents the composite Resilience Score."""
    def __init__(
        self,
        score: float = 0.0,
        explanation_text: Optional[str] = None,
        model_version: str = "v1.0",
        top_factors: Optional[List[Dict[str, Any]]] = None,
        computed_at: Optional[Any] = None,
        **kwargs
    ):
        self.score = score
        self.explanation_text = explanation_text
        self.model_version = model_version
        self.top_factors = top_factors or []
        self.computed_at = computed_at or datetime.utcnow()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "score": self.score,
            "explanation_text": self.explanation_text,
            "model_version": self.model_version,
            "top_factors": self.top_factors,
            "computed_at": self.computed_at.isoformat() if hasattr(self.computed_at, "isoformat") else self.computed_at,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ResilienceScore":
        return cls(**data)


class LoanRecommendation:
    """Represents the Loan Recommendation calculated for an account."""
    def __init__(
        self,
        sustainable_limit: float = 0.0,
        max_safe_emi: float = 0.0,
        recommended_tenure_months: int = 60,
        explanation_text: Optional[str] = None,
        computed_at: Optional[Any] = None,
        **kwargs
    ):
        self.sustainable_limit = sustainable_limit
        self.max_safe_emi = max_safe_emi
        self.recommended_tenure_months = recommended_tenure_months
        self.explanation_text = explanation_text
        self.computed_at = computed_at or datetime.utcnow()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "sustainable_limit": self.sustainable_limit,
            "max_safe_emi": self.max_safe_emi,
            "recommended_tenure_months": self.recommended_tenure_months,
            "explanation_text": self.explanation_text,
            "computed_at": self.computed_at.isoformat() if hasattr(self.computed_at, "isoformat") else self.computed_at,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "LoanRecommendation":
        return cls(**data)


class DemoAccount:
    """Represents a demo account document in Firestore."""
    def __init__(
        self,
        id: str,
        holder_name: str,
        bank_name: str,
        account_suffix: str,
        display_label: str,
        financial_profile: Optional[FinancialProfile] = None,
        dna_score: Optional[FinancialDNAScore] = None,
        resilience_score: Optional[ResilienceScore] = None,
        loan_recommendation: Optional[LoanRecommendation] = None,
        **kwargs
    ):
        self.id = id
        self.holder_name = holder_name
        self.bank_name = bank_name
        self.account_suffix = account_suffix
        self.display_label = display_label
        self.financial_profile = financial_profile or FinancialProfile()
        self.dna_score = dna_score or FinancialDNAScore()
        self.resilience_score = resilience_score or ResilienceScore()
        self.loan_recommendation = loan_recommendation or LoanRecommendation()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "holder_name": self.holder_name,
            "bank_name": self.bank_name,
            "account_suffix": self.account_suffix,
            "display_label": self.display_label,
            "financial_profile": self.financial_profile.to_dict() if hasattr(self.financial_profile, "to_dict") else self.financial_profile,
            "dna_score": self.dna_score.to_dict() if hasattr(self.dna_score, "to_dict") else self.dna_score,
            "resilience_score": self.resilience_score.to_dict() if hasattr(self.resilience_score, "to_dict") else self.resilience_score,
            "loan_recommendation": self.loan_recommendation.to_dict() if hasattr(self.loan_recommendation, "to_dict") else self.loan_recommendation,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any], doc_id: Optional[str] = None) -> "DemoAccount":
        acc_id = data.get("id") or doc_id
        fp_data = data.get("financial_profile") or {}
        dna_data = data.get("dna_score") or {}
        res_data = data.get("resilience_score") or {}
        loan_data = data.get("loan_recommendation") or {}

        return cls(
            id=acc_id,
            holder_name=data.get("holder_name", ""),
            bank_name=data.get("bank_name", ""),
            account_suffix=data.get("account_suffix", ""),
            display_label=data.get("display_label", ""),
            financial_profile=FinancialProfile.from_dict(fp_data) if isinstance(fp_data, dict) else fp_data,
            dna_score=FinancialDNAScore.from_dict(dna_data) if isinstance(dna_data, dict) else dna_data,
            resilience_score=ResilienceScore.from_dict(res_data) if isinstance(res_data, dict) else res_data,
            loan_recommendation=LoanRecommendation.from_dict(loan_data) if isinstance(loan_data, dict) else loan_data,
        )

