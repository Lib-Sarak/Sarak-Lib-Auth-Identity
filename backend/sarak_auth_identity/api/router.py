from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, EmailStr

from ..core import auth_service
from ..models.database import User

# Esta dependência deve ser sobrescrita pela aplicação que importa a Lib
# Ex: app.dependency_overrides[get_db] = my_db_session
def get_db():
    yield None

router = APIRouter(tags=["Identity"])

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    is_active: bool

    class Config:
        from_attributes = True

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, data.username, data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth_service.create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    try:
        user = auth_service.create_user(
            db, 
            email=user_in.email, 
            username=user_in.username, 
            password=user_in.password
        )
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(auth_service.get_current_user)):
    return current_user
