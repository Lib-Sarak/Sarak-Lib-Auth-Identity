"""
Authentication service with JWT and password hashing (v5.1)
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from .models import User
from sarak_auth_identity.config import settings
import logging
import hashlib
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import func
import os
import secrets
from typing import List, Dict, Any
import pyotp

logger = logging.getLogger(__name__)

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Identity JWT configuration (v5.1)
# Strictly enforced ENV-only configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

if not SECRET_KEY:
    raise RuntimeError("[FATAL] JWT_SECRET_KEY not found in environment variables. Sarak security requires explicit secrets management.")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # Security Standard: 30 minutes

# --- Password Utilities ---

def _pre_hash_password(password: str) -> str:
    """Avoids bcrypt 72-byte limit."""
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
    """Returns the secret key from environment with mandatory check."""
    key = os.getenv("JWT_SECRET_KEY")
    if not key:
        raise RuntimeError("JWT_SECRET_KEY is required but not set.")
    return key.strip()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    
    current_key = get_secret_key()
    encoded_jwt = jwt.encode(to_encode, current_key, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=30)  # Refresh token valid for 30 days
    to_encode.update({"exp": expire, "type": "refresh"})
    
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

# --- MFA Logic (v7.7) ---

def generate_mfa_setup(user: User) -> Dict[str, str]:
    """Generates a new TOTP secret and provisioning URI for the user."""
    secret = pyotp.random_base32()
    # Sarak v7.7: The issuer is standardized to "Sarak (SystemName)"
    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(
        name=user.email, 
        issuer_name=f"Sarak ({user.system})"
    )
    return {"secret": secret, "uri": provisioning_uri}

def verify_mfa_code(user: User, code: str, secret_override: str = None) -> bool:
    """Verifies the 6-digit TOTP code against the user's secret."""
    secret = secret_override or user.mfa_secret
    if not secret:
        return False
    totp = pyotp.TOTP(secret)
    # 0 is the default window, we allow 1 (30 seconds before/after) for clock drift
    return totp.verify(code, valid_window=1)

def create_mfa_challenge_token(user: User) -> str:
    """Creates a short-lived token to perform the MFA verification after password success."""
    to_encode = {
        "sub": str(user.user_id),
        "system": user.system,
        "type": "mfa_challenge",
        "exp": datetime.utcnow() + timedelta(minutes=5)
    }
    current_key = get_secret_key()
    return jwt.encode(to_encode, current_key, algorithm=ALGORITHM)

# --- Session & Revocation ---

def create_session(db: Session, user_id: str, system: str, refresh_token: str, user_agent: str = None, ip: str = None):
    from .models import UserSession
    from uuid import UUID
    
    # [POLÍTICA SOBERANA] Revogação de sessões anteriores (Sessão Única v8.5)
    # Antes de criar a nova, invalidamos todas as outras ativas para este usuário neste sistema.
    db.query(UserSession).filter(
        UserSession.user_id == UUID(user_id),
        UserSession.system == system,
        UserSession.is_revoked == False
    ).update({"is_revoked": True})
    db.flush() # Sincroniza sem commitar ainda para manter a transação atômica

    expire = datetime.utcnow() + timedelta(days=30)
    session = UserSession(
        user_id=UUID(user_id),
        system=system,
        refresh_token=refresh_token,
        user_agent=user_agent,
        ip_address=ip,
        expires_at=expire
    )
    db.add(session)
    db.commit()
    return session

def invalidate_session(db: Session, refresh_token: str):
    from .models import UserSession
    session = db.query(UserSession).filter(UserSession.refresh_token == refresh_token).first()
    if session:
        session.is_revoked = True
        db.commit()
        return True
    return False

def is_session_valid(db: Session, user_id: str, system: str) -> bool:
    """Check if the user has at least one active session (Basic Invalidation Check)"""
    from .models import UserSession
    from uuid import UUID
    
    session = db.query(UserSession).filter(
        UserSession.user_id == UUID(user_id),
        UserSession.system == system,
        UserSession.is_revoked == False,
        UserSession.expires_at > datetime.utcnow()
    ).first()
    return session is not None

# --- RBAC Utilities ---

def has_permission(user: User, permission_name: str) -> bool:
    """Verifica permissÃµes granulares (v5.5)."""
    if user.is_superuser:
        return True
    
    for role in user.roles:
        for perm in role.permissions:
            if perm.name == permission_name:
                return True
    return False

def get_user_max_level(user: User) -> int:
    """Calcula o nÃ­vel mÃ¡ximo de acesso do usuÃ¡rio baseado em suas roles (v7.6)."""
    if user.is_superuser:
        return 100
    if not user.roles:
        return 10
    return max([role.level for role in user.roles])

def can_access_level(user: User, required_level: int) -> bool:
    """Verifica se o usuÃ¡rio possui nÃ­vel igual ou superior ao exigido."""
    return get_user_max_level(user) >= required_level

def permission_required(permission_name: str):
    """FastAPI Dependency for granular RBAC"""
    async def _permission_checker(current_user: User = Depends(get_current_user)):
        if not has_permission(current_user, permission_name):
            logger.warning(f" [RBAC] Access denied for user {current_user.email} on '{permission_name}'")
            raise HTTPException(
                status_code=status.HTTP_403_FOR_ALLOWED,
                detail=f"SovereignAuth: Missing permission '{permission_name}'"
            )
        return current_user
    return _permission_checker

# --- Consultas de Banco ---

def get_user_by_email(db: Session, email: str, system: str) -> Optional[User]:
    return db.query(User).filter(
        func.lower(User.email) == func.lower(email),
        User.system == system
    ).first()

def get_user_by_username(db: Session, username: str, system: str) -> Optional[User]:
    return db.query(User).filter(
        func.lower(User.username) == func.lower(username),
        User.system == system
    ).first()

def get_user_by_id(db: Session, user_id: str, system: str) -> Optional[User]:
    from uuid import UUID
    try:
        return db.query(User).filter(
            User.user_id == UUID(user_id) if isinstance(user_id, str) else user_id,
            User.system == system
        ).first()
    except (ValueError, TypeError):
        return None

def create_user(db: Session, email: str, username: str, system: str, password: str = None, is_superuser: bool = False) -> User:
    if get_user_by_email(db, email, system): raise ValueError("Email already in use in this system")
    user = User(
        email=email, 
        username=username, 
        system=system,
        password=get_password_hash(password) if password else None,
        is_superuser=is_superuser
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, email: str, password: str, system: str) -> Optional[User]:
    user = get_user_by_email(db, email, system) or get_user_by_username(db, email, system)
    if not user or not user.is_active or not user.password:
        return None
    if not verify_password(password, user.password):
        return None
    return user

# --- FastAPI Infrastructure (Injectable) ---

def get_db():
    """Stub for Gateway - Overridden in actual implementation"""
    from sarak_auth_identity.database import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = verify_token(token)
    
    if not payload or not payload.get("sub") or payload.get("type") != "access":
        logger.warning(" [Auth-Audit] Invalid Access Token.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="LibAuth: Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    system = payload.get("system")
    
    if not system:
        logger.warning(" [Auth-Audit] Missing 'system' context in token.")
        raise HTTPException(status_code=401, detail="LibAuth: Missing system context")

    # [Sovereign Security] Session Invalidation Check
    if not is_session_valid(db, user_id, system):
        logger.warning(f" [Auth-Audit] Revoked session for user {user_id} in system {system}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="LibAuth: Session has been revoked or expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        user = get_user_by_id(db, user_id, system)
        if not user:
            raise HTTPException(status_code=401, detail="Identity not found")
        
        return user
    except Exception as e:
        logger.error(f" [Auth-Audit] Error during user lookup: {e}")
        raise HTTPException(status_code=401, detail="Internal identity error")

# --- RBAC Management (v6.8) ---

def update_or_create_role(db: Session, name: str, system: str, permissions: List[str], level: int = 10, description: str = None):
    from .models import Role, Permission
    role = db.query(Role).filter(Role.name == name, Role.system == system).first()
    if not role:
        role = Role(
            name=name, 
            system=system, 
            level=level,
            description=description or f"Custom role: {name} for {system}"
        )
        db.add(role)
        db.commit()
        db.refresh(role)
    else:
        # Atualiza metadados do papel (v8.1)
        role.level = level
        if description:
            role.description = description
    
    # Sync permissions
    role.permissions = []
    for p_name in permissions:
        perm = db.query(Permission).filter(Permission.name == p_name, Permission.system == system).first()
        if not perm:
            perm = Permission(name=p_name, system=system, description=f"Auto-generated permission: {p_name} for {system}")
            db.add(perm)
            db.flush()
        role.permissions.append(perm)
    
    db.commit()
    db.refresh(role)
    return role

def assign_roles_to_user(db: Session, user_id: str, role_names: List[str]):
    from .models import User, Role
    from uuid import UUID
    user = db.query(User).filter(User.user_id == UUID(user_id) if isinstance(user_id, str) else user_id).first()
    if not user:
        return None
    
    user.roles = []
    for r_name in role_names:
        role = db.query(Role).filter(Role.name == r_name).first()
        if role:
            user.roles.append(role)
    
    db.commit()
    db.refresh(user)
    return user

# --- Password Recovery (v7.6) ---

def request_password_reset(db: Session, email: str, system: str) -> Optional[str]:
    """Gera um token de reset, salva no banco e retorna para o chamador (v7.6)."""
    from .models import PasswordResetToken
    user = get_user_by_email(db, email, system)
    if not user:
        return None
        
    # Limpar tokens antigos (Audit/Higiene)
    db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user.user_id).delete()
    
    token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    
    expires = datetime.utcnow() + timedelta(hours=1)
    
    reset_token = PasswordResetToken(
        user_id=user.user_id,
        system=system,
        token_hash=token_hash,
        expires_at=expires
    )
    db.add(reset_token)
    db.commit()
    
    return token

def confirm_password_reset(db: Session, token: str, new_password: str, system: str) -> bool:
    """Valida o token e atualiza a senha do usuÃ¡rio correspondente."""
    from .models import PasswordResetToken
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    
    record = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash,
        PasswordResetToken.system == system,
        PasswordResetToken.expires_at > datetime.utcnow()
    ).first()
    
    if not record:
        return False
        
    user = get_user_by_id(db, record.user_id, system)
    if user:
        user.password = get_password_hash(new_password)
        db.delete(record)
        db.commit()
        return True
    return False

# --- OAuth Processing (v7.6) ---

def process_oauth_user(db: Session, provider: str, oauth_id: str, email: str, username: str, system: str, avatar_url: str = None, full_name: str = None) -> User:
    """Realiza o Upsert do usuÃ¡rio OAuth e vincula ao sistema atual."""
    user = db.query(User).filter(User.email == email, User.system == system).first()
    
    if not user:
        user = User(
            email=email,
            username=username,
            full_name=full_name or username,
            system=system,
            oauth_provider=provider,
            oauth_id=oauth_id,
            avatar_url=avatar_url,
            is_active=True
        )
        db.add(user)
    else:
        # Atualiza vÃ­nculo OAuth se necessÃ¡rio
        user.oauth_provider = provider
        user.oauth_id = oauth_id
        if avatar_url:
            user.avatar_url = avatar_url
        if full_name and not user.full_name:
            user.full_name = full_name
            
    db.commit()
    db.refresh(user)
    return user

# --- Governance & RBAC Levels (v7.6) ---

def can_access_level(user: User, required_level: int) -> bool:
    """
    Verifica se o usuÃ¡rio possui nÃ­vel de poder suficiente (Hierarquia Sarak).
    MASTER (100) > ADMIN (50) > USER (10)
    """
    if not user or not user.is_active:
        return False
        
    if user.is_superuser:
        return True
        
    # ObtÃ©m o maior nÃ­vel entre todas as roles do usuÃ¡rio
    max_level = 0
    if user.roles:
        max_level = max([role.level for role in user.roles])
        
    return max_level >= required_level
def change_password(db: Session, user: User, current_password: str, new_password: str) -> bool:
    """Valida a senha atual e define a nova senha (v8.0)."""
    if not verify_password(current_password, user.password):
        return False
    
    # Política básica: não pode ser igual à anterior
    if current_password == new_password:
        return False

    user.password = get_password_hash(new_password)
    user.must_change_password = False
    db.commit()
    return True
