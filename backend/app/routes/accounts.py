"""Routes for bank connection: list demo accounts and link one to a user via Firestore."""
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import get_db
from app.dependencies import get_current_user
from app import models, schemas

router = APIRouter(prefix="/api", tags=["accounts"])


@router.get("/demo-accounts", response_model=List[schemas.DemoAccountOut])
def list_demo_accounts(db=Depends(get_db)):
    """Public endpoint — list the seeded demo bank accounts from Firestore."""
    docs = db.collection("demo_accounts").stream()
    accounts = []
    for doc in docs:
        d = doc.to_dict()
        accounts.append(
            schemas.DemoAccountOut(
                id=d.get("id") or doc.id,
                holder_name=d.get("holder_name", ""),
                bank_name=d.get("bank_name", ""),
                account_suffix=d.get("account_suffix", ""),
                display_label=d.get("display_label", ""),
            )
        )
    # Sort by ID for deterministic order
    accounts.sort(key=lambda a: a.id)
    return accounts


@router.post("/link-account", response_model=schemas.LinkAccountResponse)
def link_account(
    payload: schemas.LinkAccountRequest,
    current_user: models.User = Depends(get_current_user),
    db=Depends(get_db),
):
    """Link (or re-link) a demo account to the authenticated user in Firestore."""
    demo_ref = db.collection("demo_accounts").document(payload.demo_account_id)
    demo_doc = demo_ref.get()
    if not demo_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demo account not found",
        )

    demo_data = demo_doc.to_dict()
    now = datetime.utcnow()

    # Update user document in Firestore with link & bank profile summary
    user_ref = db.collection("users").document(current_user.firebase_uid)
    resilience_score = (demo_data.get("resilience_score") or {}).get("score")

    user_ref.set({
        "userId": current_user.firebase_uid,
        "firebase_uid": current_user.firebase_uid,
        "name": current_user.name or demo_data.get("holder_name"),
        "email": current_user.email,
        "bank": demo_data.get("bank_name"),
        "account": f"••••{demo_data.get('account_suffix')}",
        "employment": (demo_data.get("financial_profile") or {}).get("income_type", "salaried").capitalize(),
        "resilienceScore": resilience_score,
        "linked_demo_account_id": payload.demo_account_id,
        "linked_at": now.isoformat(),
    }, merge=True)

    return schemas.LinkAccountResponse(
        message="Account linked successfully",
        demo_account_id=payload.demo_account_id,
        linked_at=now,
    )

