import logging
from typing import Generator, Optional
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials

from ..database import SessionLocal
from . import auth_service

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
    """Real implementation injected natively by the Auth Lib."""
    logger.info(f" [Auth-Debug] Validating request. Credentials present: {credentials is not None}")
    if credentials:
        logger.info(f" [Auth-Debug] Token received (starts with): {credentials.credentials[:10]}...")
    
    user = await auth_service.get_current_user(credentials=credentials, db=db)
    logger.info(f" [Auth-Debug] Authentication result: User found={user is not None}")
    return user
