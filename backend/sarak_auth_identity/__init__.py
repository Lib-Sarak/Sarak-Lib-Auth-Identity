"""
Sarak-Lib-Auth-Identity — Autenticação JWT e gerenciamento de identidade.

Padrão Plug & Play: O módulo se registra automaticamente ao ser importado.
"""
from sarak_auth_identity.models.database import User
from sarak_auth_identity.database import setup_identity_db
from sarak_auth_identity.api.router import router, get_db, get_current_user
from sarak_auth_identity.seed import seed_auth_identity
from sarak_auth_identity.middleware import identity_middleware, tenant_middleware
from sarak_auth_identity.overrides import _get_identity_db, get_real_current_user

# Sarak Matrix v5.5: O auto-registro via sarak_shared.registry foi REMOVIDO
# para permitir a independência total do módulo (Portabilidade Absoluta).
# O Chamador (Aggregator ou Monolito) deve agora injetar Middlewares e Overrides manualmente.

__all__ = [
    "User",
    "ApiKey",
    "setup_identity_db",
    "router",
    "get_db",
    "get_current_user",
]
