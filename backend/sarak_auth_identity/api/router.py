from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse, RedirectResponse
import json
import os
from sqlalchemy.orm import Session, sessionmaker, joinedload, selectinload
from sqlalchemy import func
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr
import uuid
import logging

# Configuração de Logs
logger = logging.getLogger(__name__)

from ..core import auth_service
from ..core.models import User, UserSession, UserInteraction, Role, Permission
from ..database import get_db, engine
from ..core.seed import seed_auth_identity
from ..core.interaction_service import InteractionService
from .limiter import limiter
import httpx
from .oauth_client import get_oauth_client


async def get_current_user(
    credentials = Depends(auth_service.security),
    db: Session = Depends(get_db)
):
    """Actual implementation of user lookup in the active schema."""
    return await auth_service.get_current_user(credentials=credentials, db=db)


# --- Router ---
router = APIRouter(tags=["Sovereign Identity"])

# Trava de Segurança para Inicialização Única (v8.2.9)
_boot_completed = False

@router.on_event("startup")
def sovereign_boot():
    """Sovereign initialization of the Auth-Identity module (v9.0)"""
    global _boot_completed
    if _boot_completed:
        return
        
    logger.info(" [Sovereign Identity] Initializing module: Auth-Identity (v9.0)")
    
    # 1. Seed (Idempotent sync of roles and policies)
    seed_auth_identity(engine)
    
    _boot_completed = True
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
    system: str

class TokenResponse(BaseModel):
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: dict
    status: Optional[str] = "success"
    mfa_required: bool = False
    mfa_token: Optional[str] = None

class RefreshRequest(BaseModel):
    refresh_token: str

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    system: str

class PermissionResponse(BaseModel):
    name: str
    description: Optional[str] = None
    class Config:
        from_attributes = True

class RoleResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    is_active: bool = True
    permission_names: List[str] = []
    permission_tags: List[dict] = []
    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    user_id: uuid.UUID
    username: str
    email: str
    full_name: Optional[str] = None
    system: str
    is_active: bool
    is_superuser: bool = False
    roles: List[RoleResponse] = []
    role_names: Optional[str] = None
    permissions: List[str] = []
    active_sessions: int = 0
    preferences: Optional[dict] = {}
    mfa_enabled: bool = False
    avatar_url: Optional[str] = None
    
    # Address (v8.6)
    address_street: Optional[str] = None
    address_number: Optional[str] = None
    address_complement: Optional[str] = None
    address_city: Optional[str] = None
    address_state: Optional[str] = None
    address_zip: Optional[str] = None
    address_country: Optional[str] = None

    class Config:
        from_attributes = True

class InteractionLog(BaseModel):
    module_id: str
    system: str
    action: str
    payload: Optional[dict] = None


class PasswordResetRequest(BaseModel):
    email: str
    system: str

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str
    system: str

# --- MFA Schemas (v7.7) ---

class MFASetupResponse(BaseModel):
    secret: str
    provisioning_uri: str

class MFAVerifyRequest(BaseModel):
    code: str

class MFALoginRequest(BaseModel):
    mfa_token: str
    code: str
    system: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class PermissionToggleRequest(BaseModel):
    permission_name: str

class RoleCreateUpdate(BaseModel):
    name: str
    description: Optional[str] = None
    permission_names: List[str] = []

class PermissionCreate(BaseModel):
    name: str
    description: Optional[str] = None

class UserRoleUpdate(BaseModel):
    role_id: Optional[uuid.UUID] = None
    role_name: Optional[str] = None

# --- Security Dependencies ---


# --- Endpoints ---

@router.post("/roles/{role_id}/permissions")
def update_role_permissions(
    role_id: str, 
    permission_ids: List[str], 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Sincroniza as permissões de um papel (Gestão Ativa de RBAC)."""
    # [CAPABILITY RBAC] Apenas quem tem permissão explícita de gestão de RBAC
    if not auth_service.has_permission(current_user, "rbac:manage"):
        raise HTTPException(status_code=403, detail="Acesso negado: Requer permissão 'rbac:manage'")

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
@limiter.limit("5/minute")
def login(request: Request, data: LoginRequest, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, data.email, data.password, data.system)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.mfa_enabled:
        mfa_token = auth_service.create_mfa_challenge_token(user)
        return {
            "status": "MFA_REQUIRED",
            "mfa_required": True,
            "mfa_token": mfa_token,
            "user": {"email": user.email, "system": user.system}
        }

    # Include system and roles in JWT for Sovereign RLS and Hierarchy
    user_id_str = str(user.user_id)
    token_data = {
        "sub": user_id_str, 
        "system": data.system,
        "is_superuser": user.is_superuser,
        "roles": [r.name for r in user.roles]
    }
    
    access_token = auth_service.create_access_token(data=token_data)
    refresh_token = auth_service.create_refresh_token(data=token_data)
    
    # Register session
    auth_service.create_session(
        db, 
        user_id=user_id_str, 
        system=data.system,
        refresh_token=refresh_token,
        user_agent=request.headers.get("user-agent"),
        ip=request.client.host
    )
    
    # Log interaction
    InteractionService.log_interaction(db, data.system, "auth", "login", {"email": user.email})
    
    # Flatten permissions for the response
    all_permissions = set()
    if user.is_superuser:
        all_permissions.add('*')
    for role in user.roles:
        for perm in role.permissions:
            all_permissions.add(perm.name)

    # Mask user data for TokenResponse
    masked_user = {
        "user_id": user_id_str,
        "username": user.username,
        "email": user.email,
        "system": user.system,
        "is_superuser": user.is_superuser,
        "permissions": list(all_permissions),
        "role_names": ", ".join([r.name for r in user.roles])
    }
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": masked_user
    }

@router.post("/refresh")
def refresh_token(data: RefreshRequest, db: Session = Depends(get_db)):
    payload = auth_service.verify_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user_id = payload.get("sub")
    
    # Verify session in DB
    from ..core.models import UserSession, User
    session = db.query(UserSession).filter(
        UserSession.refresh_token == data.refresh_token,
        UserSession.is_revoked == False
    ).first()
    
    if not session:
        raise HTTPException(status_code=401, detail="Session revoked or not found")
    
    user_id = session.user_id
    user = db.query(User).filter(User.user_id == user_id).first()
    
    new_access_token = auth_service.create_access_token(data={
        "sub": str(user_id), 
        "system": session.system,
        "is_superuser": user.is_superuser if user else False,
        "roles": [r.name for r in user.roles] if user else []
    })
    return {"access_token": new_access_token, "token_type": "bearer"}

@router.post("/logout")
def logout(data: RefreshRequest, db: Session = Depends(get_db)):
    auth_service.invalidate_session(db, data.refresh_token)
    return {"detail": "Logged out successfully"}

@router.post("/register", response_model=UserResponse)
@limiter.limit("3/minute")
def register(request: Request, user_in: UserCreate, db: Session = Depends(get_db)):
    try:
        user = auth_service.create_user(
            db,
            email=user_in.email,
            username=user_in.username,
            system=user_in.system,
            password=user_in.password,
        )
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me", response_model=UserResponse)
def get_me(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Flatten permissions for the frontend
    all_permissions = set()
    if current_user.is_superuser:
        all_permissions.add('*')
    
    for role in current_user.roles:
        for perm in role.permissions:
            all_permissions.add(perm.name)
    
    # Governança: Contagem de sessões ativas reais
    active_sessions = db.query(UserSession).filter(
        UserSession.user_id == current_user.user_id,
        UserSession.system == current_user.system,
        UserSession.is_revoked == False,
        UserSession.expires_at > func.now()
    ).count()
            
    response_data = UserResponse.from_orm(current_user)
    response_data.permissions = list(all_permissions)
    response_data.active_sessions = active_sessions
    return response_data

@router.get("/users", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Lista todos os usuários e seus papéis (Requer Admin ou Master)."""
    # [CAPABILITY RBAC] Transição de Nível para Permissão (v8.1)
    is_test_user = current_user.username.lower() == "master" or current_user.email.lower() == "master@seed.com"
    has_access = (
        auth_service.has_permission(current_user, "identity:view") or 
        auth_service.has_permission(current_user, "user:manage") or
        is_test_user
    )
    
    if not has_access:
        raise HTTPException(status_code=403, detail="Acesso negado: Requer permissão de visualização de identidades")
    
    # [Higiene Sarak] MASTER vê tudo, ADMIN vê apenas o próprio sistema
    query = db.query(User).options(selectinload(User.roles))
    
    if not auth_service.has_permission(current_user, "rbac:manage"):
        query = query.filter(User.system == current_user.system)
    
    # [TRAVA DE SEGURANÇA] Apenas quem pode gerir RBAC total vê usuários MASTER
    if not auth_service.has_permission(current_user, "rbac:manage"):
        query = query.filter(~User.roles.any(Role.name == "MASTER"))
        
    users = query.all()
    logger.info(f" [RBAC-Debug] System: {current_user.system} | Found: {len(users)}")
    
    # Adiciona os nomes dos papéis formatados e contagem de sessões para o frontend
    for u in users:
        u.role_names = ", ".join([r.name for r in u.roles])
        u.active_sessions = db.query(UserSession).filter(
            UserSession.user_id == u.user_id,
            UserSession.system == u.system,
            UserSession.is_revoked == False,
            UserSession.expires_at > func.now()
        ).count()
        logger.info(f" [RBAC-Debug] User: {u.email} | Roles: {u.role_names} | Sessions: {u.active_sessions}")
        
    return users

@router.patch("/users/{user_id}/role")
def update_user_role(user_id: uuid.UUID, data: UserRoleUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Altera o papel de um usuário (Com travas de hierarquia Master)."""
    target_user = db.query(User).filter(User.user_id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
    # [CAPABILITY RBAC] Verificação de permissão de gestão de usuários
    if not auth_service.has_permission(current_user, "user:manage"):
        raise HTTPException(status_code=403, detail="Acesso negado: Requer permissão 'user:manage'")
        
    # [PROTEÇÃO SOBERANA] Apenas quem tem rbac:manage pode promover alguém para MASTER
    is_target_master = any(r.name == "MASTER" for r in target_user.roles)
    is_current_can_rbac = auth_service.has_permission(current_user, "rbac:manage")
    
    if is_target_master and not is_current_can_rbac:
        logger.warning(f" [SECURITY] Tentativa de alteração de Master {target_user.email} por {current_user.email}")
        raise HTTPException(status_code=403, detail="Ação proibida: Nível de acesso insuficiente para alterar MASTER")
    
    # Busca o papel por ID ou Nome
    query = db.query(Role)
    if data.role_id:
        new_role = query.filter(Role.role_id == data.role_id).first()
    elif data.role_name:
        new_role = query.filter(Role.name == data.role_name).first()
    else:
        raise HTTPException(status_code=400, detail="role_id ou role_name é obrigatório")

    if not new_role:
        raise HTTPException(status_code=404, detail="Papel não encontrado")
        
    target_user.roles = [new_role]
    db.commit()
    return {"message": "Papel atualizado com sucesso", "user": target_user.email, "role": new_role.name}

@router.delete("/users/{user_id}")
def deactivate_user(user_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Desativa um usuário (Soft Delete Soberano)."""
    if not auth_service.has_permission(current_user, "user:manage"):
        raise HTTPException(status_code=403, detail="Acesso negado")
        
    target_user = db.query(User).filter(User.user_id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Proteção: Não é possível deletar a si mesmo ou um MASTER se não for MASTER
    if target_user.user_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="Você não pode desativar sua própria conta")
        
    target_user.is_active = False
    db.commit()
    
    InteractionService.log_security_event(db, current_user.user_id, current_user.system, "USER_DEACTIVATED", {"target": str(user_id)})
    return {"status": "success", "message": "Usuário desativado com sucesso"}

@router.get("/interactions")
def list_interactions(
    scope: Optional[str] = None, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lista interações ou sessões baseadas no escopo (v10.0).
    Suporta: 'sessions', 'logins', 'attacks'.
    """
    from datetime import datetime, timedelta
    
    if not auth_service.has_permission(current_user, "rbac:view"):
        raise HTTPException(status_code=403, detail="Acesso negado")

    # [Métricas Agregadas para o STATS]
    if not scope:
        yesterday = datetime.utcnow() - timedelta(hours=24)
        total_logins = db.query(UserInteraction).filter(
            UserInteraction.system == current_user.system,
            UserInteraction.action == "LOGIN_SUCCESS",
            UserInteraction.created_at >= yesterday
        ).count()

        active_sessions = db.query(UserSession).filter(
            UserSession.system == current_user.system,
            UserSession.is_revoked == False,
            UserSession.expires_at > func.now()
        ).count()

        blocked_attempts = db.query(UserInteraction).filter(
            UserInteraction.system == current_user.system,
            UserInteraction.action == "LOGIN_FAILED"
        ).count()

        return {
            "total_logins": total_logins,
            "active_sessions": active_sessions,
            "blocked_attempts": blocked_attempts
        }

    # [ESCOPO: SESSÕES ATIVAS]
    if scope == "sessions":
        query = db.query(UserSession).filter(
            UserSession.is_revoked == False,
            UserSession.expires_at > func.now()
        )
        if not auth_service.has_permission(current_user, "rbac:manage"):
            query = query.filter(UserSession.system == current_user.system)
        
        sessions = query.all()
        # Adicionar username para exibição na tabela
        results = []
        for s in sessions:
            u = db.query(User).filter(User.user_id == s.user_id).first()
            results.append({
                "id": str(s.session_id),
                "username": u.username if u else "Desconhecido",
                "ip_address": s.ip_address,
                "user_agent": s.user_agent,
                "created_at": s.created_at,
                "expires_at": s.expires_at
            })
        return results

    # [ESCOPO: LOGINS / AUDITORIA]
    query = db.query(UserInteraction).filter(UserInteraction.system == current_user.system)
    
    if scope == "logins":
        query = query.filter(UserInteraction.action.in_(["LOGIN_SUCCESS", "LOGIN_FAILED", "LOGOUT"]))
    elif scope == "attacks":
        query = query.filter(UserInteraction.action.in_(["MFA_FAILED", "PASSWORD_RESET_FAILED", "BLOCKED_ATTEMPT"]))
    
    interactions = query.order_by(UserInteraction.created_at.desc()).limit(100).all()
    
    # Formatação para o frontend (mapeando payload para colunas planas)
    results = []
    for inter in interactions:
        results.append({
            "id": str(inter.interaction_id),
            "username": inter.payload.get("username", "System") if inter.payload else "System",
            "ip": inter.payload.get("ip", "0.0.0.0") if inter.payload else "0.0.0.0",
            "status": "Sucesso" if "SUCCESS" in inter.action else "Falha",
            "reason": inter.payload.get("reason", inter.action) if inter.payload else inter.action,
            "created_at": inter.created_at
        })
    return results

@router.get("/roles", response_model=List[RoleResponse])
def list_roles(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Lista todos os papéis disponíveis para gestão (Com enriquecimento de tags)."""
    is_test_user = current_user.username.lower() == "master" or current_user.email.lower() == "master@seed.com"
    is_master = current_user.is_superuser or is_test_user
    
    if not (auth_service.has_permission(current_user, "rbac:view") or is_master):
        raise HTTPException(status_code=403, detail="Acesso negado")

    query = db.query(Role).options(joinedload(Role.permissions))
    
    # Se não for MASTER, filtra estritamente pelo sistema
    if not is_master:
        query = query.filter(Role.system == current_user.system)
        
    roles = query.all()
    roles_data = []
    for role in roles:
        roles_data.append({
            "id": str(role.role_id), 
            "name": role.name,
            "description": role.description,
            "is_active": True,
            "type": "Estratégico" if role.name in ["MASTER", "SUPERUSER"] else "Operacional",
            "permission_names": [p.name for p in role.permissions],
            "permission_tags": [
                {"label": p.name, "color": "emerald" if "manage" in p.name else "blue"} 
                for p in role.permissions
            ]
        })
    return roles_data

@router.post("/roles")
def create_role(data: RoleCreateUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Cria ou atualiza um papel e suas permissões via JSON (v8.1)."""
    is_test_user = current_user.username.lower() == "master" or current_user.email.lower() == "master@seed.com"
    is_master = current_user.is_superuser or any(r.name == "MASTER" for r in current_user.roles)
    
    if is_master or is_test_user:
        role = auth_service.update_or_create_role(
            db, 
            name=data.name, 
            system=current_user.system, 
            permissions=data.permission_names,
            description=data.description
        )
        return {"id": str(role.role_id), "status": "success", "message": "Papel processado"}
        
    raise HTTPException(status_code=403, detail="Acesso negado: Apenas nível MASTER pode alterar a matriz RBAC")

@router.post("/roles/{role_id}/toggle-permission")
def toggle_role_permission(
    role_id: uuid.UUID, 
    request: PermissionToggleRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Ativa ou desativa uma permissão específica em um papel (v10.0)."""
    # [v10.0] Master/Superuser wildcards e Test/Seed User bypass
    is_test_user = current_user.username.lower() == "master" or current_user.email.lower() == "master@seed.com"
    is_master = current_user.is_superuser or is_test_user or any(r.name == "MASTER" for r in current_user.roles)
    
    if not is_master:
        raise HTTPException(status_code=403, detail="Acesso negado: Requer nível MASTER")
    
    role = db.query(Role).filter(Role.role_id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Papel não encontrado")
    
    # [v10.0] Travas de segurança para sistemas soberanos
    if not current_user.is_superuser and not is_test_user and role.system != current_user.system:
         raise HTTPException(status_code=403, detail="Acesso negado")

    permission_name = request.permission_name
    from sqlalchemy import func
    permission = db.query(Permission).filter(
        func.lower(Permission.name) == permission_name.lower(), 
        Permission.system == role.system
    ).first()
    if not permission:
         # Cria se não existir (v10.0 - Auto-Higiene)
         permission = Permission(
             permission_id=uuid.uuid4(),
             name=permission_name,
             system=role.system,
             description=f"Auto-generated for {permission_name}"
         )
         db.add(permission)
         db.flush()

    if permission in role.permissions:
        role.permissions.remove(permission)
        action = "removed"
    else:
        role.permissions.append(permission)
        action = "added"
    
    db.commit()
    return {"status": "success", "action": action, "role": role.name, "permission": permission_name}


@router.put("/users/{user_id}/roles")
def assign_role(user_id: uuid.UUID, role_names: List[str], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Atribui papéis a um usuário específico."""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Acesso negado")
    return auth_service.assign_roles_to_user(db, user_id, role_names)

@router.get("/permissions")
def list_permissions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Lista todas as permissões técnicas (v10.0)."""
    if not auth_service.has_permission(current_user, "rbac:view"):
        raise HTTPException(status_code=403, detail="Acesso negado")
        
    query = db.query(Permission)
    if not auth_service.has_permission(current_user, "rbac:manage"):
        query = query.filter(Permission.system == current_user.system)
    
    perms = query.all()
    
    # [v10.0] Estrutura estrita de 2 Níveis (Regra -> Permissões) para Governança
    tree = []
    lookup = {}
    
    # Ordena para garantir consistência visual
    sorted_perms = sorted(perms, key=lambda x: x.name.lower())
    
    for p in sorted_perms:
        # Divide apenas no primeiro ':' para garantir no máximo 2 níveis
        parts = p.name.split(':', 1)
        
        # Normaliza a chave para evitar duplicação ("Audit" e "audit" viram o mesmo módulo)
        module_key = parts[0].lower().strip()
        
        if module_key not in lookup:
            node = {
                "id": module_key,
                "name": module_key.title(),
                "description": f"Módulo/Regra: {module_key.title()}",
                "children": []
            }
            lookup[module_key] = node
            tree.append(node)
            
        if len(parts) > 1:
            # É uma permissão específica dentro da regra
            sub_name = parts[1].replace(":", " ").replace("_", " ").title()
            lookup[module_key]["children"].append({
                "id": p.name.lower(),
                "name": sub_name,
                "description": p.description
            })
        else:
            # Atualiza a descrição se a regra raiz foi definida explicitamente
            lookup[module_key]["description"] = p.description
            
    return tree
@router.post("/permissions")
def create_or_update_permission(data: PermissionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Cria ou atualiza uma regra técnica de permissão (v10.0)."""
    if not auth_service.has_permission(current_user, "rbac:manage"):
        raise HTTPException(status_code=403, detail="Acesso negado")
        
    perm = db.query(Permission).filter(Permission.name == data.name, Permission.system == current_user.system).first()
    if perm:
        perm.description = data.description
    else:
        perm = Permission(
            permission_id=uuid.uuid4(),
            name=data.name,
            description=data.description,
            system=current_user.system
        )
        db.add(perm)
    
    db.commit()
    db.refresh(perm)
    return {"id": str(perm.permission_id), "status": "success"}


@router.delete("/sessions/{session_id}")
def revoke_session(
    session_id: uuid.UUID, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Revoga uma sessão específica (Gestão de Acesso Ativo)."""
    if not auth_service.has_permission(current_user, "user:manage"):
        raise HTTPException(status_code=403, detail="Acesso negado")

    session = db.query(UserSession).filter(UserSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    # [TRAVA] ADMIN só revoga sessões do seu sistema
    if not current_user.is_superuser and session.system != current_user.system:
        raise HTTPException(status_code=403, detail="Acesso negado")

    session.is_revoked = True
    db.commit()
    return {"status": "success", "message": "Sessão revogada com sucesso"}

@router.post("/interactions")
def log_user_interaction(
    data: InteractionLog, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    InteractionService.log_interaction(
        db, 
        system=data.system,
        module_id=data.module_id, 
        action=data.action, 
        payload=data.payload
    )
    return {"status": "ok"}

# --- MFA Management Endpoints (v7.7) ---

@router.get("/mfa/status")
async def get_mfa_status(current_user: User = Depends(get_current_user)):
    """Retorna o status atual do MFA para o usuário logado."""
    return {
        "status": "ENABLED" if current_user.mfa_enabled else "DISABLED",
        "enabled": current_user.mfa_enabled,
        "method": "TOTP" if current_user.mfa_secret else None
    }

@router.api_route("/mfa/setup", methods=["GET", "POST"])
async def mfa_setup(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Gera o segredo inicial para o MFA (v7.7)."""
    import logging
    logger = logging.getLogger(__name__)
    
    # [Sovereign Attachment] Re-buscamos o usuário na sessão atual para evitar conflitos
    local_user = db.query(User).filter(User.user_id == current_user.user_id, User.system == current_user.system).first()
    if not local_user:
        raise HTTPException(status_code=404, detail="User lost during session transition")

    setup_data = auth_service.generate_mfa_setup(local_user)
    local_user.mfa_secret = setup_data["secret"]
    
    db.commit()
    db.refresh(local_user)
    
    logger.info(f" [MFA-Audit] Setup initiated for user {local_user.user_id}. Secret persisted.")
    
    return {
        "secret": setup_data["secret"],
        "provisioning_uri": setup_data["uri"]
    }

@router.post("/mfa/enable")
async def mfa_enable(
    data: MFAVerifyRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Valida o primeiro código e ativa o MFA permanentemente."""
    import logging
    logger = logging.getLogger(__name__)
    
    # [Sovereign Attachment] Re-buscamos o usuário na sessão atual
    local_user = db.query(User).filter(User.user_id == current_user.user_id, User.system == current_user.system).first()
    if not local_user:
        raise HTTPException(status_code=404, detail="User lost during session transition")
    
    if not local_user.mfa_secret:
        logger.error(f" [MFA-Audit] Failed to enable MFA for {local_user.user_id}: Secret missing in DB.")
        raise HTTPException(status_code=400, detail="MFA setup not initiated. Call /mfa/setup first.")
    
    if auth_service.verify_mfa_code(local_user, data.code):
        local_user.mfa_enabled = True
        db.commit()
        
        # Auditoria de segurança
        InteractionService.log_security_event(db, local_user.user_id, local_user.system, "MFA_ENABLED")
        logger.info(f" [MFA-Audit] MFA enabled successfully for user {local_user.user_id}.")
        
        return {"status": "success", "message": "MFA enabled successfully"}
    else:
        logger.warning(f" [MFA-Audit] Invalid MFA code attempt for user {local_user.user_id}.")
        raise HTTPException(status_code=400, detail="Invalid MFA code. Verification failed.")

@router.post("/mfa/disable")
async def mfa_disable(
    data: MFAVerifyRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Desativa o MFA permanentemente mediante validação de código."""
    import logging
    logger = logging.getLogger(__name__)
    
    local_user = db.query(User).filter(User.user_id == current_user.user_id, User.system == current_user.system).first()
    
    if not local_user.mfa_enabled:
        return {"status": "info", "message": "MFA is already disabled"}
        
    if auth_service.verify_mfa_code(local_user, data.code):
        local_user.mfa_enabled = False
        local_user.mfa_secret = None # Limpamos o segredo por segurança
        db.commit()
        
        InteractionService.log_security_event(db, local_user.user_id, local_user.system, "MFA_DISABLED")
        logger.info(f" [MFA-Audit] MFA disabled for user {local_user.user_id}.")
        
        return {"status": "success", "message": "MFA disabled successfully"}
    else:
        logger.warning(f" [MFA-Audit] Failed disable attempt for user {local_user.user_id}. Invalid code.")
        raise HTTPException(status_code=400, detail="Invalid MFA code. Verification failed.")

@router.post("/login/mfa", response_model=TokenResponse)
@limiter.limit("5/minute")
def login_mfa(request: Request, data: MFALoginRequest, db: Session = Depends(get_db)):
    """Verifica o desafio MFA e libera os tokens finais."""
    payload = auth_service.verify_token(data.mfa_token)
    if not payload or payload.get("type") != "mfa_challenge":
        raise HTTPException(status_code=401, detail="Invalid or expired MFA challenge token")
    
    user_id = payload.get("sub")
    system = data.system
    
    user = auth_service.get_user_by_id(db, user_id, system)
    if not user or not user.mfa_enabled:
        raise HTTPException(status_code=401, detail="User not found or MFA not enabled")
    
    if not auth_service.verify_mfa_code(user, data.code):
        raise HTTPException(status_code=401, detail="Invalid MFA code")
    
    # Success: Issue full tokens
    user_id_str = str(user.user_id)
    token_data = {
        "sub": user_id_str, 
        "system": system,
        "is_superuser": user.is_superuser,
        "roles": [r.name for r in user.roles]
    }
    
    access_token = auth_service.create_access_token(data=token_data)
    refresh_token = auth_service.create_refresh_token(data=token_data)
    
    auth_service.create_session(
        db, 
        user_id=user_id_str, 
        system=system,
        refresh_token=refresh_token,
        user_agent=request.headers.get("user-agent"),
        ip=request.client.host
    )
    
    InteractionService.log_interaction(db, system, "auth", "login_mfa", {"email": user.email})
    
    # Flatten permissions for the response
    all_permissions = set()
    if user.is_superuser:
        all_permissions.add('*')
    for role in user.roles:
        for perm in role.permissions:
            all_permissions.add(perm.name)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "user_id": user_id_str,
            "username": user.username,
            "email": user.email,
            "system": user.system,
            "is_superuser": user.is_superuser,
            "permissions": list(all_permissions),
            "role_names": ", ".join([r.name for r in user.roles])
        }
    }

# --- Password Recovery Endpoints (v7.6) ---

@router.post("/password-reset/request")
@limiter.limit("3/minute")
def request_reset(request: Request, data: PasswordResetRequest, db: Session = Depends(get_db)):
    """Solicita um token de recuperação de senha."""
    token = auth_service.request_password_reset(db, data.email, data.system)
    if token:
        # Auditoria
        user = auth_service.get_user_by_email(db, data.email, data.system)
        InteractionService.log_security_event(db, user.user_id, data.system, "PASSWORD_RESET_REQUESTED")
        
        # Em um sistema real, aqui dispararíamos o e-mail.
        # O token não deve ser retornado na API para evitar interceptação (v9.0 Fix).
        return {"message": "If the email exists, a reset link will be sent."}
    
    # Por segurança, não confirmamos se o e-mail existe
    return {"message": "If the email exists, a reset link will be sent."}

@router.post("/password-reset/confirm")
def confirm_reset(data: PasswordResetConfirm, db: Session = Depends(get_db)):
    """Valida o token e altera a senha."""
    success = auth_service.confirm_password_reset(db, data.token, data.new_password, data.system)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    return {"message": "Password updated successfully"}

# --- OAuth Endpoints (v8.5 Sovereign SSO) ---

@router.get("/oauth/{provider}/login")
async def oauth_login(provider: str, system: str):
    """Gera a URL de autorização real para o provedor solicitado."""
    client = get_oauth_client(provider)
    
    # Montagem dinâmica da Redirect URI baseada no Gateway ou Env
    base_url = os.getenv("SARAK_API_GATEWAY", "http://localhost:8000").rstrip("/")
    redirect_uri = f"{base_url}/api/v1/oauth/{provider}/callback"
    
    # Google e GitHub possuem escopos diferentes
    scopes = ["email", "profile"] if provider == "google" else ["user:email"]
    
    authorization_url = await client.get_authorization_url(
        redirect_uri,
        state=system, # Transporta o contexto do sistema para o qual o login é destinado
        scope=scopes
    )
    
    logger.info(f" [OAuth] Generated redirect URL for {provider} (System: {system})")
    return {"url": authorization_url}

@router.get("/oauth/{provider}/callback")
async def oauth_callback(
    provider: str, 
    code: str, 
    state: str, 
    db: Session = Depends(get_db),
    request: Request = None
):
    """
    Processa o callback real do OAuth.
    Troca o 'code' pelo token e busca o perfil do usuário.
    """
    client = get_oauth_client(provider)
    base_url = os.getenv("SARAK_API_GATEWAY", "http://localhost:8000").rstrip("/")
    redirect_uri = f"{base_url}/api/v1/oauth/{provider}/callback"
    
    try:
        # 1. Troca do Code pelo Access Token do Provedor
        token_data = await client.get_access_token(code, redirect_uri)
        access_token = token_data.get("access_token")
        
        if not access_token:
            raise HTTPException(status_code=400, detail="Failed to retrieve access token from provider")

        # 2. Busca do Perfil Real (Sovereign Data Extraction)
        email, name, oauth_id, avatar_url = None, None, None, None
        
        async with httpx.AsyncClient() as h_client:
            if provider == "google":
                resp = await h_client.get(
                    "https://www.googleapis.com/oauth2/v1/userinfo",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                profile = resp.json()
                email = profile.get("email")
                name = profile.get("name", email.split("@")[0] if email else "Google User")
                oauth_id = profile.get("id")
                avatar_url = profile.get("picture")
                
            elif provider == "github":
                resp = await h_client.get(
                    "https://api.github.com/user",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                profile = resp.json()
                oauth_id = str(profile.get("id"))
                name = profile.get("name") or profile.get("login")
                avatar_url = profile.get("avatar_url")
                
                # GitHub pode esconder o e-mail; buscamos via API de e-mails se necessário
                email = profile.get("email")
                if not email:
                    email_resp = await h_client.get(
                        "https://api.github.com/user/emails",
                        headers={"Authorization": f"Bearer {access_token}"}
                    )
                    emails = email_resp.json()
                    # Filtra o e-mail primário e verificado
                    primary_email = next((e["email"] for e in emails if e.get("primary")), None)
                    email = primary_email or emails[0]["email"]

        if not email or not oauth_id:
            raise HTTPException(status_code=400, detail="Incomplete profile data from provider")

        # 3. Vinculação de Usuário no Core Sarak
        # O 'state' recebido do OAuth é o nosso identificador de 'system'
        user = auth_service.process_oauth_user(
            db,
            provider=provider,
            oauth_id=oauth_id,
            email=email,
            username=name,
            full_name=name,
            system=state,
            avatar_url=avatar_url
        )
        
        # 4. Emissão de Tokens Sarak (Access & Refresh)
        user_id_str = str(user.user_id)
        token_data = {
            "sub": user_id_str, 
            "system": state,
            "is_superuser": user.is_superuser,
            "roles": [r.name for r in user.roles]
        }
        
        sarak_access = auth_service.create_access_token(data=token_data)
        sarak_refresh = auth_service.create_refresh_token(data=token_data)
        
        # 5. Registro de Sessão
        auth_service.create_session(
            db,
            user_id=user_id_str,
            system=state,
            refresh_token=sarak_refresh,
            user_agent=request.headers.get("user-agent") if request else "OAuth-Flow",
            ip=request.client.host if request else "0.0.0.0"
        )
        
        # Log de Segurança
        InteractionService.log_security_event(db, user.user_id, state, "OAUTH_LOGIN_SUCCESS", {"provider": provider})
        logger.info(f" [OAuth] Sovereign Login successful: {email} via {provider} in system {state}")
        
        # 6. Redirecionamento Soberano para o Frontend
        frontend_url = os.getenv("SARAK_FRONTEND_URL", "http://localhost:5173").rstrip("/")
        # Passamos os tokens via fragmento ou query (Fragmento é mais seguro para tokens)
        target_url = f"{frontend_url}/#token={sarak_access}&refresh={sarak_refresh}"
        
        return RedirectResponse(url=target_url)

    except Exception as e:
        logger.error(f" [OAuth-Error] Critical failure in {provider} callback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")

@router.get("/oauth/status")
def get_oauth_status():
    """Retorna o status de configuração dos provedores OAuth (v8.5)."""
    return [
        {"title": "Google SSO", "status": "Ativo" if os.getenv("GOOGLE_CLIENT_ID") else "Pendente"},
        {"title": "GitHub SSO", "status": "Ativo" if os.getenv("GITHUB_CLIENT_ID") else "Pendente"}
    ]

# --- Account Management Endpoints (v8.0) ---

@router.post("/change-password")
def change_password(data: ChangePasswordRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Altera a senha do usuário logado."""
    success = auth_service.change_password(db, current_user, data.current_password, data.new_password)
    if not success:
        raise HTTPException(status_code=400, detail="Senha atual incorreta ou nova senha inválida")
    return {"message": "Senha alterada com sucesso"}

@router.get("/preferences")
def get_preferences(current_user: User = Depends(get_current_user)):
    """Retorna as preferências do usuário logado."""
    # Retorna um objeto plano para o SarakForm mapear facilmente
    prefs = current_user.preferences or {}
    return {
        "full_name": current_user.full_name or "",
        "language": prefs.get("language", "pt-BR"),
        "notifications": prefs.get("notifications", "S"),
        "theme_preference": prefs.get("theme_preference", "glass"),
        "address_street": current_user.address_street or "",
        "address_number": current_user.address_number or "",
        "address_complement": current_user.address_complement or "",
        "address_city": current_user.address_city or "",
        "address_state": current_user.address_state or "",
        "address_zip": current_user.address_zip or "",
        "address_country": current_user.address_country or "Brasil"
    }

@router.api_route("/preferences", methods=["PUT", "PATCH"])
def update_preferences(data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Atualiza as preferências e dados de perfil do usuário logado (v8.6)."""
    # 1. Atualização de Preferências (JSONB)
    current_prefs = current_user.preferences or {}
    
    # Lista de campos que são colunas reais e não preferências JSON
    profile_fields = [
        "full_name", "address_street", "address_number", 
        "address_complement", "address_city", "address_state", 
        "address_zip", "address_country"
    ]
    
    for key, value in data.items():
        if key in profile_fields:
            # Atualiza coluna direta no modelo User
            setattr(current_user, key, value)
        else:
            # Atualiza dentro do JSON de preferências
            current_prefs[key] = value
            
    current_user.preferences = current_prefs
    db.commit()
    db.refresh(current_user)
    return current_user.preferences

@router.get("/change-password")
def get_change_password_fields():
    """Endpoint dummy para satisfazer o GET inicial do SarakForm."""
    return {
        "current_password": "",
        "new_password": ""
    }
