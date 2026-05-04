# Agnostic Orchestration & Security (v8.5)

Sarak UI-Core acts as a sovereign host. It does not contain business logic; it renders functionality based on agnostic visual contracts.

## 1. The Visual Contract Ecosystem
Modules register their capabilities via `manifest.json`. The `UI-Core` translates these into templates via the `DynamicRenderer`.

### Supported Contract Types:
- `TABLE` / `MANAGEMENT_GRID`: Data intensive views.
- `STATS` / `CARD_GRID`: Metric and collection summaries.
- `CHART` / `ELITE_CHART`: Specialized data visualization.
- `CHAT_INTERFACE` / `ADVANCED_CHAT`: AI and human interaction.
- `SECURITY_ORCHESTRATOR` **(New v8.5)**: Sovereign security flows (MFA, Setup, Identity Validation).

## 2. Security Orchestration Protocol
The `SECURITY_ORCHESTRATOR` is a specialized template for sensitive identity flows:
- **Resilient Discovery**: Must handle `status`, `setup`, and `enable/activation` routes.
- **Agnostic Logic**: The `UI-Core` component handles the UI state machine (Loading -> Setup -> Success), while the module backend handles the actual cryptographic logic.
- **Visual Identity**: Security flows must always follow the high-tier design system (uppercase, tracking-widest, intensive use of `--theme-border`).

## 3. Communication Patterns
- **Endpoint Resolution**: All contracts must use the `resolveEndpoint` helper to handle base URL and versioning.
- **Centralized API**: Use the `api` service from `@shared/services/api` to ensure consistent interceptors (Auth, Rate Limiting).
- **Error Resilience**: Templates must implement fallback states for network failures or "Service Unavailable" scenarios.

---
**Sarak Engineering v8.5**
