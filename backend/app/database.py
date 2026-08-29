"""Firestore Database client dependency for Credit DNA."""
from app.firebase import get_firestore_db


def get_db():
    """FastAPI dependency to yield the Firestore database client."""
    db = get_firestore_db()
    yield db

