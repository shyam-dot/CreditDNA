# CreditDNA — Architecture Overview

CreditDNA is a full-stack application that generates a **Financial Resilience Profile** — answering how financially stable a user is today, how they'd handle financial shocks, and what they can sustainably borrow.

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser (React)                         │
│  LoginPage → BankConnectPage → Dashboard → StressTest → RecPage  │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS  (Firebase ID Token in Authorization header)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FastAPI Backend (:8000)                       │
│  /api/auth/sync   /api/demo-accounts   /api/link-account         │
│  /api/dashboard   /api/profile/dna     /api/stress-test          │
│  /api/loan-recommendation              /api/health               │
│                                                                   │
│  firebase-admin (token verification & Firestore client)          │
└───────────────────────────────────────────────────────────────┬──┘
                                                                │
              ┌─────────────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Cloud Firestore Database                    │
│  users/                   → user profiles & score snapshots     │
│  demo_accounts/           → profiles, DNA scores, ML results    │
│  transactions/            → monthly credits, debits, breakdown  │
│  stress_test_results/     → interactive simulation logs         │
└─────────────────────────────────────────────────────────────────┘
              ▲
              │ writes & seeds (firebase-admin)
┌─────────────┴──────────────────────────────────────────────────┐
│                       ML Layer  (ml/)                            │
│                                                                  │
│  features.py ──── compute_dna_scores()                          │
│                   compute_resilience_score()    ◄── formula-based│
│                   compute_loan_recommendation()                  │
│                                                                  │
│  simulator.py ─── run_stress_simulation()  (deterministic)      │
│                                                                  │
│  train.py ──────── LogisticRegression / RandomForest / XGBoost  │
│                    → models/best_model.joblib                    │
│                                                                  │
│  explain.py ────── SHAP or feature-importance → top_factors     │
│                    calls llm_client.generate_explanation()       │
│                                                                  │
│  llm_client.py ─── Ollama (local) | Groq | Together AI          │
│                    single function: generate_explanation()       │
│                    fallback: rule-based template sentence        │
│                                                                  │
│  prompts/ ─────── one .txt template per explanation_type        │
│  models/ ──────── best_model.joblib + model_metadata.json       │
└──────────────────────────────────────────────┬─────────────────┘
                                               │
                                               ▼
                              ┌────────────────────────────┐
                              │  Ollama (:11434)            │
                              │  llama3.1:8b (local)        │
                              │  OR Groq / Together AI      │
                              │  (hosted Llama endpoint)    │
                              └────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  Firebase Ecosystem                             │
│  - Firebase Authentication (Email/Password login & signup)       │
│  - Cloud Firestore (All data, profiles, and ML scores)          │
│  - Firebase Storage (Document uploads & reports)                │
└─────────────────────────────────────────────────────────────────┘

```

## Data Flow (Dashboard Load)

1. User logs in via Firebase (frontend SDK)
2. Frontend calls `POST /api/auth/sync` with Firebase UID → creates/fetches Postgres User row
3. Frontend calls `GET /api/dashboard` with `Authorization: Bearer <firebase_id_token>`
4. Backend verifies token via `firebase-admin`, finds User row, finds LinkedAccount
5. Returns pre-computed scores + pre-generated LLM explanations from Postgres
6. Frontend renders: Score gauge → DNA radar → Credit limit card

## Data Flow (Stress Test — live LLM)

1. User picks scenario + magnitude on the Stress Test screen
2. Frontend calls `POST /api/stress-test` (debounced ~400ms)
3. Backend: `simulator.run_stress_simulation()` perturbs profile → recomputes score
4. `llm_client.generate_explanation()` calls Ollama (or hosted endpoint)
5. Falls back to rule-based template if LLM times out (2–8s budget)
6. Returns result; frontend updates chart + score bar + explanation text

## Division of Responsibility: ML vs LLM

| Task | Who does it |
|------|-------------|
| DNA dimension scores (0–100) | `features.compute_dna_scores()` — deterministic formulae |
| Composite resilience score | `features.compute_resilience_score()` — weighted average or best trained model |
| Loan borrowing limit | `features.compute_loan_recommendation()` — derived from surplus income |
| Stress simulation | `simulator.run_stress_simulation()` — deterministic perturbation |
| Which factors drove the score | `explain.py` via SHAP or feature-importance ranking |
| Plain-English sentence | `llm_client.generate_explanation()` via Llama — never computes numbers |

## Auth Architecture

- Firebase handles credentials, sessions, and token issuance
- Every backend API call (except `/api/health` and `/api/auth/sync`) requires a valid Firebase ID token
- `firebase-admin` verifies the token server-side — no JWT secret shared with the frontend
- The Postgres `User` table maps `firebase_uid → user row`; all application data is in Postgres

## LLM Swap

Change `LLM_PROVIDER` in `.env` (no code changes required):
- `ollama` → local Ollama at `OLLAMA_BASE_URL`
- `groq` → Groq API at `https://api.groq.com/openai/v1`
- `together` → Together AI at `https://api.together.xyz/v1`

All three use the same OpenAI-compatible chat completion format.
