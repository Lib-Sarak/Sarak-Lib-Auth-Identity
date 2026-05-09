import logging
from fastapi import Request
from fastapi.responses import JSONResponse
from ..database import identity_context, tenant_context, level_context
from . import auth_service

logger = logging.getLogger(__name__)

async def identity_middleware(request: Request, call_next):
    """
    Sarak Sovereign Identity Middleware (v6.8).
    Extracts JWT token, identifies user, and populates identity_context.
    """
    # 1. Identify system/tenant
    system_id = request.headers.get("X-System-ID") or request.headers.get("X-Tenant-ID") or request.query_params.get("system_id") or "public"
    tenant_context.set(system_id)
    
    # 2. Exempt Paths (Public) - Sovereign Identity (Discovery Friendly)
    # We check if the path ends with these segments to be prefix-agnostic
    EXEMPT_SUFFIXES = [
        "/login", 
        "/login/mfa",
        "/callback",
        "/register", 
        "/status",
        "/refresh",
        "/catalog/models", 
        "/catalog/status",
        "/discover",
        "/orchestrator/discover",
        "/orchestrator/usage",
        "/orchestrator/keys",
        "/orchestrator/stream",
        "/selector/recommend",
        "/selector/routes",
        "/ui/modules",
        "/translator-google/languages/active",
        "/llm-test-chat/models",
        "/llm-test-chat/orchestrate",
        "/docs", 
        "/openapi.json"
    ]
    
    is_exempt = any(request.url.path.endswith(suffix) for suffix in EXEMPT_SUFFIXES) or \
                request.url.path.endswith("/module/manifest") or \
                request.method == "OPTIONS"

    if is_exempt:
        return await call_next(request)

    # PREVENTIVE CLEANUP: Ensures no identity residue
    identity_context.set(None)
    
    # [Sovereign Identity] M2M Sovereignty Support (System Key)
    import os
    system_key = request.headers.get("X-System-API-Key")
    expected_key = os.getenv("SYSTEM_API_KEY", "")
    
    if system_key and expected_key and system_key == expected_key:
        uid = request.headers.get("X-Sarak-User-ID", "system")
        user_id_context_token = identity_context.set(uid)
        logger.info(f" [AUTH:SOVEREIGN] Access via System Key for UID: {uid}")
        return await call_next(request)

    auth_header = request.headers.get("Authorization") or request.headers.get("authorization")
    user_id_context_token = None
    level_context_token = None

    if not auth_header:
        logger.warning(f" [Identity-Gateway] Missing Bearer token or System Key for protected route: {request.url.path}")
        return JSONResponse(
            status_code=401,
            content={"detail": "Gateway: Authentication required (Header missing)"}
        )

    if auth_header.startswith("Bearer "):
        try:
            token_str = auth_header.split(" ")[1]
            payload = auth_service.verify_token(token_str)
            
            if payload and payload.get("sub") and payload.get("type") == "access":
                uid = payload.get("sub")
                level = payload.get("level", 10)
                
                user_id_context_token = identity_context.set(uid)
                level_context_token = level_context.set(level)
                
                logger.info(f" [Identity-Gateway] Token validated for UUID: {uid} | Level: {level}")
            else:
                logger.warning(" [Identity-Gateway] Token decoded but missing 'sub' or invalid type")
                return JSONResponse(
                    status_code=401,
                    content={"detail": "Gateway: Token missing user identifier or invalid type"}
                )
        except Exception as e:
            logger.error(f" [Identity-Gateway] JWT Validation Error: {e}")
            return JSONResponse(
                status_code=401,
                content={"detail": f"Gateway: Identity failure: {str(e)}"}
            )
    else:
        logger.warning(f" [Identity-Gateway] Invalid auth scheme for protected route: {request.url.path}")
        return JSONResponse(
            status_code=401,
            content={"detail": "Gateway: Authentication required"}
        )

    try:
        response = await call_next(request)
        return response
    finally:
        if user_id_context_token:
            identity_context.reset(user_id_context_token)
        if level_context_token:
            level_context.reset(level_context_token)
            
        if not user_id_context_token:
            identity_context.set(None)
            level_context.set(10)

async def tenant_middleware(request: Request, call_next):
    """Fallback genérico transferido."""
    return await call_next(request)
