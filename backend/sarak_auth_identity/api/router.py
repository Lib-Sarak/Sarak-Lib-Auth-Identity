from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
import json
import os
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel, EmailStr
import uuid

from ..core import auth_service
from ..core.models import User
from ..database import get_db, engine, setup_identity_db
from ..core.seed import seed_auth_identity


async def get_current_user(
    credentials = Depends(auth_service.security),
    db: Session = Depends(get_db)
):
    """Actual implementation of user lookup in the active schema."""
    return await auth_service.get_current_user(credentials=credentials, db=db)


# ── Router ────────────────────────────────────────────────────────────────────

router = APIRouter(tags=["Identity"])

@router.on_event("startup")
def sovereign_boot():
    """Sovereign initialization of the Auth-Identity module (v5.5)"""
    import logging
    logger = logging.getLogger(__name__)
    logger.info(" [Sarak OS] Initializing module: Auth-Identity (Sovereign)")
    
    # 1. Setup DB (Schema + Tables)
    setup_identity_db(engine)
    
    # 2. Seed
    seed_auth_identity(engine)
    
    logger.info(" [Sarak OS] Auth-Identity module ready.")

@router.get("/module/manifest")
def get_module_manifest():
    """Exposing the manifest to the UI-Core discovery engine (v5.5)."""
    manifest_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../manifest.json"))
    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
            return JSONResponse(content=manifest, headers={"Content-Type": "application/json; charset=utf-8"})
    except FileNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manifest not found in module root")


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
            detail="Invalid credentials",
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
    Returns the authenticated user's profile. Requires a valid token.
    """
    return current_user


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user_info(user_id: str, db: Session = Depends(get_db)):
    """
    M2M (Machine-to-Machine) route for user lookup.
    Systems that only have the string/UUID `user_id` can consume this REST API 
    to retrieve original profile data registered in Auth-Identity.
    (Optionally, a SystemApiKey can be required in the future).
    """
    user = auth_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user
