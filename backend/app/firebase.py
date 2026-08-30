"""Firebase Admin SDK initialisation, token verification, and Firestore client."""
import os
import json
import base64
from typing import Optional

import firebase_admin
from firebase_admin import auth, credentials, firestore
from fastapi import HTTPException, status

from app.config import settings

_firebase_app: Optional[firebase_admin.App] = None
_firestore_db = None


def _init_firebase() -> Optional[firebase_admin.App]:
    global _firebase_app
    if _firebase_app is not None:
        return _firebase_app

    # Check if already initialized
    try:
        _firebase_app = firebase_admin.get_app()
        return _firebase_app
    except ValueError:
        pass

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

    try:
        if sa_path:
            cred = credentials.Certificate(sa_path)
            _firebase_app = firebase_admin.initialize_app(cred, {"projectId": settings.FIREBASE_PROJECT_ID})
        else:
            _firebase_app = firebase_admin.initialize_app(options={"projectId": settings.FIREBASE_PROJECT_ID})
    except Exception as exc:
        print(f"[Firebase] Note: App init fallback: {exc}")
    return _firebase_app


def get_firestore_db():
    """Get the Firestore client instance."""
    global _firestore_db
    _init_firebase()
    if _firestore_db is None:
        try:
            _firestore_db = firestore.client()
        except Exception as exc:
            print(f"[Firebase] Firestore client note: {exc}")
    return _firestore_db


def _decode_jwt_payload_fallback(id_token: str) -> Optional[dict]:
    """Decode JWT payload directly without network call when offline or in debug mode."""
    try:
        parts = id_token.split(".")
        if len(parts) >= 2:
            padded = parts[1] + "=" * (4 - len(parts[1]) % 4)
            payload_bytes = base64.urlsafe_b64decode(padded)
            return json.loads(payload_bytes.decode("utf-8"))
    except Exception:
        pass
    return None


def verify_firebase_token(id_token: str) -> dict:
    """Verify a Firebase ID token and return the decoded claims."""
    _init_firebase()
    
    if settings.DEBUG and id_token.startswith("mock_token_"):
        uid = id_token.replace("mock_token_", "")
        return {"uid": uid, "email": f"{uid}@example.com", "name": uid.capitalize()}

    try:
        decoded = auth.verify_id_token(id_token)
        return decoded
    except Exception as exc:
        # Development / Offline Fallback: decode unverified payload so UI is never blocked
        if settings.DEBUG:
            payload = _decode_jwt_payload_fallback(id_token)
            if payload and ("user_id" in payload or "sub" in payload):
                uid = payload.get("user_id") or payload.get("sub")
                email = payload.get("email", "")
                name = payload.get("name") or (email.split("@")[0] if email else "User")
                return {"uid": uid, "email": email, "name": name}

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
        )
