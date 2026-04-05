import { registerSarakModule } from "@sarak/lib-shared";
import { User } from "lucide-react";

// Auto-Initialization (P&P Sovereign)
registerSarakModule({
    id: "auth-profile",
    label: "Meu Perfil",
    icon: "User",
    category: "Sistema",
    component: null // Componente será carregado dinamicamente pelo Framework
});

export * from "./Login"; 
export * from "./ProtectedRoute";
export * from "./AuthContext";
export { default as ChangePasswordModal } from "./ChangePasswordModal";export { AuthIdentityEngine } from './AuthIdentityEngine';
