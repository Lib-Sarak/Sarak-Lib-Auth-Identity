from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import text

Base = declarative_base()

def ensure_schema_exists(engine, schema_name: str):
    """Garante que o schema PostgreSQL exista antes da criação das tabelas."""
    with engine.connect() as conn:
        conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {schema_name}"))
        conn.commit()
