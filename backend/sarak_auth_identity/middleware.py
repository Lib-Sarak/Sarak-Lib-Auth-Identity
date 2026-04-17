from fastapi import Request
from fastapi.responses import JSONResponse
import logging

# We need the shared identity contexts
from sarak_shared.database import identity_context, tenant_context
from sarak_auth_identity.core import auth_service

logger = logging.getLogger(__name__)

async def identity_middleware(request: Request, call_next):
    """
    Middleware de Identidade Sarak (v6.0) Portado para a Lib Nativa.
    Extrai o token JWT, identifica o usuário e popula o identity_context.
    """
    # 1. Identifica o sistema/tenant
    system_id = request.headers.get("X-System-ID") or request.headers.get("X-Tenant-ID") or request.query_params.get("system_id") or "public"
    tenant_context.set(system_id)
    
    # 2. Caminhos Isentos (Públicos)
    EXEMPT_PATHS = ["/api/auth/login", "/api/auth/register", "/api/auth/status", "/docs", "/openapi.json"]
    if any(request.url.path.startswith(path) for path in EXEMPT_PATHS) or request.method == "OPTIONS":
        return await call_next(request)

    # LIMPEZA PREVENTIVA: Garante que não haja resíduo de identidade
    identity_context.set(None)
    
    auth_header = request.headers.get("Authorization") or request.headers.get("authorization")
    user_id_context_token = None

    if not auth_header:
        print(f">>> [Gateway:401] Request em rota protegida SEM token Bearer: {request.url.path}")
        return JSONResponse(
            status_code=401,
            content={"detail": "Gateway: Autenticação obrigatória (Header ausente)"}
        )

    if auth_header.startswith("Bearer "):
        try:
            token_str = auth_header.split(" ")[1]
            payload = auth_service.verify_token(token_str)
            
            if payload and payload.get("sub"):
                uid = payload.get("sub")
                user_id_context_token = identity_context.set(uid)
                print(f">>> [Gateway:Success] Token Validado para UUID: {uid}")
            else:
                print(f">>> [Gateway:401] Token Decodificado mas sem 'sub' (User ID)")
                return JSONResponse(
                    status_code=401,
                    content={"detail": "Gateway: Token sem identificador de usuário"}
                )
        except Exception as e:
            print(f">>> [Gateway:401] Erro na Validação JWT: {str(e)}")
            return JSONResponse(
                status_code=401,
                content={"detail": f"Gateway: Falha na Identidade: {str(e)}"}
            )
    else:
        print(f">>> [Gateway:401] Request em rota protegida SEM token Bearer: {request.url.path}")
        return JSONResponse(
            status_code=401,
            content={"detail": "Gateway: Autenticação obrigatória"}
        )

    try:
        response = await call_next(request)
        return response
    finally:
        if user_id_context_token:
            identity_context.reset(user_id_context_token)
        else:
            identity_context.set(None)

async def tenant_middleware(request: Request, call_next):
    """Fallback genérico transferido."""
    return await call_next(request)
