# Technical Standards and Organization (v6.8)

Every module in Sarak Lib must adhere to these standards to ensure stability and interoperability.

## 1. Nomenclature and Terminology
- **Prohibited**: Use of subjective or self-promotional terms (e.g., super, mega, matrix, master).
- **Mandatory**: Use of precise technical terms (e.g., Atomic, Aggregator, Projection, Endpoint, Middleware, Schema).
- **Internationalization**: All code comments, docstrings, and log messages must be strictly in **English**.

## 2. Recommended Directory Structure
For compliance with the `Sarak-Lib-Template`:

```text
/backend          # API implementation (FastAPI)
    /api          # Transport layer (Routers, DTOs)
    /core         # Domain layer (Services, SQL Models)
/src              # UI extensions (Optional if using VisualContracts)
    /components   # Atomic React components
manifest.json     # Identity and Visual Contract definition
requirements.txt  # Python dependencies
setup.py          # Package configuration
```

## 3. Isolation and Sovereignty
- **Zero-Cross-Import**: Modules do not import code from other modules.
- **Data Isolation**: Each module manages its own database schema.
- **Objective Documentation**: Comments must explain the "why" of complex decisions, never "what" the code does. Keep the code self-explanatory through meaningful names.

## 4. Manifest Specification (Visual Contract)
The `manifest.json` is the single source of truth for the UI.

### Mandatory Fields:
- `id`: Unique identifier (slug).
- `label`: Friendly name in the menu.
- `endpoints`: Route map indexed by version (e.g., `v1.main`).
- `visualContracts`: List of objects defining the rendering type (`type`), target (`endpoint`), and field `mapping`.

### Supported Contract Types:
- `MANAGEMENT_GRID`: Listing with Toggle (Enable/Disable) and grouping support.
- `STATS`: Numerical summary for dashboards.
- `TABLE`: Simple tabular view.
- `CARD_GRID`: Card catalog with filters.

---
**Technical Documentation v6.8**
**Standardization and Rigor**
