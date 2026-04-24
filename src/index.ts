/**
 * Manifesto de Identidade (v7.0 - Agnóstico)
 * Sincronizado explicitamente para garantir soberania de descoberta em ambientes hot-reload.
 */
export const AuthModuleManifest = {
  "contract": "v6.8",
  "id": "sarak-lib-auth-identity",
  "label": "Sovereign Identity",
  "icon": "ShieldCheck",
  "category": "Core Security",
  "version": "6.8.0",
  "priority": 0,
  "endpoints": {
    "v1": {
      "manifest": "/module/manifest",
      "login": "/login",
      "refresh": "/refresh",
      "logout": "/logout",
      "register": "/register",
      "me": "/me",
      "users": "/users",
      "interactions": "/interactions",
      "roles": "/roles",
      "permissions": "/permissions",
      "mfa_setup": "/mfa/setup",
      "mfa_enable": "/mfa/enable",
      "mfa_disable": "/mfa/disable",
      "mfa_verify": "/login/mfa",
      "mfa_orch": "/",
      "change_password": "/change-password",
      "preferences": "/preferences",
      "oauth_login": "/oauth/{provider}/login",
      "oauth_callback": "/oauth/{provider}/callback"
    }
  },
  "capabilities": {
    "security": {
      "rateLimit": {
        "handleStatus": 429,
        "message": "Muitas tentativas. Por segurança, aguarde 1 minuto antes de tentar novamente."
      },
      "mfa": {
        "type": "TOTP",
        "challengeStatus": "MFA_REQUIRED",
        "endpoints": {
          "setup": "v1.mfa_setup",
          "enable": "v1.mfa_enable",
          "verify": "v1.mfa_verify"
        }
      },
      "oauth": {
        "enabled": true,
        "display": "full",
        "component": "SocialButton",
        "variant": "sovereign",
        "providers": [
          { "id": "google", "label": "Google", "icon": "Google", "variant": "sovereign" },
          { "id": "github", "label": "GitHub", "icon": "Github", "variant": "glass" }
        ],
        "endpoints": {
          "login": "v1.oauth_login",
          "callback": "v1.oauth_callback"
        },
        "events": {
          "onClick": "auth:oauth_init"
        }
      }
    }
  },
  "visualContracts": [
    {
      "id": "users_directory",
      "type": "TABLE",
      "label": "Diretório de Usuários",
      "endpoint": "v1.users",
      "tab": "Usuários",
      "config": {
        "actions": ["edit"],
        "columns": ["email", "username", "role_names", "is_active"]
      },
      "mapping": {
        "email": "E-mail",
        "username": "Usuário",
        "role_names": "Nível de Acesso",
        "is_active": "Status"
      }
    },
    {
      "id": "rbac_governance_grid",
      "type": "MANAGEMENT_GRID",
      "label": "Gestão de Papéis e Segurança",
      "tab": "Matriz de Acesso",
      "endpoint": "v1.roles",
      "groupBy": "system",
      "mapping": {
        "id": "role_id",
        "title": "name",
        "status": "status",
        "isActive": "is_active",
        "description": "description"
      },
      "formMapping": {
        "name": "Nome do Papel",
        "description": "Descrição da Responsabilidade"
      }
    },
    {
      "id": "account_profile_form",
      "type": "FORM",
      "label": "Configurações de Perfil",
      "tab": "Minha Conta",
      "endpoint": "v1.preferences",
      "mapping": {
        "language": "Idioma de Preferência",
        "notifications": "Receber Notificações (S/N)",
        "theme_preference": "Tema Preferencial"
      },
      "actions": [
        { "label": "Salvar Preferências", "endpoint": "v1.preferences", "method": "PATCH" }
      ]
    },
    {
      "id": "account_password_form",
      "type": "FORM",
      "label": "Alteração de Credenciais",
      "tab": "Minha Conta",
      "endpoint": "v1.change_password",
      "mapping": {
        "current_password": "Senha Atual",
        "new_password": "Nova Senha"
      },
      "actions": [
        { "label": "Atualizar Senha", "endpoint": "v1.change_password", "method": "POST" }
      ]
    },
    {
      "id": "mfa_orchestrator",
      "type": "SECURITY_ORCHESTRATOR",
      "label": "Autenticação em Dois Fatores",
      "tab": "Minha Conta",
      "endpoint": "v1.mfa_orch"
    },
    {
      "id": "identity_activity_chart",
      "type": "CHART",
      "label": "Linha do Tempo de Interações",
      "endpoint": "v1.interactions",
      "tab": "Auditoria",
      "config": {
        "type": "area",
        "color": "indigo"
      }
    }
  ],
  "components": {}
};

// Exportações de Componentes
export * from "./components/auth/Login";
export * from "./components/auth/ProtectedRoute";

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

