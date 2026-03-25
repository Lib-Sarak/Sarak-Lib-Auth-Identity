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
    Preservando a lógica de não duplicar se já existirem.
    """
    from ..core.auth_service import get_user_by_email, get_password_hash
    
    master_users = [
        {"email": "igorsarak@gmail.com", "username": "IgorSarak", "password": "Sarak1234"},
        {"email": "teste@sarak.com", "username": "Teste", "password": "Sarak1234"},
        {"email": "usuario@teste.com", "username": "UsuarioTeste", "password": "test1234"}
    ]
    
    for user_data in master_users:
        existing = get_user_by_email(db, user_data["email"])
        if not existing:
            new_user = User(
                email=user_data["email"],
                username=user_data["username"],
                password=get_password_hash(user_data["password"])
            )
            db.add(new_user)
            logger.info(f"Usuário mestre semeado: {user_data['email']}")
        else:
            logger.info(f"Usuário mestre já existe: {user_data['email']}")
            
    db.commit()
