import logging
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

logger = logging.getLogger(__name__)

def seed_auth_identity(engine: Engine):
    """
    Seeds master users and essential schemas for the Sarak Ecosystem.
    Ensures idempotency and security standards (v6.8).
    """
    from .models import User
    from . import auth_service
    
    # 1. Ensure schemas exist (Safety check for cross-module dependencies)
    try:
        with engine.connect() as conn:
            conn.execute(text("CREATE SCHEMA IF NOT EXISTS sarak_auth"))
            conn.execute(text("CREATE SCHEMA IF NOT EXISTS sarak_llm"))
            conn.commit()
    except Exception as e:
        logger.warning(f" [!] Auth-Seed: Schema validation warning (ignoring if exists): {e}")

    # 2. Seed Master Users
    Session = sessionmaker(bind=engine)
    db = Session()
    try:
        master_users = [
            {"email": "igorsarak@gmail.com", "username": "IgorSarak", "password": "Sarak1234"},
            {"email": "teste@sarak.com", "username": "Teste", "password": "Sarak1234"},
            {"email": "usuario@teste.com", "username": "UsuarioTeste", "password": "test1234"}
        ]
        
        for user_data in master_users:
            # Check by email or username to ensure uniqueness
            existing = auth_service.get_user_by_email(db, user_data["email"]) or \
                       auth_service.get_user_by_username(db, user_data["username"])
            
            if not existing:
                new_user = User(
                    email=user_data["email"],
                    username=user_data["username"],
                    password=auth_service.get_password_hash(user_data["password"])
                )
                db.add(new_user)
                db.flush()
                logger.info(f" [+] Auth-Seed: Master user created: {user_data['email']}")
            else:
                # Sync existing users (Ensures password hashes are up to date)
                existing.password = auth_service.get_password_hash(user_data["password"])
                existing.email = user_data["email"]
                existing.username = user_data["username"]
                logger.info(f" [-] Auth-Seed: Master user synced: {user_data['email']}")
                
        db.commit()
        logger.info(" [OK] Auth-Identity seeding completed successfully.")
    except Exception as e:
        db.rollback()
        logger.error(f" [!] Auth-Seed: Critical error during seeding: {e}")
    finally:
        db.close()
