import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import contextvars
import logging

# --- SOVEREIGN DATABASE CONFIGURATION (v6.8) ---
load_dotenv()

logger = logging.getLogger(__name__)

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

# Local contexts for middleware compatibility
identity_context = contextvars.ContextVar("identity_context", default=None)
tenant_context = contextvars.ContextVar("tenant_context", default="public")

def get_db():
    """Database session dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def setup_identity_db(ext_engine=None):
    """Ensures the authentication schema exists and tables are created/updated (v7.5 Migration)."""
    target_engine = ext_engine or engine
    
    try:
        with target_engine.connect() as conn:
            # 1. Schema
            conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {SCHEMA_NAME}"))
            conn.commit()
            
            # 2. Base tables creation
            # Local import to avoid circular dependencies
            from sarak_auth_identity.core.models import User
            Base.metadata.create_all(bind=target_engine)
            
            # 3. Lightweight Migration (Add 'system' column and convert PKs to composite)
            # This is critical for systems transitioning from v6.8 to v7.5
            affected_tables = {
                'users': 'user_id', 
                'roles': 'role_id', 
                'permissions': 'permission_id', 
                'user_sessions': 'session_id', 
                'user_interactions': 'interaction_id'
            }
            for table, pk_col in affected_tables.items():
                # 1. Garantir que a coluna 'system' existe
                conn.execute(text(f"ALTER TABLE {SCHEMA_NAME}.{table} ADD COLUMN IF NOT EXISTS system VARCHAR(50) DEFAULT 'global'"))
                
                # 2. Garantir índice para performance
                conn.execute(text(f"CREATE INDEX IF NOT EXISTS idx_{table}_system ON {SCHEMA_NAME}.{table}(system)"))
                
                # 3. Converter PK para composta se necessário
                pk_check = f"""
                    SELECT count(*) FROM information_schema.key_column_usage 
                    WHERE table_schema = '{SCHEMA_NAME}' AND table_name = '{table}' AND column_name = 'system'
                """
                is_composite = conn.execute(text(pk_check)).scalar()
                
                if is_composite == 0:
                    logger.info(f" [Migration] Converting PK of {SCHEMA_NAME}.{table} to composite (v7.6)...")
                    # No PG, o nome padrão é {table}_pkey. Para tabelas com UUID, às Às vezes varia. 
                    # Usamos CASCADE para limpar dependências internas se necessário.
                    conn.execute(text(f"ALTER TABLE {SCHEMA_NAME}.{table} DROP CONSTRAINT IF EXISTS {table}_pkey CASCADE"))
                    conn.execute(text(f"ALTER TABLE {SCHEMA_NAME}.{table} ADD PRIMARY KEY ({pk_col}, system)"))
            
            conn.commit()
        
        logger.info(f" [Auth DB] Sovereignty: Schema '{SCHEMA_NAME}' and multi-tenant columns verified.")
    except Exception as e:
        logger.error(f" [Auth DB] Critical failure during schema setup: {e}")
        raise
