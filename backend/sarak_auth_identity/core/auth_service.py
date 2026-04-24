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

logger = logging.getLogger(__name__)

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Identity JWT configuration (v5.1)
# Priority: ENV > Settings > Secure Fallback
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "SarakSecurityKey2026OperationalKeyV1")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

if not os.getenv("JWT_SECRET_KEY"):
    logger.warning(" [AUTH] JWT_SECRET_KEY not found in ENV. Using Operational Fallback.")
    SECRET_KEY = "SarakSecurityKey2026OperationalKeyV1"
else:
    logger.info(f"[Sarak Auth] JWT_SECRET_KEY loaded successfully (Start: {SECRET_KEY[:5]}...)")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

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
    """Returns the secret key from environment with unified fallback."""
    key = os.getenv("JWT_SECRET_KEY", "SarakSecurityKey2026OperationalKeyV1")
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

# --- Session & Revocation ---

def create_session(db: Session, user_id: str, refresh_token: str, user_agent: str = None, ip: str = None):
    from .models import UserSession
    from uuid import UUID
    
    expire = datetime.utcnow() + timedelta(days=30)
    session = UserSession(
        user_id=UUID(user_id),
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

def is_session_valid(db: Session, user_id: str) -> bool:
    """Check if the user has at least one active session (Basic Invalidation Check)"""
    from .models import UserSession
    from uuid import UUID
    
    session = db.query(UserSession).filter(
        UserSession.user_id == UUID(user_id),
        UserSession.is_revoked == False,
        UserSession.expires_at > datetime.utcnow()
    ).first()
    return session is not None

# --- RBAC Utilities ---

def has_permission(user: User, permission_name: str) -> bool:
    if user.is_superuser:
        return True
    
    for role in user.roles:
        for perm in role.permissions:
            if perm.name == permission_name:
                return True
    return False

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

def create_user(db: Session, email: str, username: str, password: str = None, is_superuser: bool = False) -> User:
    if get_user_by_email(db, email): raise ValueError("Email already in use")
    user = User(
        email=email, 
        username=username, 
        password=get_password_hash(password) if password else None,
        is_superuser=is_superuser
    )
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
    
    # [Sovereign Security] Session Invalidation Check
    if not is_session_valid(db, user_id):
        logger.warning(f" [Auth-Audit] Revoked session for user {user_id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="LibAuth: Session has been revoked or expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        user = get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=401, detail="Identity not found")
        
        return user
    except Exception as e:
        logger.error(f" [Auth-Audit] Error during user lookup: {e}")
        raise HTTPException(status_code=401, detail="Internal identity error")

# --- RBAC Management (v6.8) ---

def update_or_create_role(db: Session, name: str, permissions: List[str]):
    from .models import Role, Permission
    role = db.query(Role).filter(Role.name == name).first()
    if not role:
        role = Role(name=name, description=f"Custom role: {name}")
        db.add(role)
        db.commit()
        db.refresh(role)
    
    # Sync permissions
    role.permissions = []
    for p_name in permissions:
        perm = db.query(Permission).filter(Permission.name == p_name).first()
        if not perm:
            perm = Permission(name=p_name, description=f"Auto-generated permission: {p_name}")
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
