"""
Serviço de autenticação com JWT e hash de senha
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from ..models.database import User

from sarak_auth_identity.config import settings
import secrets
import logging
import hashlib

logger = logging.getLogger(__name__)

# Configuração de hash de senha
import bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configuração JWT - usar chave secreta do .env OBRIGATORIAMENTE em produção
SECRET_KEY = getattr(settings, 'jwt_secret_key', None)
if not SECRET_KEY:
    logger.warning("JWT_SECRET_KEY não encontrada no ambiente. Utilizando chave temporária (não recomendável para produção).")
    SECRET_KEY = secrets.token_urlsafe(32)

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 dias


def _pre_hash_password(password: str) -> str:
    """
    Faz pré-hash da senha usando SHA-256 antes de passar para bcrypt.
    Isso resolve o problema de senhas maiores que 72 bytes, pois:
    - SHA-256 sempre produz 32 bytes (256 bits)
    - Bcrypt aceita até 72 bytes, então 32 bytes está dentro do limite
    - Isso permite senhas de qualquer tamanho sem truncamento
    """
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica se a senha está correta com segurança contra crash por inputs inválidos.
    """
    if not plain_password or not hashed_password:
        return False
        
    try:
        pre_hashed = _pre_hash_password(plain_password)
        # Verifica usando bcrypt direto se possível, fallback para pwd_context
        # Transformamos strings em bytes para o bcrypt
        return bcrypt.checkpw(
            pre_hashed.encode('utf-8'), 
            hashed_password.encode('utf-8')
        )
    except Exception as e:
        logger.error(f"Erro ao verificar senha: {e}")
        # Fallback para passlib se o hash estiver num formato que o bcrypt puro não entenda
        return pwd_context.verify(_pre_hash_password(plain_password), hashed_password)


def get_password_hash(password: str) -> str:
    """
    Gera hash da senha usando bcrypt direto.
    """
    try:
        pre_hashed = _pre_hash_password(password)
        # Gera sal e hash
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(pre_hashed.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    except Exception as e:
        logger.error(f"Erro ao fazer hash da senha com bcrypt direto: {e}")
        # Se falhar, tenta via passlib (com o patch já aplicado no topo do arquivo)
        pre_hashed = _pre_hash_password(password)
        return pwd_context.hash(pre_hashed)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Cria token JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    """Verifica e decodifica token JWT com segurança para inputs nulos."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


from sqlalchemy import func

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Busca usuário por email (case-insensitive)"""
    return db.query(User).filter(func.lower(User.email) == func.lower(email)).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Busca usuário por username (case-insensitive)"""
    return db.query(User).filter(func.lower(User.username) == func.lower(username)).first()


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    """Busca usuário por ID"""
    from uuid import UUID
    try:
        return db.query(User).filter(User.id == UUID(user_id)).first()
    except (ValueError, TypeError):
        return None


def create_user(
    db: Session,
    email: str,
    username: str,
    password: str = None
) -> User:
    """Cria novo usuário com senha devidamente hasheada"""
    # Verifica se email ou username já existem
    if get_user_by_email(db, email):
        raise ValueError("Email já está em uso")
    if get_user_by_username(db, username):
        raise ValueError("Username já está em uso")
    
    # Cria usuário com hash de senha
    user = User(
        email=email,
        username=username,
        password=get_password_hash(password) if password else None
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    logger.info(f"Usuário criado: {username} ({email})")
    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Autentica usuário por email ou username e senha usando hash.
    O parâmetro 'email' aceita tanto o email quanto o username.
    """
    # Tenta buscar por email primeiro (case-insensitive)
    user = get_user_by_email(db, email)
    
    # Se não encontrar por email, tenta por username exato
    if not user:
        user = get_user_by_username(db, email)
        
    # Se ainda não encontrar, tenta por prefixo do username (ex: 'Igor' -> 'IgorSarak')
    # SOMENTE se o termo tiver pelo menos 3 caracteres para evitar matches muito genéricos
    if not user and len(email) >= 3:
        user = db.query(User).filter(func.lower(User.username).like(f"{email.lower()}%")).first()
        
    if not user:
        return None
    if not user.is_active:
        return None

    # Verificação de hash
    stored_hash = getattr(user, "password", None)
    if not stored_hash:
        return None
        
    if not verify_password(password, stored_hash):
        return None
        
    return user


from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(lambda: None)
):
    """
    Dependency para obter usuário atual a partir do token JWT.
    Nota: O 'db' deve ser injetado pela aplicação FastAPI que utiliza este módulo.
    """
    token = credentials.credentials
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    # Importação local para evitar circular dependência se necessário
    from ..core.auth_service import get_user_by_id
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

