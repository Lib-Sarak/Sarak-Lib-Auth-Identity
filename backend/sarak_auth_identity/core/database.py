import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import contextvars

# --- CONFIGURAÇÃO DE BANCO SOBERANA (v5.5) ---
from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/sarak_db")
SCHEMA_NAME = "sarak_auth"

engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Contextos locais para compatibilidade de middleware se necessário
identity_context = contextvars.ContextVar("identity_context", default=None)
tenant_context = contextvars.ContextVar("tenant_context", default="public")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def setup_identity_db(ext_engine=None):
    """Garante que o schema de autenticação exista e as tabelas sejam criadas."""
    target_engine = ext_engine or engine
    
    with target_engine.connect() as conn:
        conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {SCHEMA_NAME}"))
        conn.commit()
    
    # Importação local para evitar referências circulares
    from sarak_auth_identity.core.models.database import User
    Base.metadata.create_all(bind=target_engine)
    print(f">>> [Auth DB] Soberania: Schema {SCHEMA_NAME} verificado com sucesso.")
