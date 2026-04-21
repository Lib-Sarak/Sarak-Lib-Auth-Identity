import { User } from "lucide-react";

// Manifesto de Identidade (Agnóstico - v5.6)
export const AuthModuleManifest = {
    id: "auth-profile",
    label: "Meu Perfil",
    icon: "User",
    category: "Sistema",
    priority: 100
};


export * from "./Login"; 
export * from "./ProtectedRoute";
export * from "./AuthContext";
export { default as ChangePasswordModal } from "./ChangePasswordModal";export { AuthIdentityEngine } from './AuthIdentityEngine';
