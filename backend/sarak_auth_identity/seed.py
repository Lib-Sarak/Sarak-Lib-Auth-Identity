import logging
from sqlalchemy.engine import Engine

logger = logging.getLogger(__name__)

def seed_auth_identity(engine: Engine):
    """Creates the official default test user in the Sarak Ecosystem."""
    # Local imports to avoid circular dependencies during initialization
    from sarak_shared.database import get_sarak_session
    from sarak_auth_identity.core import auth_service
    
    db = get_sarak_session(engine)
    try:
        test_user = auth_service.get_user_by_username(db, "usuario@teste.com")
        if not test_user:
            test_user = auth_service.create_user(
                db=db,
                email="usuario@teste.com",
                username="Sarak Test User",
                password="test1234"
            )
            db.commit()
            logger.info(f" [+] Auth-Identity (Seed): Usuário oficial de teste criado ({test_user.user_id})")
    except Exception as e:
        db.rollback()
        logger.error(f" [!] Auth-Identity (Seed): Erro crítico ao criar usuário padrão: {e}")
    finally:
        db.close()
