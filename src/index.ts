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
export * from "./AuthContext"; 
export * from "./ProtectedRoute";
export * from "./ChangePasswordModal";