"""POST /api/auth/sync — create or upsert a Firestore User document after Firebase signup/login."""
from fastapi import APIRouter, Depends
from datetime import datetime

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/sync", response_model=schemas.AuthSyncResponse)
def sync_user(payload: schemas.AuthSyncRequest, db=Depends(get_db)):
    """Called by the frontend immediately after Firebase signup/login.
    Creates or updates the Firestore user document (idempotent).
    """
    user_ref = db.collection("users").document(payload.firebase_uid)
    doc = user_ref.get()

    if not doc.exists:
        user_data = {
            "userId": payload.firebase_uid,
            "firebase_uid": payload.firebase_uid,
            "name": payload.name,
            "email": payload.email,
            "linked_demo_account_id": None,
            "created_at": datetime.utcnow().isoformat(),
        }
        user_ref.set(user_data)
        has_linked = False
    else:
        existing = doc.to_dict()
        has_linked = bool(existing.get("linked_demo_account_id"))
        # Update name or email if changed
        user_ref.update({
            "name": payload.name,
            "email": payload.email,
        })

    return schemas.AuthSyncResponse(
        id=payload.firebase_uid,
        firebase_uid=payload.firebase_uid,
        name=payload.name,
        email=payload.email,
        has_linked_account=has_linked,
    )

