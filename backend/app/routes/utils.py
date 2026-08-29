"""Shared helper: resolve the demo account linked to the current user."""
from fastapi import HTTPException, status
from app import models


def get_linked_demo_account(current_user: models.User, db) -> models.DemoAccount:
    """Return the DemoAccount linked to the user or raise 400."""
    demo_id = current_user.linked_demo_account_id
    if not demo_id:
        # Check directly from Firestore user doc in case it was updated concurrently
        user_doc = db.collection("users").document(current_user.firebase_uid).get()
        if user_doc.exists:
            demo_id = user_doc.to_dict().get("linked_demo_account_id")

    if not demo_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No bank account linked. Please connect a bank account first.",
        )

    demo_doc = db.collection("demo_accounts").document(demo_id).get()
    if not demo_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Linked demo account '{demo_id}' not found in Firestore.",
        )

    return models.DemoAccount.from_dict(demo_doc.to_dict(), doc_id=demo_id)


def score_to_band(score: float) -> tuple[str, str]:
    """Return (band_label, color) for a resilience score."""
    if score >= 65:
        return "strong", "green"
    elif score >= 40:
        return "moderate", "amber"
    else:
        return "weak", "red"

