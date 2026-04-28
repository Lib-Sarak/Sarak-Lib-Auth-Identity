from sqlalchemy import event, select, literal
from sqlalchemy.orm import Session, with_loader_criteria
from .models import UserInteraction, UserSession
from sarak_auth_identity.database import identity_context, level_context
import logging

logger = logging.getLogger(__name__)

def setup_sovereign_isolation():
    """
    Sets up global SQLAlchemy event listeners to enforce data isolation (v6.8).
    Uses the 'do_orm_execute' hook to inject filters safely into all SELECT statements.
    """
    
    @event.listens_for(Session, "do_orm_execute")
    def _do_orm_execute(orm_execute_state):
        """
        Intercepts ORM execution and applies identity filtering criteria.
        """
        uid = identity_context.get()
        level = level_context.get()
        
        # Bypass for MASTER (100+), internal tasks, or if no identity is set
        if not uid or uid == "system" or (level and level >= 100):
            if level and level >= 100:
                logger.debug(f" [Isolation] MASTER bypass active for UID: {uid}")
            return

        # We only apply filters to SELECT statements that are not internal loads
        if (
            orm_execute_state.is_select
            and not orm_execute_state.is_column_load
            and not orm_execute_state.is_relationship_load
        ):
            # [Sovereign Security] Targeted Isolation Engine (v6.8.2 Stable)
            # Instead of 'object', we target only the mappers involved in the current query.
            # This fixes the Python 3.14 TypeError: unbound method type.__subclasses__()
            for mapper in orm_execute_state.all_mappers:
                if hasattr(mapper.class_, "user_id"):
                    # Apply criteria only to models that actually own user data
                    orm_execute_state.statement = orm_execute_state.statement.options(
                        with_loader_criteria(
                            mapper.class_, 
                            lambda cls: cls.user_id == uid,
                            include_aliases=True,
                            propagate_to_loaders=True,
                            track_closure_variables=False
                        )
                    )
            logger.debug(f" [Isolation] Applied targeted sovereign filters for UID: {uid}")

    logger.info(" [Auth-Sovereign] Targeted Isolation Engine initialized (Python 3.14 Compat).")
