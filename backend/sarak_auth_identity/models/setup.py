import logging
from sqlalchemy import text
from sqlalchemy.orm import Session
from .database import User

logger = logging.getLogger(__name__)

def setup_sarak_schemas(db: Session):
    """Garante que os schemas sarak_identity e sarak_llm existam"""
    try:
        db.execute(text("CREATE SCHEMA IF NOT EXISTS sarak_identity"))
        db.execute(text("CREATE SCHEMA IF NOT EXISTS sarak_llm"))
        db.commit()
        logger.info("Schemas Sarak validados com sucesso.")
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao criar schemas: {e}")

def seed_master_users(db: Session):
    """
    Semeia os usuários mestre (igorsarak@gmail.com e teste)
    Garante que as senhas estejam sempre sincronizadas com o hash atual.
    """
    from ..core.auth_service import get_user_by_email, get_user_by_username, get_password_hash
    
    master_users = [
        {"email": "igorsarak@gmail.com", "username": "IgorSarak", "password": "Sarak1234"},
        {"email": "teste@sarak.com", "username": "Teste", "password": "Sarak1234"},
        {"email": "usuario@teste.com", "username": "UsuarioTeste", "password": "test1234"}
    ]
    
    for user_data in master_users:
        # Busca por email ou username para evitar conflitos de unicidade
        existing = get_user_by_email(db, user_data["email"]) or get_user_by_username(db, user_data["username"])
        
        if not existing:
            new_user = User(
                email=user_data["email"],
                username=user_data["username"],
                password=get_password_hash(user_data["password"])
            )
            db.add(new_user)
            logger.info(f"Usuário mestre semeado: {user_data['email']}")
        else:
            # Força a atualização da senha para o hash atual (SHA256+Bcrypt)
            # e sincroniza email/username caso tenham mudado
            existing.password = get_password_hash(user_data["password"])
            existing.email = user_data["email"]
            existing.username = user_data["username"]
            logger.info(f"Usuário mestre sincronizado/atualizado: {user_data['email']}")
            
    db.commit()
