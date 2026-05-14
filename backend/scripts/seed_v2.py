import uuid
import os
from dotenv import load_dotenv

# Carregar ambiente
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(backend_dir, ".env")
load_dotenv(env_path)

from sqlalchemy import func
from sqlalchemy.orm import Session
from sarak_auth_identity.database import SessionLocal, engine, Base
from sarak_auth_identity.core.models import User, Role, Permission, UserSession
from sarak_auth_identity.core.auth_service import get_password_hash

def seed():
    print(" [SARAK] Iniciando Seeding Soberano v2.0...")
    # Garantir que as tabelas existem
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    system_name = os.getenv("SARAK_SYSTEM_NAME", "MyService")
    
    try:
        # 1. Criar Permissões Base
        perms_to_create = [
            ("rbac:view", "Visualizar matriz de permissões"),
            ("rbac:manage", "Alterar papéis e permissões"),
            ("user:manage", "Gerenciar usuários e níveis"),
            ("identity:view", "Visualizar perfis de identidade"),
            ("audit:view", "Visualizar logs e sessões"),
            ("*", "Acesso Total (Coringa)")
        ]
        
        db_perms = {}
        for p_name, p_desc in perms_to_create:
            perm = db.query(Permission).filter(Permission.name == p_name, Permission.system == system_name).first()
            if not perm:
                perm = Permission(permission_id=uuid.uuid4(), name=p_name, description=p_desc, system=system_name)
                db.add(perm)
            db_perms[p_name] = perm
        db.commit()

        # 2. Criar Papéis Hierárquicos
        roles_to_create = [
            ("MASTER", 100, "Supremo do Sistema", ["*", "rbac:manage", "user:manage", "audit:view"]),
            ("ADMIN", 50, "Administrador local", ["rbac:view", "user:manage", "audit:view"]),
            ("EDITOR", 30, "Editor de conteúdo", ["identity:view"]),
            ("LEITOR", 20, "Acesso de leitura", ["identity:view"]),
            ("USER", 10, "Usuário base", [])
        ]

        db_roles = {}
        for r_name, r_level, r_desc, r_perms in roles_to_create:
            role = db.query(Role).filter(Role.name == r_name, Role.system == system_name).first()
            if not role:
                role = Role(role_id=uuid.uuid4(), name=r_name, level=r_level, description=r_desc, system=system_name)
                db.add(role)
            
            # Associar permissões
            role.permissions = [db_perms[p] for p in r_perms if p in db_perms]
            db_roles[r_name] = role
        db.commit()

        # 3. Criar Usuário Master (Seed)
        master_email = "master@seed.com"
        master_user = db.query(User).filter(User.email == master_email).first()
        if not master_user:
            master_user = User(
                user_id=uuid.uuid4(),
                email=master_email,
                username="master",
                password=get_password_hash("master123"),
                is_active=True,
                is_superuser=True, # Importante para o SecurityModule.tsx
                system=system_name,
                full_name="Administrador Supremo"
            )
            db.add(master_user)
        
        master_user.roles = [db_roles["MASTER"]]
        db.commit()

        print(f" [SUCCESS] Seeding concluído para o sistema: {system_name}")
        print(f" [INFO] Usuário: {master_email} | Senha: master123")

    except Exception as e:
        db.rollback()
        print(f" [ERROR] Falha no seeding: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
