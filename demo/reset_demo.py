#!/usr/bin/env python3
"""
reset_demo.py — Reset both demo accounts to their original seeded state in Firestore.
Useful mid-demo to show judges a fresh run.

Usage:  python demo/reset_demo.py
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../ml"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../backend"))

from app.firebase import get_firestore_db
from seed import seed_account, ACCOUNT_A, ACCOUNT_B


def reset():
    print("Resetting demo accounts to original seeded state in Firestore...")
    db = get_firestore_db()

    # Clear stress test results collection
    try:
        stress_docs = db.collection("stress_test_results").stream()
        for doc in stress_docs:
            doc.reference.delete()
        print("  [OK] Cleared stress test results")
    except Exception as exc:
        print(f"  Note: {exc}")

    # Re-seed both accounts in Firestore
    score_a = seed_account(db, ACCOUNT_A)
    score_b = seed_account(db, ACCOUNT_B)

    print(f"\nReset complete!")
    print(f"  Account A (Aisha Verma) -- Resilience Score: {score_a}")
    print(f"  Account B (Rahul Nair) -- Resilience Score: {score_b}")



if __name__ == "__main__":
    reset()

