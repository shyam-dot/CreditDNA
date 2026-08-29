"""FastAPI application entry point."""
import sys, os

# Add ml/ to the Python path so routes can import ml modules
ML_PATH = os.path.join(os.path.dirname(__file__), "../../ml")
if ML_PATH not in sys.path:
    sys.path.insert(0, ML_PATH)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.firebase import _init_firebase
from app.routes import auth, accounts, dashboard, stress_test, loan
from app.schemas import HealthResponse

# Initialize Firebase on startup
_init_firebase()

app = FastAPI(
    title="CreditDNA API",
    description="Financial Resilience Profiling API with Firebase",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(accounts.router)
app.include_router(dashboard.router)
app.include_router(stress_test.router)
app.include_router(loan.router)


@app.get("/api/health", response_model=HealthResponse)
def health():
    return HealthResponse(status="ok", version="1.0.0")
