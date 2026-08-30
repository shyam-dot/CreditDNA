from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    FIREBASE_PROJECT_ID: str = "credit-dna"
    FIREBASE_SERVICE_ACCOUNT_PATH: Optional[str] = None
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.1:8b"
    LLM_PROVIDER: str = "ollama"  # "ollama" | "groq" | "together"
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    TOGETHER_API_KEY: Optional[str] = None
    TOGETHER_MODEL: str = "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo"
    SECRET_KEY: str = "supersecretkey_change_in_production"
    DEBUG: bool = True

    class Config:
        env_file = [".env", "../.env"]
        extra = "ignore"


settings = Settings()
