# CreditDNA — Setup Guide

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20+ | Frontend development server & build |
| Python | 3.11+ | Backend API, ML models, and seeding scripts |
| Firebase Account | Free Spark or Blaze | Authentication, Firestore database, and Storage |
| Ollama (Optional) | 0.1+ | Local Llama 3.1 LLM (or use free Groq API) |

---

## 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) → **Add project** (e.g. `credit-dna`).
2. **Enable Authentication**:
   - Navigate to **Authentication → Sign-in method**.
   - Enable **Email/Password**.
3. **Enable Firestore Database**:
   - Navigate to **Firestore Database → Create database**.
   - Start in Test mode or Production mode.
4. **Enable Firebase Storage (Optional)**:
   - Navigate to **Storage → Get started**.
5. **Get Service Account Key (for Backend & ML Seeding)**:
   - Go to **Project Settings → Service accounts → Generate new private key**.
   - Save the file as `backend/firebase-service-account.json` (or set `FIREBASE_SERVICE_ACCOUNT_PATH`).
6. **Get Web App Config (for Frontend)**:
   - Go to **Project Settings → Your apps → Web app (`</>`)**.
   - Copy the configuration variables.

---

## 2. Backend & Firestore Setup

```bash
cd backend

# Install dependencies (FastAPI, Firebase Admin SDK, scikit-learn, etc.)
pip install -r requirements.txt

# Create .env from example
cp .env.example .env
```

Edit `backend/.env`:
```env
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=firebase-service-account.json
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
# Or for cloud LLM:
# LLM_PROVIDER=groq
# GROQ_API_KEY=your-groq-api-key
# GROQ_MODEL=llama-3.1-8b-instant
```

### Run the FastAPI Backend:
```bash
uvicorn app.main:app --reload --port 8000
```

---

## 3. Seed Demo Accounts into Firestore

Run the seed script to compute initial ML resilience scores and pre-populate Firestore collections (`demo_accounts`, `transactions`):

```bash
cd ml
python seed.py
```

---

## 4. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### Start Frontend Dev Server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 5. Mid-Demo Reset

To quickly restore demo accounts to their original pristine state:

```bash
python demo/reset_demo.py
```

---

## 6. Verification & Health Checks

```bash
# Backend health check
curl http://localhost:8000/api/health
# → {"status":"ok","version":"1.0.0"}

# List demo accounts from Firestore
curl http://localhost:8000/api/demo-accounts
```

