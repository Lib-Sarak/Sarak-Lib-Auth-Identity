\"\"\"
Sarak-Lib-Auth-Identity — Autenticação JWT e gerenciamento de identidade.

Padrão Plug & Play: O módulo se registra automaticamente ao ser importado.
\"\"\"
from sarak_shared.registry import register_sarak_router, register_sarak_db_setup
from sarak_auth_identity.models.database import User, ApiKey, setup_identity_db
from sarak_auth_identity.api.router import router, get_db, get_current_user

# Auto-Registro no Ecossistema Sarak
register_sarak_router(router, prefix=\"/api/v1/auth\", tags=[\"Security\"])
register_sarak_db_setup(setup_identity_db)

__all__ = [
    \"User\",
    \"ApiKey\",
    \"setup_identity_db\",
    \"router\",
    \"get_db\",
    \"get_current_user\",
]
