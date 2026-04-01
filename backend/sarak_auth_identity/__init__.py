"""
Sarak-Lib-Auth-Identity — Autenticação JWT e gerenciamento de identidade.

Exporta os modelos, serviços e dependências injetáveis do módulo.
Uso:
    from sarak_auth_identity import User, ApiKey, router
    from sarak_auth_identity import get_db, get_current_user  # para dependency_overrides
"""
from sarak_auth_identity.models.database import User, ApiKey, setup_identity_db
from sarak_auth_identity.api.router import router, get_db, get_current_user

__all__ = [
    "User",
    "ApiKey",
    "setup_identity_db",
    "router",
    "get_db",
    "get_current_user",
]
