"""
LLM client — single interface for generating plain-English explanations.
Supports: Ollama (local), Groq, Together AI (hosted Llama endpoints).
Swap provider with a one-line config change in .env (LLM_PROVIDER=...).
"""
import os
import json
import time
import requests
from typing import Optional

# Allow running from both ml/ and from the backend (sys.path manipulated by main.py)
try:
    from app.config import settings as _settings
    PROVIDER = _settings.LLM_PROVIDER
    OLLAMA_URL = _settings.OLLAMA_BASE_URL
    OLLAMA_MODEL = _settings.OLLAMA_MODEL
    GROQ_API_KEY = _settings.GROQ_API_KEY
    GROQ_MODEL = _settings.GROQ_MODEL
    TOGETHER_API_KEY = _settings.TOGETHER_API_KEY
    TOGETHER_MODEL = _settings.TOGETHER_MODEL
except ImportError:
    PROVIDER = os.environ.get("LLM_PROVIDER", "ollama")
    OLLAMA_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.1:8b")
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
    GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.1-8b-instant")
    TOGETHER_API_KEY = os.environ.get("TOGETHER_API_KEY")
    TOGETHER_MODEL = os.environ.get("TOGETHER_MODEL", "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo")

TIMEOUT_SECONDS = 8  # generous timeout for demo reliability
MAX_EXPLANATION_CHARS = 280

SYSTEM_PROMPT = (
    "You are a financial explainer helping everyday people understand their finances. "
    "Given a score and its contributing factors, write ONE clear, plain-English sentence "
    "a non-expert can understand. Never invent numbers not present in the input. "
    "Never use jargon like 'coefficient', 'feature importance', 'SHAP', or 'algorithm'. "
    "Be direct, positive where possible, and actionable. "
    "Output ONLY the sentence — no preamble, no disclaimers, no bullet points."
)


def _load_prompt_template(explanation_type: str) -> str:
    """Load a prompt template from ml/prompts/."""
    template_dir = os.path.join(os.path.dirname(__file__), "prompts")
    template_path = os.path.join(template_dir, f"{explanation_type}.txt")
    if os.path.exists(template_path):
        with open(template_path) as f:
            return f.read().strip()
    return "Summarise the following financial data in one plain sentence: {context}"


_ollama_offline = False

def _call_ollama(system: str, user_content: str) -> str:
    global _ollama_offline
    if _ollama_offline:
        raise ConnectionError("Ollama is known to be offline")
    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user_content},
        ],
        "stream": False,
        "options": {"temperature": 0.3, "num_predict": 100},
    }
    try:
        resp = requests.post(
            f"{OLLAMA_URL}/api/chat", json=payload, timeout=(1.0, TIMEOUT_SECONDS)
        )
        resp.raise_for_status()
        return resp.json()["message"]["content"].strip()
    except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as err:
        _ollama_offline = True
        raise err


def _call_openai_compat(api_key: str, base_url: str, model: str, system: str, user_content: str) -> str:
    """Generic caller for OpenAI-compatible APIs (Groq, Together, etc.)."""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user_content},
        ],
        "max_tokens": 100,
        "temperature": 0.3,
    }
    resp = requests.post(
        f"{base_url}/chat/completions", headers=headers, json=payload, timeout=TIMEOUT_SECONDS
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"].strip()


def _fallback_explanation(context: dict, explanation_type: str) -> str:
    """Rule-based fallback if the LLM call fails or times out."""
    score = context.get("score") or context.get("perturbed_score", 0)
    if explanation_type == "resilience_score":
        if score >= 65:
            return f"Your financial resilience score of {score} is strong — you handle income changes and expenses well."
        elif score >= 40:
            return f"Your resilience score of {score} is moderate — some financial buffers are in place but could be strengthened."
        else:
            return f"Your resilience score of {score} suggests limited financial buffer — reducing EMI or building savings would help."
    elif explanation_type == "stress_test":
        scenario = context.get("scenario", "financial shock")
        delta = context.get("score_delta", 0)
        months = context.get("months_to_distress")
        if months and months < 6:
            return f"A {scenario} at this level would put pressure on your finances within {months:.0f} months."
        return f"Your resilience score drops by {abs(delta):.0f} points under this scenario, but you have enough buffer to manage."
    elif explanation_type == "loan_recommendation":
        limit = context.get("sustainable_limit", 0)
        return f"Based on your income and expenses, ₹{limit/100000:.1f}L is a sustainable borrowing amount that keeps your finances healthy."
    elif explanation_type == "dna_dimension":
        dim = context.get("dimension", "this area")
        return f"Your {dim} score reflects your current financial patterns in this dimension."
    return "Your financial profile has been computed based on your account data."


def generate_explanation(context: dict, explanation_type: str) -> str:
    """
    Generate a plain-English financial explanation.

    Args:
        context: Structured dict with score, top_factors, scenario details, etc.
        explanation_type: One of "resilience_score" | "dna_dimension" | "stress_test" | "loan_recommendation"

    Returns:
        A single plain-English sentence (max ~280 chars).
    """
    template = _load_prompt_template(explanation_type)
    user_content = template.format(context=json.dumps(context, indent=2))

    try:
        if PROVIDER == "ollama":
            text = _call_ollama(SYSTEM_PROMPT, user_content)
        elif PROVIDER == "groq" and GROQ_API_KEY:
            text = _call_openai_compat(
                GROQ_API_KEY, "https://api.groq.com/openai/v1", GROQ_MODEL,
                SYSTEM_PROMPT, user_content
            )
        elif PROVIDER == "together" and TOGETHER_API_KEY:
            text = _call_openai_compat(
                TOGETHER_API_KEY, "https://api.together.xyz/v1", TOGETHER_MODEL,
                SYSTEM_PROMPT, user_content
            )
        else:
            return _fallback_explanation(context, explanation_type)

        # Enforce max length and strip hedging phrases
        text = text.replace("I'm not a financial advisor.", "").strip()
        text = text.replace("Please consult a financial professional.", "").strip()
        if len(text) > MAX_EXPLANATION_CHARS:
            text = text[:MAX_EXPLANATION_CHARS].rsplit(" ", 1)[0] + "."
        return text

    except Exception:
        return _fallback_explanation(context, explanation_type)
