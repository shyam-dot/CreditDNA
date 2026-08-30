"""Shared helper: resolve the demo account linked to the current user."""
from fastapi import HTTPException, status
from app import models





def score_to_band(score: float) -> tuple[str, str]:
    """Return (band_label, color) for a resilience score."""
    if score >= 65:
        return "strong", "green"
    elif score >= 40:
        return "moderate", "amber"
    else:
        return "weak", "red"

