from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    """
    Configurações base para o módulo de Identidade e Autenticação.
    Pode ser estendido por cada microsserviço.
    """
    jwt_secret_key: Optional[str] = None
    database_url: Optional[str] = None
    
    class Config:
        # Permite carregar do .env se presente na raiz do projeto executor
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"

# Instância global
settings = Settings()
