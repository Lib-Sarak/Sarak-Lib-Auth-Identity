import os
import sys
from datetime import datetime

# Adjust path to import sarak_auth_identity
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from sarak_auth_identity.database import SessionLocal
from sarak_auth_identity.core.models import UserSession, UserInteraction, User

def inspect_db():
    db = SessionLocal()
    try:
        print("=== Users ===")
        users = db.query(User).all()
        for u in users:
            print(f"User: {u.email} (System: {u.system})")

        print("\n=== User Sessions ===")
        sessions = db.query(UserSession).all()
        from datetime import timezone
        now = datetime.now(timezone.utc)
        for s in sessions:
            status = "EXPIRED" if s.expires_at < now else "ACTIVE"
            revoked = "REVOKED" if s.is_revoked else "VALID"
            print(f"Session ID: {s.session_id} | User: {s.user_id} | System: {s.system} | Status: {status}, {revoked} | Expires: {s.expires_at}")

        print("\n=== User Interactions ===")
        interactions = db.query(UserInteraction).all()
        for i in interactions:
            print(f"Interaction: {i.action} | User: {i.user_id} | System: {i.system} | Time: {i.created_at}")
            
    finally:
        db.close()

if __name__ == "__main__":
    inspect_db()
