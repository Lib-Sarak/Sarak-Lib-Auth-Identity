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

    # 2. Seed Master Data (RBAC & Users)
    Session = sessionmaker(bind=engine)
    db = Session()
    try:
        from .models import Role, Permission
        
        # 2a. Seed Permissions
        permissions_data = [
            {"name": "identity:view", "description": "Ver perfis e sessões (Leitura)"},
            {"name": "user:manage", "description": "Gestão de usuários (Criar/Editar/Senhas)"},
            {"name": "rbac:manage", "description": "Configuração total de regras RBAC"},
            {"name": "rbac:view", "description": "Visualizar matriz de permissões"},
            {"name": "audit:view", "description": "Ver logs e interações"},
            {"name": "audit:full", "description": "Controle total de auditoria e sessões"},
            {"name": "system:settings", "description": "Alterar configurações globais"},
            {"name": "content:manage", "description": "Gerenciar fluxos e dados de negócio"},
            {"name": "service:edit", "description": "Configurar parâmetros operacionais"},
            {"name": "service:execute", "description": "Execução básica de serviços"}
        ]
        
        perms = {}
        for p_data in permissions_data:
            p = db.query(Permission).filter(Permission.name == p_data["name"]).first()
            if not p:
                p = Permission(**p_data)
                db.add(p)
                db.flush()
            perms[p_data["name"]] = p

        # 2b. Seed Roles (5 Levels)
        roles_config = [
            {
                "name": "MASTER", 
                "description": "Controle total do ecossistema", 
                "perms": [p["name"] for p in permissions_data] # Todos os acessos
            },
            {
                "name": "ADMIN", 
                "description": "Gestão operacional e de usuários", 
                "perms": ["identity:view", "user:manage", "audit:view"]
            },
            {
                "name": "EDITOR", 
                "description": "Gestão técnica de conteúdo", 
                "perms": ["identity:view", "content:manage", "service:edit"]
            },
            {
                "name": "LEITOR", 
                "description": "Visualização de métricas e auditoria", 
                "perms": ["audit:view", "rbac:view", "identity:view"]
            },
            {
                "name": "USER", 
                "description": "Consumidor final dos serviços", 
                "perms": ["service:execute"]
            }
        ]
        
        roles = {}
        for r_config in roles_config:
            r = db.query(Role).filter(Role.name == r_config["name"]).first()
            if not r:
                r = Role(name=r_config["name"], description=r_config["description"])
                db.add(r)
                db.flush()
            
            # Sync permissions
            r.permissions = [perms[p_name] for p_name in r_config["perms"]]
            roles[r_config["name"]] = r

        # 2c. Seed Master Users (Neutral Library Standard)
        master_users = [
            {"email": "master@seed.com", "username": "Master", "password": "Sarak1234", "roles": ["MASTER"], "is_superuser": True},
            {"email": "admin@seed.com", "username": "Admin", "password": "Sarak1234", "roles": ["ADMIN"], "is_superuser": False},
            {"email": "editor@seed.com", "username": "Editor", "password": "Sarak1234", "roles": ["EDITOR"], "is_superuser": False},
            {"email": "auditor@seed.com", "username": "Auditor", "password": "Sarak1234", "roles": ["LEITOR"], "is_superuser": False},
            {"email": "user@seed.com", "username": "User", "password": "Sarak1234", "roles": ["USER"], "is_superuser": False}
        ]
        
        for user_data in master_users:
            existing = auth_service.get_user_by_email(db, user_data["email"]) or \
                       auth_service.get_user_by_username(db, user_data["username"])
            
            if not existing:
                existing = User(
                    email=user_data["email"],
                    username=user_data["username"],
                    password=auth_service.get_password_hash(user_data["password"]),
                    is_superuser=user_data["is_superuser"]
                )
                db.add(existing)
                db.flush()
                logger.info(f" [+] Auth-Seed: User created: {user_data['email']} ({user_data['roles'][0]})")
            
            # Sync Roles & Superuser status
            existing.roles = [roles[r_name] for r_name in user_data["roles"]]
            existing.is_superuser = user_data["is_superuser"]
            # Garantir senha padrão no seed
            existing.password = auth_service.get_password_hash(user_data["password"])
                
        db.commit()
        logger.info(" [OK] Sovereign Identity seeding completed (5 Levels Architecture).")
    except Exception as e:
        db.rollback()
        logger.error(f" [!] Auth-Seed: Critical error during seeding: {e}")
    finally:
        db.close()
