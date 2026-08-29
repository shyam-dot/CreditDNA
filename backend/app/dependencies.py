"""FastAPI dependency: extract and verify Firebase ID token from the request."""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.database import get_db
from app.firebase import verify_firebase_token
from app import models

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db=Depends(get_db),
) -> models.User:
    """Verify Firebase token and return the corresponding User model from Firestore."""
    token = credentials.credentials
    claims = verify_firebase_token(token)
    firebase_uid = claims.get("uid")

    user_ref = db.collection("users").document(firebase_uid)
    doc = user_ref.get()

    if not doc.exists:
        # Auto-create fallback if valid token but sync was skipped
        name = claims.get("name") or claims.get("email", "").split("@")[0] or "User"
        email = claims.get("email", "")
        new_user = models.User(firebase_uid=firebase_uid, name=name, email=email)
        user_ref.set(new_user.to_dict())
        return new_user

    return models.User.from_dict(doc.to_dict(), doc_id=firebase_uid)

