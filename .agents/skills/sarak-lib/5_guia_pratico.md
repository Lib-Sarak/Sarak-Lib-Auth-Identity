# Implementation Guide and Checklist (v6.8)

This guide defines the technical steps for the creation or maintenance of atomic modules.

## 1. New Module Creation Flow

1. **Cloning**: Use the `Sarak-Lib-Template` directory as a base.
2. **Atomic Identity**:
   - Define a unique `id` in `manifest.json`.
   - Configure the `endpoints` using the versioning pattern (v1).
3. **Data Sovereignty**:
   - Configure the `SCHEMA_NAME` in `database.py`.
   - Create SQLAlchemy models in `core/models.py`.
4. **Interface Projection**:
   - Add the `visualContracts` in the manifest.
   - Validate if the `mapping` matches the fields returned by the backend API.
5. **Authentication**:
   - Implement token validation in backend middlewares (Zero Trust).

## 2. Readiness Checklist (Sovereign Audit)

Before considering a module complete, verify if it meets these requirements:

- [ ] **Manifest**: The file exists, is valid, and accessible at `/module/manifest`.
- [ ] **Zero Imports**: No imports from other library directories.
- [ ] **Endpoint Independence**: All endpoints used in the manifest are relative or resolved by `UI-Core`.
- [ ] **Health**: `/health` endpoint operational.
- [ ] **SQL Isolation**: The module does not attempt to access tables outside its dedicated schema.
- [ ] **Nomenclature**: Does not contain self-promotional words (matrix, super, mega, master).

## 3. Maintenance and Debugging Guide

- **Module Offline**: Verify if the aggregator can reach the health endpoint.
- **Mapping Error**: Verify if the fields in the API JSON correspond EXACTLY to the `mapping` in the manifest.
- **Permissions**: Ensure the token sent by UI-Core is valid for the module's scope.

---
**Technical Documentation v6.8**
**Quality and Rigor**
