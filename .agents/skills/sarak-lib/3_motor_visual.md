# Visual Engine and Dynamic Rendering (v6.8)

The interface system is based on the concept of **Agnostic Projection**. The frontend has no prior knowledge of a module's features; it interprets them through metadata.

## 1. The DynamicRenderer
The central component of the `UI-Core` responsible for transforming the `manifest.json` into visual elements.

### Discovery Lifecycle
1. **Scanning**: The aggregator looks for manifests in all registered services.
2. **Parsing**: Validates if the manifest has the `visualContracts` structure.
3. **Mapeamento (Dynamic Mapping)**: Links JSON fields returned by the API to UI component properties.

## 2. Dynamic Endpoint Resolution
To avoid hardcoded URLs, the Visual Engine uses context-based resolution logic:

- **Dot Notation (`v1.data`)**: The engine looks for the path in the `endpoints.v1.data` object of the manifest and concatenates it with the module's `baseUrl`.
- **Relativity**: If a contract defines an endpoint starting with `/`, the engine assumes it's a path relative to the service's root that provided the manifest.

## 3. Visual Contract Catalog

### MANAGEMENT_GRID
Used for operational resource management.
- **Fields**: `id`, `title`, `description`, `isActive`, `status`.
- **Actions**: Supports `toggle` (enable/disable) and CRUD endpoints.

### STATS
Used for dashboard indicators.
- **Mapping**: JSON Key -> Friendly title on the card.

### CARD_GRID
Used for catalogs and libraries.
- **Filters**: Supports filter definitions like `TABS`, `SELECT`, or dynamic `INPUT`.

## 4. Aesthetics and Performance
- **Transitions**: Use of `framer-motion` for smooth entry of new modules.
- **Lazy Discovery**: Modules are loaded upon navigation, optimizing the initial bundle.

---
**Technical Documentation v6.8**
**Flexibility and Decoupling**
