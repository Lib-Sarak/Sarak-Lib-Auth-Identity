"""
Sarak-Lib-Auth-Identity — Autenticação JWT e gerenciamento de identidade.

Padrão Plug & Play: O módulo se registra automaticamente ao ser importado.
"""
from sarak_shared.registry import register_sarak_router, register_sarak_db_setup, register_sarak_db_seeder
from sarak_auth_identity.models.database import User, setup_identity_db
from sarak_auth_identity.api.router import router, get_db, get_current_user
from sarak_auth_identity.seed import seed_auth_identity

# Auto-registro Plug & Play
# Registra as rotas de autenticação e o setup do banco de dados
register_sarak_router(router, prefix="/api/auth", tags=["Identity"])
register_sarak_db_setup(setup_identity_db)
register_sarak_db_seeder(seed_auth_identity)

__all__ = [
    "User",
    "ApiKey",
    "setup_identity_db",
    "router",
    "get_db",
    "get_current_user",
]
