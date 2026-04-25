from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, UniqueConstraint, Text, Boolean, Float, Table
from sqlalchemy import Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

# Standard import from module root
from ..database import Base

# Association table for User <-> Role (Many-to-Many)
user_roles = Table(
    "user_roles_map",
    Base.metadata,
    Column("user_id", UUID(as_uuid=True), ForeignKey("sarak_auth.users.user_id", ondelete="CASCADE")),
    Column("role_id", UUID(as_uuid=True), ForeignKey("sarak_auth.roles.role_id", ondelete="CASCADE")),
    schema="sarak_auth"
)

# Association table for Role <-> Permission (Many-to-Many)
role_permissions = Table(
    "role_permissions_map",
    Base.metadata,
    Column("role_id", UUID(as_uuid=True), ForeignKey("sarak_auth.roles.role_id", ondelete="CASCADE")),
    Column("permission_id", UUID(as_uuid=True), ForeignKey("sarak_auth.permissions.permission_id", ondelete="CASCADE")),
    schema="sarak_auth"
)

class Permission(Base):
    """Granular permission definitions (ex: 'user:write', 'catalog:view')"""
    __tablename__ = "permissions"
    __table_args__ = {'schema': 'sarak_auth'}
    
    permission_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, index=True)
    system = Column(String(50), nullable=False, index=True)
    description = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint('name', 'system', name='uq_permission_name_system'),
        {'schema': 'sarak_auth'}
    )

class Role(Base):
    """User categories/roles (ex: 'ADMIN', 'OPERATOR')"""
    __tablename__ = "roles"
    __table_args__ = {'schema': 'sarak_auth'}
    
    role_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), nullable=False, index=True)
    system = Column(String(50), nullable=False, index=True)
    level = Column(Integer, default=10, nullable=False) # 100: MASTER, 50: ADMIN, 10: USER
    description = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint('name', 'system', name='uq_role_name_system'),
        {'schema': 'sarak_auth'}
    )
    
    permissions = relationship("Permission", secondary=role_permissions, backref="roles")

    @property
    def permission_names(self):
        """Helper to return simple list of permission names (v8.1)."""
        return [p.name for p in self.permissions]

class User(Base):
    """Sarak Sovereign Identity User Model (v6.8)"""
    __tablename__ = "users"
    __table_args__ = {'schema': 'sarak_auth'}
    
    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), nullable=False, index=True)
    username = Column(String(100), nullable=False, index=True)
    system = Column(String(50), nullable=False, index=True)
    password = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    must_change_password = Column(Boolean, default=False)
    
    # OAuth Fields (v7.6)
    oauth_provider = Column(String(50), nullable=True)
    oauth_id = Column(String(255), nullable=True)
    avatar_url = Column(Text, nullable=True)
    
    # MFA Fields (v7.7)
    mfa_enabled = Column(Boolean, default=False, nullable=False)
    mfa_secret = Column(String(100), nullable=True)
    
    # Preferences (v8.0)
    preferences = Column(JSONB, nullable=True, server_default='{}')
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint('email', 'system', name='uq_user_email_system'),
        UniqueConstraint('username', 'system', name='uq_user_username_system'),
        {'schema': 'sarak_auth'}
    )
    
    roles = relationship("Role", secondary=user_roles, backref="users")

class UserSession(Base):
    """Active user sessions for Refresh Token and revocation logic"""
    __tablename__ = "user_sessions"
    __table_args__ = {'schema': 'sarak_auth'}
    
    session_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("sarak_auth.users.user_id", ondelete="CASCADE"), nullable=False)
    system = Column(String(50), nullable=False, index=True)
    refresh_token = Column(String(512), unique=True, nullable=False, index=True)
    user_agent = Column(String(255))
    ip_address = Column(String(50))
    is_revoked = Column(Boolean, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserInteraction(Base):
    """Tracking of user interactions (Audit & Analytics)"""
    __tablename__ = "user_interactions"
    __table_args__ = {'schema': 'sarak_auth'}
    
    interaction_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("sarak_auth.users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    system = Column(String(50), nullable=False, index=True)
    module_id = Column(String(100), nullable=False, index=True)
    action = Column(String(100), nullable=False)
    payload = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PasswordResetToken(Base):
    """Secure tokens for password recovery (1h expiration)"""
    __tablename__ = "password_reset_tokens"
    __table_args__ = {'schema': 'sarak_auth'}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("sarak_auth.users.user_id", ondelete="CASCADE"), nullable=False)
    system = Column(String(50), nullable=False, index=True)
    token_hash = Column(String(255), nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
