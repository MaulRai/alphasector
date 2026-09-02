import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(ROOT_DIR / ".env")

class Settings(BaseSettings):
    PROJECT_NAME: str = "AlphaSector"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    
    # Sectors API
    SECTORS_API_KEY: str = Field(default_factory=lambda: os.getenv("SECTORS_API_KEY", ""))
    SECTORS_BASE_URL: str = "https://api.sectors.app/v2"
    
    # LLM Settings
    GEMINI_API_KEY: str = Field(default_factory=lambda: os.getenv("GEMINI_API_KEY", ""))
    ANTHROPIC_API_KEY: str = Field(default_factory=lambda: os.getenv("ANTHROPIC_API_KEY", ""))
    OPENAI_API_KEY: str = Field(default_factory=lambda: os.getenv("OPENAI_API_KEY", ""))
    
    # Server & CORS
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000"
    
    # Database
    DATABASE_URL: str = Field(default_factory=lambda: os.getenv("DATABASE_URL", ""))

    @property
    def cors_origins_list(self) -> List[str]:
        if not self.CORS_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
