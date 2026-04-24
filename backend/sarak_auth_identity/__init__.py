"""
Sarak-Lib-Auth-Identity — Autenticação JWT e gerenciamento de identidade.
"""
from .core.models import User
from .database import setup_identity_db
from .api.router import router, get_db, get_current_user
from .core.seed import seed_auth_identity
from .core.middleware import identity_middleware, tenant_middleware
from .core.overrides import _get_identity_db, get_real_current_user
from .core.isolation import setup_sovereign_isolation

# Initialize Sovereign Isolation Engine (v6.8)
setup_sovereign_isolation()

__all__ = [
    "User",
    "setup_identity_db",
    "router",
    "get_db",
    "get_current_user",
    "identity_middleware",
    "tenant_middleware",
    "_get_identity_db",
    "get_real_current_user"
]
