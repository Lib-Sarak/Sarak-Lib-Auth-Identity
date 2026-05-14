from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import os

class AuthSettings(BaseSettings):
    """
    Configurações profissionais do módulo Sarak Identity (v9.0).
    Utiliza Pydantic Settings para validação e fail-fast initialization.
    """
    
    # Database
    DATABASE_URL: str = "sqlite:///./identity.db"
    
    # Security
    JWT_SECRET_KEY: str  # Obrigatório (Fail-Fast)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Multi-tenancy / Defaults
    DEFAULT_SYSTEM_ID: str = "SARAK_CORE"
    
    # OTP / 2FA
    OTP_ISSUER_NAME: str = "Sarak Sovereign"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

# Instância global de configurações
settings = AuthSettings()
