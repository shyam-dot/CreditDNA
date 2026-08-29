"""
seed.py — Insert the two demo bank accounts with full financial detail into Firestore,
train the model if not already trained, compute all scores, and pre-generate LLM explanations.

Run:  python ml/seed.py
"""
import sys, os
from datetime import datetime

# Make sure project modules are importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../backend"))

from app.firebase import get_firestore_db
from app import models

from features import (
    compute_dna_scores, compute_resilience_score,
    compute_loan_recommendation, profile_to_dict
)
from explain import explain_resilience_score, explain_dna_dimension, explain_loan_recommendation
from llm_client import generate_explanation


# ── Demo Account Definitions ─────────────────────────────────────────────────

ACCOUNT_A = {
    "id": "A",
    "holder_name": "Aisha Verma",
    "bank_name": "HDFC Bank",
    "account_suffix": "4821",
    "display_label": "HDFC Bank — Aisha Verma ••••4821",
    "profile": {
        "monthly_income": 85000.0,
        "income_type": "salaried",
        "employment_tenure_months": 42,  # 3.5 years
        "monthly_expenses_total": 32000.0,
        "expenses_breakdown": {
            "rent": 12000,
            "groceries": 5000,
            "utilities": 2000,
            "transport": 3000,
            "dining_entertainment": 4000,
            "healthcare": 1500,
            "subscriptions": 1500,
            "miscellaneous": 3000,
        },
        "emi_amount": 15000.0,
        "existing_loans": [
            {"type": "home_loan", "amount": 2500000, "emi": 15000, "tenure_remaining": 180},
        ],
        "savings_balance": 450000.0,
        "missed_payments_last_year": 0,
        "payment_history": [
            {"month": f"2025-{str(m).zfill(2)}", "on_time": True}
            for m in range(1, 13)
        ],
        "monthly_transactions": [
            {"month": "2025-01", "credits": 85000, "debits": 47200, "categories": {"rent": 12000, "groceries": 4800, "emi": 15000, "others": 15400}},
            {"month": "2025-02", "credits": 85000, "debits": 46500, "categories": {"rent": 12000, "groceries": 4500, "emi": 15000, "others": 15000}},
            {"month": "2025-03", "credits": 85000, "debits": 48000, "categories": {"rent": 12000, "groceries": 5200, "emi": 15000, "others": 15800}},
            {"month": "2025-04", "credits": 85000, "debits": 47800, "categories": {"rent": 12000, "groceries": 5000, "emi": 15000, "others": 15800}},
            {"month": "2025-05", "credits": 85000, "debits": 47000, "categories": {"rent": 12000, "groceries": 4700, "emi": 15000, "others": 15300}},
            {"month": "2025-06", "credits": 85000, "debits": 47500, "categories": {"rent": 12000, "groceries": 5000, "emi": 15000, "others": 15500}},
            {"month": "2025-07", "credits": 85000, "debits": 48200, "categories": {"rent": 12000, "groceries": 5200, "emi": 15000, "others": 16000}},
            {"month": "2025-08", "credits": 85000, "debits": 46800, "categories": {"rent": 12000, "groceries": 4800, "emi": 15000, "others": 15000}},
            {"month": "2025-09", "credits": 85000, "debits": 47100, "categories": {"rent": 12000, "groceries": 4900, "emi": 15000, "others": 15200}},
            {"month": "2025-10", "credits": 85000, "debits": 47600, "categories": {"rent": 12000, "groceries": 5100, "emi": 15000, "others": 15500}},
            {"month": "2025-11", "credits": 85000, "debits": 46900, "categories": {"rent": 12000, "groceries": 4700, "emi": 15000, "others": 15200}},
            {"month": "2025-12", "credits": 85000, "debits": 48500, "categories": {"rent": 12000, "groceries": 5500, "emi": 15000, "others": 16000}},
        ],
    },
}

ACCOUNT_B = {
    "id": "B",
    "holder_name": "Rahul Nair",
    "bank_name": "Axis Bank",
    "account_suffix": "3307",
    "display_label": "Axis Bank — Rahul Nair ••••3307",
    "profile": {
        "monthly_income": 42000.0,
        "income_type": "freelance",
        "employment_tenure_months": 14,
        "monthly_expenses_total": 24000.0,
        "expenses_breakdown": {
            "rent": 9000,
            "groceries": 4500,
            "utilities": 1800,
            "transport": 2500,
            "dining_entertainment": 3200,
            "healthcare": 800,
            "miscellaneous": 2200,
        },
        "emi_amount": 18000.0,
        "existing_loans": [
            {"type": "personal_loan", "amount": 300000, "emi": 10000, "tenure_remaining": 30},
            {"type": "two_wheeler_loan", "amount": 85000, "emi": 8000, "tenure_remaining": 11},
        ],
        "savings_balance": 35000.0,
        "missed_payments_last_year": 2,
        "payment_history": [
            {"month": "2025-01", "on_time": True},
            {"month": "2025-02", "on_time": True},
            {"month": "2025-03", "on_time": False},   # missed
            {"month": "2025-04", "on_time": True},
            {"month": "2025-05", "on_time": True},
            {"month": "2025-06", "on_time": True},
            {"month": "2025-07", "on_time": False},   # missed
            {"month": "2025-08", "on_time": True},
            {"month": "2025-09", "on_time": True},
            {"month": "2025-10", "on_time": True},
            {"month": "2025-11", "on_time": True},
            {"month": "2025-12", "on_time": True},
        ],
        "monthly_transactions": [
            {"month": "2025-01", "credits": 55000, "debits": 41800, "categories": {"rent": 9000, "groceries": 4200, "emi": 18000, "others": 10600}},
            {"month": "2025-02", "credits": 38000, "debits": 41500, "categories": {"rent": 9000, "groceries": 4500, "emi": 18000, "others": 10000}},
            {"month": "2025-03", "credits": 22000, "debits": 33000, "categories": {"rent": 9000, "groceries": 3500, "emi": 10000, "others": 10500}},  # tight
            {"month": "2025-04", "credits": 48000, "debits": 42200, "categories": {"rent": 9000, "groceries": 4700, "emi": 18000, "others": 10500}},
            {"month": "2025-05", "credits": 35000, "debits": 41900, "categories": {"rent": 9000, "groceries": 4400, "emi": 18000, "others": 10500}},
            {"month": "2025-06", "credits": 51000, "debits": 42000, "categories": {"rent": 9000, "groceries": 4600, "emi": 18000, "others": 10400}},
            {"month": "2025-07", "credits": 18000, "debits": 27000, "categories": {"rent": 9000, "groceries": 3800, "emi": 8000, "others": 6200}},  # very tight
            {"month": "2025-08", "credits": 46000, "debits": 42300, "categories": {"rent": 9000, "groceries": 4800, "emi": 18000, "others": 10500}},
            {"month": "2025-09", "credits": 39000, "debits": 41700, "categories": {"rent": 9000, "groceries": 4200, "emi": 18000, "others": 10500}},
            {"month": "2025-10", "credits": 44000, "debits": 42100, "categories": {"rent": 9000, "groceries": 4600, "emi": 18000, "others": 10500}},
            {"month": "2025-11", "credits": 29000, "debits": 35000, "categories": {"rent": 9000, "groceries": 4000, "emi": 13000, "others": 9000}},
            {"month": "2025-12", "credits": 52000, "debits": 42500, "categories": {"rent": 9000, "groceries": 5000, "emi": 18000, "others": 10500}},
        ],
    },
}


def seed_account(db, account_def: dict):
    """Insert or reset one demo account and compute all its scores in Firestore."""
    acc_id = account_def["id"]
    prof_data = account_def["profile"]

    print(f"\n{'='*60}")
    print(f"Seeding Demo Account {acc_id}: {account_def['holder_name']}")
    print(f"{'='*60}")

    # ── Compute DNA Scores ────────────────────────────────────────
    print(f"  Computing DNA scores...")
    dna = compute_dna_scores(prof_data)
    print(f"  DNA: {dna}")

    # ── Compute Resilience Score ──────────────────────────────────
    resilience = compute_resilience_score(dna)
    print(f"  Resilience Score: {resilience}")

    # ── Generate LLM Explanations (pre-cached) ───────────────────
    print(f"  Generating LLM explanations (pre-cached)...")

    # Try to load best model for SHAP
    model = None
    model_path = os.path.join(os.path.dirname(__file__), "models", "best_model.joblib")
    if os.path.exists(model_path):
        import joblib
        model = joblib.load(model_path)

    resilience_explain = explain_resilience_score(prof_data, model, resilience, dna)

    # Dimension explanations
    dim_explanations = {}
    for dim, score in dna.items():
        dim_explanations[dim] = explain_dna_dimension(dim, score, prof_data)
        print(f"    {dim}: {dim_explanations[dim][:80]}...")

    # ── Compute Loan Recommendation ─────────────────────────────
    print(f"  Computing loan recommendation...")
    loan_data = compute_loan_recommendation(prof_data, resilience)
    loan_explanation = explain_loan_recommendation(
        loan_data["sustainable_limit"],
        loan_data["max_safe_emi"],
        resilience,
        prof_data,
    )
    print(f"  Sustainable Limit: Rs. {loan_data['sustainable_limit']:,.0f}")

    now_iso = datetime.utcnow().isoformat()

    # ── Construct Full Demo Account Document for Firestore ───────
    demo_doc_data = {
        "id": acc_id,
        "holder_name": account_def["holder_name"],
        "bank_name": account_def["bank_name"],
        "account_suffix": account_def["account_suffix"],
        "display_label": account_def["display_label"],
        "financial_profile": {
            "monthly_income": prof_data["monthly_income"],
            "income_type": prof_data["income_type"],
            "employment_tenure_months": prof_data["employment_tenure_months"],
            "monthly_expenses_total": prof_data["monthly_expenses_total"],
            "expenses_breakdown": prof_data["expenses_breakdown"],
            "emi_amount": prof_data["emi_amount"],
            "existing_loans": prof_data["existing_loans"],
            "savings_balance": prof_data["savings_balance"],
            "missed_payments_last_year": prof_data["missed_payments_last_year"],
            "payment_history": prof_data["payment_history"],
            "monthly_transactions": prof_data["monthly_transactions"],
        },
        "dna_score": {
            "income_stability": dna["income_stability"],
            "cash_flow_health": dna["cash_flow_health"],
            "debt_pressure": dna["debt_pressure"],
            "savings_resilience": dna["savings_resilience"],
            "spending_stability": dna["spending_stability"],
            "payment_discipline": dna["payment_discipline"],
            "income_stability_explanation": dim_explanations.get("income_stability"),
            "cash_flow_health_explanation": dim_explanations.get("cash_flow_health"),
            "debt_pressure_explanation": dim_explanations.get("debt_pressure"),
            "savings_resilience_explanation": dim_explanations.get("savings_resilience"),
            "spending_stability_explanation": dim_explanations.get("spending_stability"),
            "payment_discipline_explanation": dim_explanations.get("payment_discipline"),
            "computed_at": now_iso,
        },
        "resilience_score": {
            "score": resilience,
            "explanation_text": resilience_explain["explanation_text"],
            "top_factors": resilience_explain["top_factors"],
            "model_version": "v1.0",
            "computed_at": now_iso,
        },
        "loan_recommendation": {
            "sustainable_limit": loan_data["sustainable_limit"],
            "max_safe_emi": loan_data["max_safe_emi"],
            "recommended_tenure_months": loan_data["recommended_tenure_months"],
            "explanation_text": loan_explanation,
            "computed_at": now_iso,
        },
        "updated_at": now_iso,
    }

    # Save to Firestore demo_accounts/{acc_id}
    db.collection("demo_accounts").document(acc_id).set(demo_doc_data)

    # Also seed individual transactions collection for demo analytics
    for idx, txn in enumerate(prof_data.get("monthly_transactions", [])):
        txn_id = f"txn_{acc_id}_{txn.get('month', idx)}"
        db.collection("transactions").document(txn_id).set({
            "transactionId": txn_id,
            "demo_account_id": acc_id,
            "month": txn.get("month"),
            "credits": txn.get("credits"),
            "debits": txn.get("debits"),
            "categories": txn.get("categories", {}),
            "created_at": now_iso,
        })

    print(f"  [OK] Account {acc_id} seeded successfully in Firestore")
    return resilience


def main():
    print("CreditDNA Firestore Seed Script")
    print("=" * 60)

    # Train model first if not present
    model_path = os.path.join(os.path.dirname(__file__), "models", "best_model.joblib")
    if not os.path.exists(model_path):
        print("No trained model found -- training now...")
        from train import train
        train()
    else:
        print("[OK] Trained model found")

    db = get_firestore_db()
    score_a = seed_account(db, ACCOUNT_A)
    score_b = seed_account(db, ACCOUNT_B)

    print(f"\n{'='*60}")
    print("Firestore Seed complete!")
    print(f"  Account A (Aisha Verma) -- Resilience Score: {score_a}")
    print(f"  Account B (Rahul Nair) -- Resilience Score: {score_b}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()


