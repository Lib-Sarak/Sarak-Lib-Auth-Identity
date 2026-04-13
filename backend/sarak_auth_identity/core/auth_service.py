"""
Serviço de autenticação com JWT e hash de senha (Sarak Matrix v5.1)
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from ..models.database import User
from sarak_auth_identity.config import settings
import logging
import hashlib
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import func
import os

logger = logging.getLogger(__name__)

# Configuração de hash de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configuração JWT Identidade (Sarak Matrix v5.1)
# Prioridade: ENV > Settings > Fallback Seguro
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "SarakMatrixSecurityKey2026OperationalKeyV1")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

if not os.getenv("JWT_SECRET_KEY"):
    logger.warning(" [AUTH] JWT_SECRET_KEY não encontrada no ENV. Usando Fallback Operacional.")
    SECRET_KEY = "SarakMatrixSecurityKey2026OperationalKeyV1"
else:
    logger.info(f"[Sarak Auth] JWT_SECRET_KEY carregada com sucesso (Início: {SECRET_KEY[:5]}...)")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 dias

# --- Utilitários de Senha ---

def _pre_hash_password(password: str) -> str:
    """Evita limite de 72 bytes do bcrypt."""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not plain_password or not hashed_password:
        return False
    try:
        pre_hashed = _pre_hash_password(plain_password)
        return bcrypt.checkpw(pre_hashed.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return pwd_context.verify(_pre_hash_password(plain_password), hashed_password)

def get_password_hash(password: str) -> str:
    pre_hashed = _pre_hash_password(password)
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pre_hashed.encode('utf-8'), salt).decode('utf-8')

# --- JWT Core ---

def get_secret_key() -> str:
    """Retorna a chave secreta do ambiente com fallback unificado para Sarak Matrix."""
    key = os.getenv("JWT_SECRET_KEY", "SarakMatrixSecurityKey2026OperationalKeyV1")
    return key.strip()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    
    current_key = get_secret_key()
    encoded_jwt = jwt.encode(to_encode, current_key, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    try:
        current_key = get_secret_key()
        payload = jwt.decode(token, current_key, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

# --- Consultas de Banco ---

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(func.lower(User.email) == func.lower(email)).first()

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    return db.query(User).filter(func.lower(User.username) == func.lower(username)).first()

def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    from uuid import UUID
    try:
        return db.query(User).filter(User.user_id == UUID(user_id)).first()
    except (ValueError, TypeError):
        return None

def create_user(db: Session, email: str, username: str, password: str = None) -> User:
    if get_user_by_email(db, email): raise ValueError("Email em uso")
    user = User(email=email, username=username, password=get_password_hash(password) if password else None)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email) or get_user_by_username(db, email)
    if not user or not user.is_active or not user.password:
        return None
    if not verify_password(password, user.password):
        return None
    return user

# --- Infraestrutura FastAPI (Injectable) ---

def get_db():
    """Stub para o Gateway"""
    return None

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = verify_token(token)
    
    if not payload or not payload.get("sub"):
        print(f">>> [LibAuth:401] Token Inválido ou Payload corrompido.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="LibAuth: Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    print(f">>> [LibAuth:Audit] Buscando usuário no DB para UUID: {user_id}")
    
    try:
        user = get_user_by_id(db, user_id)
        if not user:
            print(f">>> [LibAuth:401] UUID {user_id} não encontrado no banco ativo.")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="LibAuth: Identidade não encontrada no banco",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        print(f">>> [LibAuth:Success] Usuário Identificado: {user.email}")
        return user
    except Exception as e:
        print(f">>> [LibAuth:Error] Erro crítico na busca: {str(e)}")
        raise HTTPException(status_code=401, detail=f"LibAuth: Erro interno: {str(e)}")
