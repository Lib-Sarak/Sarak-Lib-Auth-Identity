from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, UniqueConstraint, Text, Boolean, Float
from sqlalchemy import Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from sarak_auth_identity.database import Base



class User(Base):
    __tablename__ = "users"
    __table_args__ = {'schema': 'sarak_auth'}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    must_change_password = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relações reversas definidas nos outros modelos (api_keys, token_usage, etc)

class ApiKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("sarak_identity.users.id", ondelete="CASCADE"), nullable=False, index=True)
    service = Column(String(50), nullable=False)
    encrypted_key = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", backref="api_keys")
    
    __table_args__ = (
        UniqueConstraint('user_id', 'service', name='unique_user_service_key'),
        {'schema': 'sarak_auth'}
    )

class TokenUsage(Base):
    __tablename__ = "token_usage"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("sarak_identity.users.id", ondelete="CASCADE"), nullable=False, index=True)
    service = Column(String(50), nullable=False, index=True)
    model = Column(String(100), nullable=False, index=True)
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    requests = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    user = relationship("User", backref="token_usage")
    
    __table_args__ = {'schema': 'sarak_auth'}

def setup_identity_db(engine):
    """Inicializa o schema e as tabelas deste módulo."""
    from sarak_auth_identity.database import Base, ensure_schema_exists
    ensure_schema_exists(engine, "sarak_auth")
    Base.metadata.create_all(bind=engine, tables=[User.__table__, ApiKey.__table__, TokenUsage.__table__])



