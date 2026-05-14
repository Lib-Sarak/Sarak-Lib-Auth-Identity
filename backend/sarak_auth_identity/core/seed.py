import logging
import os
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

logger = logging.getLogger(__name__)

def seed_auth_identity(engine: Engine):
    """
    Seeds master users and essential schemas for the Sarak Ecosystem.
    Ensures idempotency and security standards (v7.5).
    """
    from .models import User, Role, Permission
    from . import auth_service
    from .auth_service import get_enforcer
    
    # Identifica o sistema soberano de forma estrita (v8.1)
    target_system = os.getenv("SARAK_SYSTEM_NAME")
    if not target_system:
        logger.error(" [!] Auth-Seed: SARAK_SYSTEM_NAME not defined. Seeding aborted to preserve sovereignty.")
        return
        
    systems_to_seed = [target_system]
    
    # 1. Ensure schemas exist
    try:
        with engine.connect() as conn:
            conn.execute(text("CREATE SCHEMA IF NOT EXISTS sarak_auth"))
            conn.commit()
    except Exception as e:
        logger.warning(f" [!] Auth-Seed: Schema validation warning: {e}")

    Session = sessionmaker(bind=engine)
    db = Session()
    try:
        # Permissões Base
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

        # Definição de Papéis
        roles_config = [
            {"name": "MASTER", "level": 100, "description": "Controle total", "perms": [p["name"] for p in permissions_data]},
            {"name": "ADMIN", "level": 50, "description": "Gestão operacional", "perms": ["identity:view", "user:manage", "audit:view"]},
            {"name": "EDITOR", "level": 30, "description": "Gestão técnica", "perms": ["identity:view", "content:manage", "service:edit"]},
            {"name": "LEITOR", "level": 20, "description": "Visualização", "perms": ["audit:view", "rbac:view", "identity:view"]},
            {"name": "USER", "level": 10, "description": "Consumidor final", "perms": ["service:execute"]}
        ]

        # Definição de Usuários Master
        master_users = [
            {"email": "master@seed.com", "username": "Master", "password": "Sarak1234", "roles": ["MASTER"], "is_superuser": True},
            {"email": "admin@seed.com", "username": "Admin", "password": "Sarak1234", "roles": ["ADMIN"], "is_superuser": False}
        ]

        for sys_name in systems_to_seed:
            logger.info(f" [Seed-Infra] Database URL: {engine.url.render_as_string(hide_password=True)}")
            logger.info(f" [Seed] Syncing master data for system: {sys_name}")
            
            # 2a. Sync Permissions for this system
            perms_map = {}
            for p_data in permissions_data:
                p = db.query(Permission).filter(
                    Permission.name == p_data["name"],
                    Permission.system == sys_name
                ).first()
                if not p:
                    p = Permission(**p_data, system=sys_name)
                    db.add(p)
                    db.flush()
                perms_map[p_data["name"]] = p

            # 2b. Sync Roles for this system
            roles_map = {}
            for r_config in roles_config:
                r = db.query(Role).filter(
                    Role.name == r_config["name"],
                    Role.system == sys_name
                ).first()
                if not r:
                    r = Role(name=r_config["name"], level=r_config["level"], description=r_config["description"], system=sys_name)
                    db.add(r)
                    db.flush()
                else:
                    # Update level if exists
                    r.level = r_config["level"]
                
                # Sync Permissions to Role
                r.permissions = [perms_map[p_name] for p_name in r_config["perms"]]
                roles_map[r_config["name"]] = r

            # 2c. Sync Users for this system
            logger.info(f" [Seed-Users] Starting sync for system: {sys_name}")
            for user_data in master_users:
                try:
                    existing = db.query(User).filter(
                        (User.email == user_data["email"]) | (User.username == user_data["username"]),
                        User.system == sys_name
                    ).first()

                    if not existing:
                        logger.info(f" [Seed-Users] CREATING: {user_data['username']}")
                        existing = User(
                            email=user_data["email"],
                            username=user_data["username"],
                            password=auth_service.get_password_hash(user_data["password"]),
                            is_superuser=user_data["is_superuser"],
                            is_active=True,
                            system=sys_name
                        )
                        db.add(existing)
                    else:
                        logger.info(f" [Seed-Users] UPDATING: {user_data['username']}")
                        existing.is_active = True
                        existing.is_superuser = user_data["is_superuser"]
                    
                    db.flush()
                    
                    # Sync Roles
                    role_obj = roles_map.get(user_data["roles"][0])
                    if role_obj:
                        existing.roles = [role_obj]
                    
                except Exception as user_err:
                    logger.error(f" [Seed-Users] Failed to sync user {user_data['username']}: {user_err}")
                    db.rollback()
                    continue

            db.commit()
        logger.info(f" [OK] Sovereign Identity seeding completed for systems: {systems_to_seed}")
        # Conferência Final
        # --- Sincronização Casbin (v9.0) ---
        logger.info(" [Seed-Casbin] Syncing Casbin policies...")
        enforcer = get_enforcer()
        
        for sys_name in systems_to_seed:
            # 1. Limpa regras antigas deste sistema para evitar duplicatas (Idempotência)
            # Nota: Em produção, você pode preferir apenas adicionar.
            enforcer.remove_filtered_policy(1, sys_name)
            
            # 2. Mapeia a Hierarquia Sarak no Casbin
            # Formato: g, role_filha, role_pai, dominio
            hierarchy = [
                ("MASTER", "ADMIN"),
                ("ADMIN", "EDITOR"),
                ("EDITOR", "USER")
            ]
            for sub, parent in hierarchy:
                enforcer.add_grouping_policy(sub, parent, sys_name)

            # 3. Mapeia Permissões das Roles para Casbin
            # Formato: p, role, dominio, recurso, acao
            for r_config in roles_config:
                for p_name in r_config["perms"]:
                    # No Sarak, p_name costuma ser 'recurso:acao' ou apenas 'permissao'
                    # Vamos mapear p_name como o 'objeto/recurso' e 'access' como ação padrão
                    enforcer.add_policy(r_config["name"], sys_name, p_name, "access")

            # 4. Mapeia Usuários Específicos para Roles no Casbin
            for user_data in master_users:
                user_obj = db.query(User).filter(User.email == user_data["email"], User.system == sys_name).first()
                if user_obj:
                    for role_name in user_data["roles"]:
                        enforcer.add_grouping_policy(str(user_obj.user_id), sys_name, role_name)

        enforcer.save_policy()
        logger.info(" [OK] Casbin policies synced successfully.")


    except Exception as e:
        db.rollback()
        logger.error(f" [!] Auth-Seed: Critical error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    from sarak_auth_identity.database import engine
    # Configurar log para console para vermos a saída
    logging.basicConfig(level=logging.INFO)
    logger.info(" [Manual-Seed] Starting manual seed process...")
    seed_auth_identity(engine)
