# CreditDNA — API Reference

Base URL: `http://localhost:8000`

All endpoints except `/api/health` and `/api/auth/sync` require:
```
Authorization: Bearer <firebase_id_token>
```

---

## Health

### `GET /api/health`
No auth required.

**Response 200**
```json
{ "status": "ok", "version": "1.0.0" }
```

---

## Auth

### `POST /api/auth/sync`
Create or upsert the Firestore User document after Firebase signup/login.
No auth token required (called before auth state is established).

**Request body**
```json
{
  "firebase_uid": "abc123",
  "name": "Aisha Verma",
  "email": "aisha@example.com"
}
```

**Response 200**
```json
{
  "id": "abc123",
  "firebase_uid": "abc123",
  "name": "Aisha Verma",
  "email": "aisha@example.com",
  "has_linked_account": false
}
```


---

## Demo Accounts

### `GET /api/demo-accounts`
No auth required. Returns the two seeded demo bank accounts.

**Response 200**
```json
[
  {
    "id": "A",
    "holder_name": "Aisha Verma",
    "bank_name": "HDFC Bank",
    "account_suffix": "4821",
    "display_label": "HDFC Bank — Aisha Verma ••••4821"
  },
  {
    "id": "B",
    "holder_name": "Rahul Nair",
    "bank_name": "Axis Bank",
    "account_suffix": "3307",
    "display_label": "Axis Bank — Rahul Nair ••••3307"
  }
]
```

---

## Account Linking

### `POST /api/link-account`
Link (or re-link) a demo account to the authenticated user. Idempotent.

**Request body**
```json
{ "demo_account_id": "A" }
```

**Response 200**
```json
{
  "message": "Account linked successfully",
  "demo_account_id": "A",
  "linked_at": "2025-08-29T10:00:00Z"
}
```

---

## Dashboard

### `GET /api/dashboard`
One-shot payload for the home screen. Returns resilience score, DNA, and loan recommendation.

**Response 200**
```json
{
  "connected_account": {
    "holder_name": "Aisha Verma",
    "bank_name": "HDFC Bank",
    "account_suffix": "4821",
    "demo_account_id": "A"
  },
  "resilience_score": {
    "score": 78.4,
    "band": "strong",
    "band_color": "green",
    "explanation_text": "Your income stability and consistent payment history make you well-positioned to handle most financial shocks.",
    "top_factors": [
      { "name": "income_to_emi_ratio", "label": "income-to-EMI ratio", "direction": "positive", "magnitude": 0.42 }
    ],
    "computed_at": "2025-08-29T10:00:00Z"
  },
  "dna": {
    "income_stability": { "score": 82.0, "label": "Income Stability", "explanation": "..." },
    "cash_flow_health": { "score": 71.0, "label": "Cash-Flow Health", "explanation": "..." },
    "debt_pressure":    { "score": 78.0, "label": "Debt Pressure",    "explanation": "..." },
    "savings_resilience": { "score": 75.0, "label": "Savings Resilience", "explanation": "..." },
    "spending_stability": { "score": 84.0, "label": "Spending Stability", "explanation": "..." },
    "payment_discipline": { "score": 100.0, "label": "Payment Discipline", "explanation": "..." },
    "computed_at": "2025-08-29T10:00:00Z"
  },
  "loan_recommendation": {
    "sustainable_limit": 720000.0,
    "max_safe_emi": 8200.0,
    "recommended_tenure_months": 60,
    "explanation_text": "Based on your income and expenses, ₹7.2L is a sustainable borrowing amount...",
    "computed_at": "2025-08-29T10:00:00Z"
  }
}
```

---

## DNA Profile

### `GET /api/profile/dna`
Full 6-dimension breakdown with LLM explanations per dimension.

**Response 200** — same shape as `dashboard.dna`

---

## Stress Test

### `POST /api/stress-test`
Simulate a financial shock and get the live resilience impact + LLM explanation.

**Request body**
```json
{
  "scenario": "income_drop",
  "magnitude": 0.3
}
```

`scenario` values: `income_drop` | `job_loss` | `emergency_expense` | `emi_increase`
`magnitude`: `0.0–1.0` (for `job_loss`, always passes `1.0` internally)

**Response 200**
```json
{
  "scenario": "income_drop",
  "magnitude": 0.3,
  "original_score": 78.4,
  "perturbed_score": 54.1,
  "score_delta": -24.3,
  "months_to_distress": 8.5,
  "outcome_summary": "A 30% Income Drop would give you roughly 8 months of runway before finances become strained.",
  "explanation_text": "A 30% income reduction would draw down your savings buffer within 8 months, though your low debt pressure gives you options to refinance or reduce spending."
}
```

---

## Loan Recommendation

### `GET /api/loan-recommendation`
Sustainable borrowing limit and LLM explanation.

**Response 200**
```json
{
  "sustainable_limit": 720000.0,
  "max_safe_emi": 8200.0,
  "recommended_tenure_months": 60,
  "explanation_text": "Your residual income after current obligations supports an additional EMI of ₹8,200/month...",
  "computed_at": "2025-08-29T10:00:00Z"
}
```

---

## Error Responses

| Status | When |
|--------|------|
| 401 | Missing or invalid Firebase token |
| 400 | No bank account linked |
| 404 | User or demo account not found |
| 422 | Request body validation error |
| 500 | Internal server error |

```json
{ "detail": "Error description" }
```
