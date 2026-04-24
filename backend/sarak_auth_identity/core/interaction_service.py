import os
import logging
from sqlalchemy.orm import Session
from .models import UserInteraction
from sarak_auth_identity.database import identity_context

logger = logging.getLogger(__name__)

class InteractionService:
    """
    Hybrid Interaction Service (v6.8)
    Manages user activity logs with configurable persistence.
    """
    
    @staticmethod
    def log_interaction(db: Session, system: str, module_id: str, action: str, payload: dict = None):
        """
        Logs an interaction.
        If SARAK_INTERACTION_MODE is 'db', it persists in the sovereign database.
        Otherwise, it just logs to the console (the frontend will handle localstorage).
        """
        mode = os.getenv("SARAK_INTERACTION_MODE", "local").lower()
        uid = identity_context.get()
        
        if not uid:
            logger.warning(f" [Interaction] Attempted to log interaction without identity: {action}")
            return
            
        if mode == "db":
            try:
                from uuid import UUID
                interaction = UserInteraction(
                    user_id=UUID(uid) if isinstance(uid, str) else uid,
                    system=system,
                    module_id=module_id,
                    action=action,
                    payload=payload
                )
                db.add(interaction)
                db.commit()
                logger.info(f" [Interaction:DB] Logged: {action} for module {module_id} (System: {system})")
            except Exception as e:
                logger.error(f" [Interaction:DB] Failed to persist: {e}")
                db.rollback()
        else:
            # Mode is local - we rely on the frontend to store in LocalStorage.
            # Here we just provide a backend trace for debugging.
            logger.debug(f" [Interaction:LOCAL] Event captured (for frontend storage): {action}")

    @staticmethod
    def get_user_history(db: Session, user_id: str, limit: int = 50):
        """Retrieves history from DB if mode is 'db'"""
        from uuid import UUID
        return db.query(UserInteraction).filter(
            UserInteraction.user_id == (UUID(user_id) if isinstance(user_id, str) else user_id)
        ).order_by(UserInteraction.created_at.desc()).limit(limit).all()
