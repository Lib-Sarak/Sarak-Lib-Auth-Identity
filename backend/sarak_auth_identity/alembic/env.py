import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# Adiciona o diretório backend ao path para que possamos importar o módulo
# CWD é .../backend/sarak_auth_identity
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sarak_auth_identity.core.models import Base
from sarak_auth_identity.config import settings

# this is the Alembic Config object
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Objeto de metadados para autogenerate
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        version_table_schema="sarak_auth",
        include_schemas=True
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    
    # Criamos o engine usando a URL do nosso settings
    from sqlalchemy import create_engine, text
    connectable = create_engine(settings.DATABASE_URL)
    
    # Detecção de suporte a Schema (SQLite não suporta schemas da mesma forma)
    is_sqlite = connectable.dialect.name == "sqlite"
    schema_name = "sarak_auth" if not is_sqlite else None

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata,
            version_table_schema=schema_name,
            include_schemas=True if schema_name else False
        )

        with context.begin_transaction():
            if schema_name:
                connection.execute(text(f"CREATE SCHEMA IF NOT EXISTS {schema_name}"))
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
