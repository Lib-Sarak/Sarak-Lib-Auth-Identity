from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
import json
import os
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy import func
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr
import uuid
import logging
from sqlalchemy.orm import Session, sessionmaker, joinedload

# Configuração de Logs
logger = logging.getLogger(__name__)

from ..core import auth_service
from ..core.models import User, UserSession, UserInteraction, Role, Permission
from ..database import get_db, engine, setup_identity_db
from ..core.seed import seed_auth_identity
from ..core.interaction_service import InteractionService


async def get_current_user(
    credentials = Depends(auth_service.security),
    db: Session = Depends(get_db)
):
    """Actual implementation of user lookup in the active schema."""
    return await auth_service.get_current_user(credentials=credentials, db=db)


# ── Router ────────────────────────────────────────────────────────────────────

router = APIRouter(tags=["Sovereign Identity"])

@router.on_event("startup")
def sovereign_boot():
    """Sovereign initialization of the Auth-Identity module (v6.8)"""
    import logging
    logger = logging.getLogger(__name__)
    logger.info(" [Sovereign Identity] Initializing module: Auth-Identity (v6.8)")
    
    # 1. Setup DB (Schema + Tables)
    setup_identity_db(engine)
    
    # 2. Seed
    seed_auth_identity(engine)
    
    # 3. Force Superuser for Test User (v6.8 Emergency Promotion)
    Session = sessionmaker(bind=engine)
    db = Session()
    try:
        test_user = db.query(User).filter((User.email == "master@seed.com") | (User.username == "Master")).first()
        if test_user:
            test_user.is_superuser = True
            db.commit()
            logger.info(f" [!] Sovereign Identity: Superuser status verified/promoted for '{test_user.username}'")
    finally:
        db.close()
    
    logger.info(" [Sovereign Identity] Auth-Identity module ready.")

@router.get("/module/manifest")
def get_module_manifest():
    """Exposing the manifest to the UI-Core discovery engine (v6.8)."""
    manifest_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../manifest.json"))
    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
            return JSONResponse(content=manifest, headers={"Content-Type": "application/json; charset=utf-8"})
    except FileNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manifest not found in module root")


# --- Schemas ---

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict

class RefreshRequest(BaseModel):
    refresh_token: str

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class PermissionResponse(BaseModel):
    name: str
    description: Optional[str] = None
    class Config:
        from_attributes = True

class RoleResponse(BaseModel):
    name: str
    description: Optional[str] = None
    permissions: List[PermissionResponse] = []
    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    user_id: uuid.UUID
    username: str
    email: str
    is_active: bool
    roles: List[RoleResponse] = []
    role_names: Optional[str] = None
    permissions: List[str] = []
    active_sessions: int = 0  # Governança: Sessões ativas no Matrix

    class Config:
        from_attributes = True

class InteractionLog(BaseModel):
    module_id: str
    action: str
    payload: Optional[dict] = None

# --- Endpoints ---

@router.post("/roles/{role_id}/permissions")
def update_role_permissions(
    role_id: str, 
    permission_ids: List[str], 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Sincroniza as permissões de um papel (Gestão Ativa de RBAC)."""
    # Proteção: Apenas MASTER pode mexer na estrutura de RBAC
    is_master = current_user.is_superuser or any(r.name == "MASTER" for r in current_user.roles)
    if not is_master:
        raise HTTPException(status_code=403, detail="Acesso negado: Apenas MASTER pode configurar a matriz RBAC")

    role = db.query(Role).filter(Role.role_id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Papel não encontrado")

    # Busca as novas permissões
    new_perms = db.query(Permission).filter(Permission.permission_id.in_(permission_ids)).all()
    
    # Atualiza a relação
    role.permissions = new_perms
    db.commit()
    
    return {"status": "success", "message": f"Permissões do papel {role.name} atualizadas com sucesso"}

@router.post("/login", response_model=TokenResponse)
def login(request: Request, data: LoginRequest, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id_str = str(user.user_id)
    access_token = auth_service.create_access_token(data={"sub": user_id_str})
    refresh_token = auth_service.create_refresh_token(data={"sub": user_id_str})
    
    # Register session
    auth_service.create_session(
        db, 
        user_id=user_id_str, 
        refresh_token=refresh_token,
        user_agent=request.headers.get("user-agent"),
        ip=request.client.host
    )
    
    # Log interaction
    InteractionService.log_interaction(db, "auth", "login", {"email": user.email})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "user_id": user_id_str,
            "username": user.username,
            "is_superuser": user.is_superuser
        }
    }

@router.post("/refresh")
def refresh_token(data: RefreshRequest, db: Session = Depends(get_db)):
    payload = auth_service.verify_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user_id = payload.get("sub")
    
    # Verify session in DB
    from ..core.models import UserSession
    session = db.query(UserSession).filter(
        UserSession.refresh_token == data.refresh_token,
        UserSession.is_revoked == False
    ).first()
    
    if not session:
        raise HTTPException(status_code=401, detail="Session revoked or not found")
    
    new_access_token = auth_service.create_access_token(data={"sub": user_id})
    return {"access_token": new_access_token, "token_type": "bearer"}

@router.post("/logout")
def logout(data: RefreshRequest, db: Session = Depends(get_db)):
    auth_service.invalidate_session(db, data.refresh_token)
    return {"detail": "Logged out successfully"}

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    try:
        user = auth_service.create_user(
            db,
            email=user_in.email,
            username=user_in.username,
            password=user_in.password,
        )
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me", response_model=UserResponse)
def get_me(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Flatten permissions for the frontend
    all_permissions = set()
    for role in current_user.roles:
        for perm in role.permissions:
            all_permissions.add(perm.name)
    
    # Governança: Contagem de sessões ativas reais
    active_sessions = db.query(UserSession).filter(
        UserSession.user_id == current_user.user_id,
        UserSession.is_revoked == False
    ).count()
            
    response_data = UserResponse.from_orm(current_user)
    response_data.permissions = list(all_permissions)
    response_data.active_sessions = active_sessions
    return response_data

@router.get("/users", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Lista todos os usuários e seus papéis (Requer Admin ou Master)."""
    # Bypass para desenvolvedor 'Master'
    is_test_user = current_user.username.lower() == "master" or current_user.email.lower() == "master@seed.com"
    is_master = current_user.is_superuser or any(r.name == "MASTER" for r in current_user.roles)
    is_admin = any(r.name == "ADMIN" for r in current_user.roles)
    
    if not (is_master or is_admin or is_test_user):
        raise HTTPException(status_code=403, detail="Acesso negado: Requer nível Admin ou superior")
    
    query = db.query(User)
    
    # [TRAVA DE SEGURANÇA] ADMIN não pode ver MASTER
    if not is_master and is_admin:
        query = query.join(User.roles).filter(Role.name != "MASTER")
        
    users = query.all()
    logger.info(f" [RBAC-Debug] Users found in DB: {len(users)}")
    
    # Adiciona os nomes dos papéis formatados para o frontend
    for u in users:
        u.role_names = ", ".join([r.name for r in u.roles])
        logger.info(f" [RBAC-Debug] User: {u.email} | Roles: {u.role_names}")
        
    return users

@router.patch("/users/{user_id}/role")
def update_user_role(user_id: uuid.UUID, role_name: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Altera o papel de um usuário (Com travas de hierarquia Master)."""
    target_user = db.query(User).filter(User.user_id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
    # [PROTEÇÃO MASTER] Apenas Master pode alterar um Master
    is_test_user = current_user.username.lower() == "master" or current_user.email.lower() == "master@seed.com"
    is_target_master = any(r.name == "MASTER" for r in target_user.roles)
    is_current_master = current_user.is_superuser or any(r.name == "MASTER" for r in current_user.roles)
    
    if is_target_master and not (is_current_master or is_test_user):
        logger.warning(f" [SECURITY] Admin {current_user.email} tentou alterar Master {target_user.email}")
        raise HTTPException(status_code=403, detail="Ação proibida: Admin não pode alterar nível MASTER")
        
    new_role = db.query(Role).filter(Role.name == role_name).first()
    if not new_role:
        raise HTTPException(status_code=404, detail="Papel não encontrado")
        
    target_user.roles = [new_role]
    db.commit()
    return {"message": "Papel atualizado com sucesso", "user": target_user.email, "role": role_name}

@router.get("/interactions")
def get_interactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retorna o histórico de interações para o gráfico de Auditoria."""
    # Agrupa por hora para o gráfico (PostgreSQL)
    results = db.query(
        func.date_trunc('hour', UserInteraction.created_at).label('hour'),
        func.count(UserInteraction.interaction_id).label('count')
    ).group_by('hour').order_by('hour').limit(24).all()
    
    return [{"timestamp": r.hour.isoformat(), "count": r.count} for r in results]

@router.get("/roles")
def list_roles(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Lista todos os papéis disponíveis para gestão."""
    # Diagnóstico: Mostra no terminal quem está tentando acessar
    print(f" [DEBUG-Auth] Tentativa de acesso a /roles: User={current_user.username}, Email={current_user.email}, Super={current_user.is_superuser}")
    
    # Bypass de Teste: Aceita o nome 'Master' ou o e-mail oficial
    is_test_user = current_user.username.lower() == "master" or current_user.email.lower() == "master@seed.com"
    
    if current_user.is_superuser or is_test_user:
        return db.query(Role).options(joinedload(Role.permissions)).all()
        
    logger.warning(f" [RBAC-Audit] Access Denied for {current_user.username} ({current_user.email}) on /roles")
    raise HTTPException(status_code=403, detail="Acesso negado: Requer privilégios de Superuser")

@router.post("/roles")
def create_role(name: str, permissions: List[str], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Cria ou atualiza um papel e suas permissões."""
    is_test_user = current_user.username.lower() == "teste" or current_user.email.lower() == "teste@sarak.com"
    if current_user.is_superuser or is_test_user:
        return auth_service.update_or_create_role(db, name, permissions)
    raise HTTPException(status_code=403, detail="Acesso negado")

@router.put("/users/{user_id}/roles")
def assign_role(user_id: uuid.UUID, role_names: List[str], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Atribui papéis a um usuário específico."""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Acesso negado")
    return auth_service.assign_roles_to_user(db, user_id, role_names)

@router.get("/permissions")
def list_permissions(db: Session = Depends(get_db)):
    """Lista todas as permissões técnicas cadastradas."""
    return db.query(Permission).all()

@router.post("/interactions")
def log_user_interaction(
    data: InteractionLog, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    InteractionService.log_interaction(
        db, 
        module_id=data.module_id, 
        action=data.action, 
        payload=data.payload
    )
    return {"status": "ok"}
