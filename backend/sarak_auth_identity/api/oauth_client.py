import os
import logging
from httpx_oauth.clients.google import GoogleOAuth2
from httpx_oauth.clients.github import GitHubOAuth2
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

# --- Configuration & Fail-Fast Initialization ---

def get_google_client():
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        logger.error(" [OAuth-FailFast] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not configured.")
        return None
    
    return GoogleOAuth2(client_id, client_secret)

def get_github_client():
    client_id = os.getenv("GITHUB_CLIENT_ID")
    client_secret = os.getenv("GITHUB_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        logger.error(" [OAuth-FailFast] GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET not configured.")
        return None
    
    return GitHubOAuth2(client_id, client_secret)

def get_oauth_client(provider: str):
    """Factory to get the requested OAuth client."""
    provider = provider.lower()
    client = None
    
    if provider == "google":
        client = get_google_client()
    elif provider == "github":
        client = get_github_client()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=f"OAuth Provider '{provider}' is not configured or unsupported."
        )
    
    return client
