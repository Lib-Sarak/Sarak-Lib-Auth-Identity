import { User } from "lucide-react";

// Manifesto de Identidade (Agnóstico - v6.8)
export const AuthModuleManifest = {
    id: "auth-profile",
    label: "Meu Perfil",
    icon: "User",
    category: "Sistema",
    priority: 100
};

export * from "./components/Login"; 
export * from "./components/ProtectedRoute";
export * from "./services/AuthContext";
export * from "./types/auth";
export { default as ChangePasswordModal } from "./components/ChangePasswordModal";
export { AuthIdentityEngine } from './services/AuthIdentityEngine';
