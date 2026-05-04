# Technical Reference Templates (v6.8)

These examples demonstrate the correct implementation of components following the **Atomic Sovereignty** architecture.

## 1. Complete Manifest Example (`manifest.json`)
Ideal for a module that manages resources with a dashboard and management interface.

```json
{
  "contract": "v1",
  "id": "example-resource",
  "label": "Asset Management",
  "icon": "Package",
  "category": "Operational",
  "version": "1.0.0",
  "priority": 15,
  "endpoints": {
    "v1": {
      "manifest": "/module/manifest",
      "stats": "/api/v1/stats",
      "list": "/api/v1/assets"
    }
  },
  "visualContracts": [
    {
      "id": "stats_dashboard",
      "type": "STATS",
      "label": "Overview",
      "endpoint": "v1.stats",
      "tab": "Dashboard",
      "mapping": {
        "active_total": "Online Assets",
        "pending": "Pending Actions"
      }
    },
    {
      "id": "asset_management",
      "type": "MANAGEMENT_GRID",
      "label": "Asset Control",
      "endpoint": "v1.list",
      "tab": "Management",
      "groupBy": "category",
      "mapping": {
        "id": "id",
        "title": "name",
        "isActive": "is_active",
        "status": "status_text"
      },
      "actions": {
        "toggle": "/api/v1/assets/{id}/toggle"
      }
    }
  ]
}
```

## 2. Backend Boilerplate (FastAPI)
Sovereign implementation without dependency on internal shared libraries.

```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from .database import get_db, Base
from sqlalchemy import Column, String, Boolean

# 1. Model Definition (Isolated Schema)
class Asset(Base):
    __tablename__ = "assets"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

# 2. API Router
router = APIRouter(prefix="/api/v1")

@router.get("/assets")
async def list_assets(db: AsyncSession = Depends(get_db)):
    # Structured response for MANAGEMENT_GRID
    return [
        {"id": "01", "name": "Server A", "is_active": True, "category": "Infra"}
    ]

@router.post("/assets/{id}/toggle")
async def toggle_asset(id: str):
    return {"success": True, "id": id}
```

## 3. Network Communication (Fetch)
If a module needs data from another orchestrator, it must use pure network calls, never imports.

```typescript
// Example in a UI component (src/components)
const fetchExternalData = async () => {
    const response = await fetch('http://other-module/api/v1/data');
    return await response.json();
};
```

---
**Reference Code v6.8**
**Stability and Independence**
