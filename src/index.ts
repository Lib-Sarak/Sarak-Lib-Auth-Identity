export { AuthModuleManifest } from "./manifest";

// Exportações de Componentes
export * from "./components/auth/Login";
export * from "./components/auth/ProtectedRoute";
export * from "./components/auth/SecurityModule";

// Exportações de Provedores e Tipos
export * from "./providers/AuthProvider";
export * from "./types/auth";
export * from "./types/models/user";
export * from "./types/models/rbac";

// Exportações de Serviços Granulares
export { AuthFlowService } from "./services/auth/AuthFlowService";
export { GovernanceService } from "./services/rbac/GovernanceService";
export { InteractionService } from "./services/audit/InteractionService";
export { StorageManager } from "./services/storage/StorageManager";
export { HydrationService } from "./services/hydration/HydrationService";
export { maskUserData, maskUserList } from "./utils/masking";

// Exportação Plug & Play
export { withIdentityModule } from "./plugin";

