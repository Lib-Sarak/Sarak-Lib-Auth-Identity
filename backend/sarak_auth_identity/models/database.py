from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, UniqueConstraint, Text, Boolean, Float
from sqlalchemy import Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from sarak_shared import Base, ensure_schema_exists



class User(Base):
    __tablename__ = "users"
    __table_args__ = {'schema': 'sarak_auth'}
    
    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    must_change_password = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relações reversas definidas nos outros modelos (api_keys, token_usage, etc)

# Tabela ApiKey removida por redundância (Soberania agora no Orchestrator)


def setup_identity_db(engine):
    """Inicializa o schema e as tabelas deste módulo."""
    from sarak_shared import Base, ensure_schema_exists
    ensure_schema_exists(engine, "sarak_auth")
    Base.metadata.create_all(bind=engine, tables=[User.__table__])



