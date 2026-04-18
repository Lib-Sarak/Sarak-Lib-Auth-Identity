import logging
from typing import Generator, Optional
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials

from .database import SessionLocal
from .core import auth_service

logger = logging.getLogger(__name__)

def _get_identity_db() -> Generator:
    """Sessão dedicada para autenticação. Schema 'sarak_auth' já é explícito no modelo."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_real_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(auth_service.security),
    db=Depends(_get_identity_db),
):
    """Implementação real injetada nativamente pela propria Lib de Auth."""
    logger.info(f">>> [AUTH DEBUG] Validando request. Credentials present: {credentials is not None}")
    if credentials:
        logger.info(f">>> [AUTH DEBUG] Token recebido (primeiros 15 chars): {credentials.credentials[:15]}...")
    
    user = await auth_service.get_current_user(credentials=credentials, db=db)
    logger.info(f">>> [AUTH DEBUG] Resultado da autenticação: User found={user is not None}")
    return user
