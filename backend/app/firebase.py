"""Firebase Admin SDK initialisation, token verification, and Firestore client."""
import os
from typing import Optional

import firebase_admin
from firebase_admin import auth, credentials, firestore
from fastapi import HTTPException, status

from app.config import settings

_firebase_app: Optional[firebase_admin.App] = None
_firestore_db = None


def _init_firebase() -> firebase_admin.App:
    global _firebase_app
    if _firebase_app is not None:
        return _firebase_app

    # Check if already initialized by another module
    try:
        _firebase_app = firebase_admin.get_app()
        return _firebase_app
    except ValueError:
        pass

    # Candidate paths for the service account json key
    candidate_paths = []
    if settings.FIREBASE_SERVICE_ACCOUNT_PATH:
        candidate_paths.append(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
    candidate_paths.extend([
        os.path.join(os.path.dirname(__file__), "..", "firebase-service-account.json"),
        os.path.join(os.path.dirname(__file__), "../..", "firebase-service-account.json"),
        os.path.join(os.getcwd(), "firebase-service-account.json"),
        os.path.join(os.getcwd(), "backend", "firebase-service-account.json"),
    ])

    sa_path = None
    for p in candidate_paths:
        if os.path.exists(p):
            sa_path = os.path.abspath(p)
            break

    if sa_path:
        cred = credentials.Certificate(sa_path)
        _firebase_app = firebase_admin.initialize_app(cred, {"projectId": settings.FIREBASE_PROJECT_ID})
    else:
        # Fall back to Application Default Credentials / environment variable
        try:
            cred = credentials.ApplicationDefault()
            _firebase_app = firebase_admin.initialize_app(
                cred, {"projectId": settings.FIREBASE_PROJECT_ID}
            )
        except Exception:
            # Development mode: use project ID only
            _firebase_app = firebase_admin.initialize_app(
                options={"projectId": settings.FIREBASE_PROJECT_ID}
            )
    return _firebase_app



def get_firestore_db():
    """Get the Firestore client instance."""
    global _firestore_db
    _init_firebase()
    if _firestore_db is None:
        try:
            _firestore_db = firestore.client()
        except Exception as exc:
            # Provide mock or error handling in dev
            print(f"[Firebase] Warning: Could not initialize Firestore client: {exc}")
            raise
    return _firestore_db


def verify_firebase_token(id_token: str) -> dict:
    """Verify a Firebase ID token and return the decoded claims."""
    _init_firebase()
    # In test / dev environments if mock token passed:
    if settings.DEBUG and id_token.startswith("mock_token_"):
        uid = id_token.replace("mock_token_", "")
        return {"uid": uid, "email": f"{uid}@example.com", "name": uid.capitalize()}

    try:
        decoded = auth.verify_id_token(id_token)
        return decoded
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except auth.InvalidIdTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {exc}",
        )


