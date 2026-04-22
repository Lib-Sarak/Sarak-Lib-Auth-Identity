import logging
from sqlalchemy.engine import Engine

logger = logging.getLogger(__name__)

from sqlalchemy.orm import sessionmaker

def seed_auth_identity(engine: Engine):
    """Creates the official default test user in the Sarak Ecosystem."""
    from .models.database import User
    from sarak_auth_identity.core import auth_service
    
    # Cria uma sessão vinculada diretamente ao motor injetado pelo sistema (v5.5)
    Session = sessionmaker(bind=engine)
    db = Session()
    try:
        # Busca o usuário pelo e-mail oficial de teste (v6.8 Idempotency)
        test_user = auth_service.get_user_by_email(db, "usuario@teste.com")
        
        if not test_user:
            test_user = auth_service.create_user(
                db=db,
                email="usuario@teste.com",
                username="Sarak Test User",
                password="test1234"
            )
            db.commit()
            logger.info(f" [+] Auth-Identity (Seed): Usuário oficial de teste criado ({test_user.user_id})")
        else:
            logger.info(f" [-] Auth-Identity (Seed): Usuário oficial de teste já existe.")
    except Exception as e:
        db.rollback()
        logger.error(f" [!] Auth-Identity (Seed): Erro crítico ao criar usuário padrão: {e}")
    finally:
        db.close()
