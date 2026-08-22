from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./test.db"
    SECRET_KEY: str = "secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    BACKEND_CORS_ORIGINS: List[str] = []
    ENVIRONMENT: str = "dev"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    OPENAI_API_KEY: str = ""
    APP_NAME: str = "ThinkBlaze Dayflow"
    VERSION: str = "1.0.0"

    model_config = SettingsConfigDict(env_file='.env', case_sensitive=True)

settings = Settings()
