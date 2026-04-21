from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
import json
import os
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel, EmailStr
import uuid

from ..core import auth_service
from ..models.database import User

from ..database import get_db


async def get_current_user(
    credentials = Depends(auth_service.security),
    db: Session = Depends(get_db)
):
    """Implementação real de busca de usuário no schema ativo."""
    return await auth_service.get_current_user(credentials=credentials, db=db)


# ── Router ────────────────────────────────────────────────────────────────────

router = APIRouter(tags=["Identity"])

@router.get("/module/manifest")
def get_module_manifest():
    """Expondo o manifesto para o motor de descoberta do UI-Core (v5.5)."""
    manifest_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../manifest.json"))
    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
            return JSONResponse(content=manifest, headers={"Content-Type": "application/json; charset=utf-8"})
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Manifesto não encontrado na raiz do módulo")


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: Optional[str] = None
    username: Optional[str] = None


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    user_id: uuid.UUID
    username: str
    email: str
    is_active: bool

    class Config:
        from_attributes = True


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth_service.create_access_token(data={"sub": str(user.user_id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "user_id": str(user.user_id),
            "username": user.username,
        }
    }


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
def get_me(current_user: User = Depends(get_current_user)):
    """
    Retorna o perfil do usuário autenticado. Exige token válido.
    """
    return current_user


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user_info(user_id: str, db: Session = Depends(get_db)):
    """
    Rota M2M (Machine-to-Machine) para consulta de usuários.
    Sistemas que possuam apenas a string/UUID `user_id` podem consumir essa API REST 
    para resgatar dados do perfil original cadastrados na Auth-Identity.
    (Opcionalmente, pode-se exigir uma SystemApiKey no futuro).
    """
    user = auth_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    return user
