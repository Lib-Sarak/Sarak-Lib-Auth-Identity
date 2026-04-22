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
    """Ensures the authentication schema exists and tables are created."""
    target_engine = ext_engine or engine
    
    try:
        with target_engine.connect() as conn:
            conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {SCHEMA_NAME}"))
            conn.commit()
        
        # Local import to avoid circular dependencies
        from sarak_auth_identity.core.models import User
        Base.metadata.create_all(bind=target_engine)
        logger.info(f" [Auth DB] Sovereignty: Schema '{SCHEMA_NAME}' verified successfully.")
    except Exception as e:
        logger.error(f" [Auth DB] Critical failure during schema setup: {e}")
        raise
