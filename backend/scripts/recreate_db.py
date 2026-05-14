import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Carregar ambiente explicitamente do diretório backend
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(backend_dir, ".env")
load_dotenv(env_path)

from sarak_auth_identity.database import Base, engine, setup_auth_database
from seed_v2 import seed

def recreate_db():
    print(" [SARAK] Reiniciando Banco de Dados (Deep Clean)...")
    
    # 1. Dropar todas as tabelas (Ação agressiva para limpeza total)
    is_postgres = engine.url.drivername.startswith("postgresql")
    
    with engine.connect() as conn:
        if is_postgres:
            print(" [DB] Detectado PostgreSQL. Limpando schema sarak_auth...")
            # Tentamos dropar o schema da lib para garantir limpeza
            conn.execute(text("DROP SCHEMA IF EXISTS sarak_auth CASCADE;"))
        else:
            print(" [DB] Detectado SQLite ou outro. Dropando tabelas individualmente...")
            Base.metadata.drop_all(bind=engine)
        conn.commit()

    print(" [DB] Limpeza concluída.")
    
    # 2. Criar tabelas novamente usando a nova função padrão
    setup_auth_database(engine)
    
    # 3. Rodar o seed
    seed()

if __name__ == "__main__":
    # Adiciona o diretório atual ao path para importar sarak_auth_identity
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
    recreate_db()
