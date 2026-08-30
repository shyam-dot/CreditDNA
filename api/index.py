"""Vercel Serverless Function entrypoint for CreditDNA FastAPI backend."""
import sys
import os

# Add root, backend, and ml directories to python path
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(current_dir, ".."))
backend_dir = os.path.join(root_dir, "backend")
ml_dir = os.path.join(root_dir, "ml")

for p in [root_dir, backend_dir, ml_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

from app.main import app

# Expose app instance for Vercel
__all__ = ["app"]
