import sys
import os

# Add the 'backend' and root directories to the Python path
# This allows Vercel serverless to find the 'app' module and 'ml' module
sys.path.insert(0, os.path.abspath("backend"))
sys.path.insert(0, os.path.abspath("."))

# Import the FastAPI app instance from backend/app/main.py
from app.main import app
