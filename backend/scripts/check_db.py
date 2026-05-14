import os
from sqlalchemy import create_engine, text
from sarak_auth_identity.database import engine

def check_db():
    print(f" [DB-CHECK] Engine: {engine.url.drivername}")
    print(f" [DB-CHECK] Database: {engine.url.database}")
    print(f" [DB-CHECK] Host: {engine.url.host}")
    
    with engine.connect() as conn:
        if engine.url.drivername == "postgresql":
            # PostgreSQL Queries
            schemas = conn.execute(text("SELECT schema_name FROM information_schema.schemata")).fetchall()
            print(f" [SCHEMAS] {[s[0] for s in schemas]}")
            
            tables = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'sarak_auth'")).fetchall()
            print(f" [TABLES] {[t[0] for t in tables]}")
            
            if tables:
                users = conn.execute(text("SELECT email, username, system, is_superuser FROM sarak_auth.users")).fetchall()
                print("\n [USUÁRIOS ENCONTRADOS]:")
                for u in users:
                    print(f"  - {u.email} (Username: {u.username}) | Sistema: {u.system} | Master: {u.is_superuser}")
                
                roles = conn.execute(text("SELECT name, level FROM sarak_auth.roles")).fetchall()
                print("\n [ROLES ENCONTRADAS]:")
                for r in roles:
                    print(f"  - {r.name} (Level: {r.level})")

                perms = conn.execute(text("SELECT name FROM sarak_auth.permissions")).fetchall()
                print("\n [PERMISSÕES ENCONTRADAS]:")
                print(f"  - { [p[0] for p in perms]}")

                interactions_count = conn.execute(text("SELECT count(*) FROM sarak_auth.user_interactions")).scalar()
                print(f"\n [AUDITORIA] Interações registradas: {interactions_count}")
        else:
            # SQLite Queries
            tables = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'")).fetchall()
            print(f" [TABLES] {[t[0] for t in tables]}")
            
            if ('users',) in tables or 'users' in [t[0] for t in tables]:
                users = conn.execute(text("SELECT email, username, system, is_superuser FROM users")).fetchall()
                print("\n [USUÁRIOS EM SQLITE (users table)]:")
                for u in users:
                    print(f"  - {u.email} (Username: {u.username}) | Sistema: {u.system} | Master: {u.is_superuser}")
            else:
                print(" [WARNING] Nenhuma tabela de usuários encontrada no SQLite.")

if __name__ == "__main__":
    check_db()
