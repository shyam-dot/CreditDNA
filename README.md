# CreditDNA

**Financial Resilience Profile** — Powered by Firebase & Explainable ML.

CreditDNA answers three questions for every user:
1. How financially stable is this person **today**?
2. How would they handle **financial shocks**?
3. What level of borrowing can they **sustainably afford**?

## Architecture

```
                         CREDIT DNA
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
   Firebase Auth         Firestore         Firebase Storage
  (Email / Password) (All App Documents)   (Docs & Reports)
        │                    │
     - Login            - users/
     - Signup           - demo_accounts/
                        - transactions/
                        - stress_test_results/
```

## Quick Start

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Set FIREBASE_PROJECT_ID in .env
uvicorn app.main:app --reload --port 8000
```

### 2. Seed Firestore Data
```bash
cd ml
python seed.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Fill in your Firebase Web App credentials in frontend/.env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

See [`docs/setup.md`](docs/setup.md) for the complete setup guide.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Tailwind CSS + Recharts + Firebase Web SDK
- **Backend:** Python 3.11 + FastAPI + Firebase Admin SDK (Firestore & Auth)
- **Database & Storage:** Google Cloud Firestore + Firebase Storage
- **Authentication:** Firebase Authentication
- **ML Engine:** scikit-learn · Random Forest · XGBoost · SHAP
- **LLM Engine:** Llama 3.1 via Ollama (local) or Groq/Together AI (cloud)

## Demo Accounts

| Account | Profile | Expected Score |
|---------|---------|---------------|
| Aisha Verma (HDFC ••••4821) | Salaried, ₹85K/mo, zero missed payments | ~78 (Strong) |
| Rahul Nair (Axis ••••3307) | Freelance, ₹42K/mo, 2 missed payments | ~47 (Moderate) |

See [`docs/demo-script.md`](docs/demo-script.md) for the full demo walkthrough.

