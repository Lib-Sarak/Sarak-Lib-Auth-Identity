import { RBACManager } from "./components/rbac/RBACManager";
import { AuthFlowService } from "./services/auth/AuthFlowService";
import { GovernanceService } from "./services/rbac/GovernanceService";
import { InteractionService } from "./services/audit/InteractionService";

/**
 * Manifesto de Identidade (v7.0 - Granular)
 * Exposição de componentes via Sarak Module Discovery
 */
export const AuthModuleManifest = {
    id: "sarak-lib-auth-identity",
    label: "Sovereign Identity",
    icon: "User",
    category: "Sistema",
    priority: 100,
    components: {
        RBACManager
    }
};

// Exportações de Componentes
export * from "./components/auth/Login"; 
export * from "./components/auth/ProtectedRoute";
export * from "./components/rbac/RBACManager";
export { ChangePasswordModal } from "./components/auth/ChangePasswordModal";

// Exportações de Provedores e Tipos
export * from "./providers/AuthProvider";
export * from "./types/auth";
export * from "./types/models/user";
export * from "./types/models/rbac";

// Exportações de Serviços Granulares
export { AuthFlowService } from "./services/auth/AuthFlowService";
export { GovernanceService } from "./services/rbac/GovernanceService";
export { InteractionService } from "./services/audit/InteractionService";

/**
 * Legacy Support (v6.8)
 * Mantido para evitar quebras em módulos que ainda utilizam o motor unificado.
 */
export const AuthIdentityEngine = {
    ...AuthFlowService,
    getMe: GovernanceService.getMe,
    logInteraction: InteractionService.logInteraction
};
