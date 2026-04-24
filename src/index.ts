import { RBACManager } from "./components/RBACManager";

// Manifesto de Identidade (Agnóstico - v6.8)
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

export * from "./components/Login"; 
export * from "./components/ProtectedRoute";
export * from "./components/RBACManager";
export * from "./services/AuthContext";
export * from "./types/auth";
export { default as ChangePasswordModal } from "./components/ChangePasswordModal";
export { AuthIdentityEngine } from './services/AuthIdentityEngine';
