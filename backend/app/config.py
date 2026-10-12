from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
import os

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "OmniSearch AI"
    APP_ENV: str = "development"
    DEBUG: str | bool = "true"

    # Banco de Dados (PostgreSQL + pgvector em produção, ou SQLite local)
    DATABASE_URL: str = "sqlite+aiosqlite:///./omnisearch.db"

    # Modelo Multimodal SigLIP
    MODEL_NAME: str = "google/siglip-base-patch16-384"
    EMBEDDING_DIM: int = 768

    # Armazenamento de Imagens
    UPLOAD_DIR: str = "static/uploads"
    BASE_URL: str = "http://localhost:8000"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]

settings = Settings()
