from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import contextvars
import logging
from .config import settings

# --- SOVEREIGN DATABASE CONFIGURATION (v9.0) ---
logger = logging.getLogger(__name__)

DATABASE_URL = settings.DATABASE_URL

SCHEMA_NAME = "sarak_auth"

engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_auth_schema():
    """Retorna o nome do schema se não for SQLite (v9.0)."""
    if engine.url.drivername == "sqlite":
        return None
    return SCHEMA_NAME

# Local contexts for middleware compatibility
identity_context = contextvars.ContextVar("identity_context", default=None)
is_superuser_context = contextvars.ContextVar("is_superuser_context", default=False)
tenant_context = contextvars.ContextVar("tenant_context", default="public")


def get_db():
    """Database session dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def setup_auth_database(target_engine=None):
    """
    Inicializa o schema e as tabelas de identidade (v10.0).
    Pode ser chamado pelo MyService ou qualquer módulo que importe esta lib.
    """
    from sqlalchemy import text
    from .core.models import User, Role, Permission # Garante que os modelos sejam carregados
    from .core.seed import seed_auth_identity # Importação tardia para evitar circularidade
    
    active_engine = target_engine or engine
    is_postgres = active_engine.url.drivername.startswith("postgresql")
    
    print(f" [AUTH] Inicializando Banco de Dados em: {active_engine.url.database}")
    
    if is_postgres:
        with active_engine.connect() as conn:
            print(f" [AUTH] Criando schema '{SCHEMA_NAME}' se não existir...")
            conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {SCHEMA_NAME};"))
            conn.commit()

    # Cria as tabelas vinculadas ao Base desta biblioteca
    Base.metadata.create_all(bind=active_engine)
    print(" [AUTH] Tabelas de identidade verificadas/criadas com sucesso.")

    # Executa o seed automático para garantir que o Master exista
    try:
        print(" [AUTH] Executando sincronização de dados mestre (Seed)...")
        seed_auth_identity(active_engine)
    except Exception as e:
        print(f" [AUTH] Aviso no Seed: {e}")
