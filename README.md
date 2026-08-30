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

## Deploy to Vercel

### Deploying the Frontend to Vercel

1. Push this repository to GitHub: `https://github.com/shyam-dot/CreditDNA`
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"** -> **"Import Git Repository"**.
3. Select the `CreditDNA` repository.
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (or `frontend`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend/dist` (or `dist` if root directory is set to `frontend`)
5. Add Environment Variables in Vercel Project Settings:
   - `VITE_API_BASE_URL`: Your deployed backend API URL (e.g., Render/Railway/Cloud Run) or local URL.
   - `VITE_FIREBASE_API_KEY`: Your Firebase web API key
   - `VITE_FIREBASE_AUTH_DOMAIN`: `credit-dna.firebaseapp.com`
   - `VITE_FIREBASE_PROJECT_ID`: `credit-dna`
   - `VITE_FIREBASE_STORAGE_BUCKET`: `credit-dna.firebasestorage.app`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`: `1001502583985`
   - `VITE_FIREBASE_APP_ID`: `1:1001502583985:web:33adaaf67bb095d0750690`
   - `VITE_FIREBASE_MEASUREMENT_ID`: `G-NQTG2H4Y8V`
6. Click **Deploy**.

