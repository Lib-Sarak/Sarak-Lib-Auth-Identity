/**
 * AuthModuleManifest (v9.0)
 * Sincronização Soberana: Níveis Hierárquicos e Matriz de Permissões (v10.0)
 */
export interface VisualContract {
  id: string;
  type: string;
  label: string;
  endpoint: string;
  tab: string;
  requiredPermission?: string;
  mapping?: Record<string, string>;
  config?: any;
  groupBy?: string;
  ghostGroups?: any[];
  formMapping?: Record<string, string>;
  actions?: any[];
}

export const AuthModuleManifest: {
  contract: string;
  id: string;
  label: string;
  icon: string;
  category: string;
  baseUrl: string;
  version: string;
  priority: number;
  endpoints: any;
  capabilities: any;
  visualContracts: VisualContract[];
} = {
  "contract": "v10.0",
  "id": "sarak-lib-auth-identity",
  "label": "Identidade Soberana",
  "icon": "ShieldCheck",
  "category": "Core Security",
  "baseUrl": "/auth",
  "version": "9.0.0",
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
      "user_detail": "/users/{user_id}",
      "user_role": "/users/{user_id}/role",
      "interactions": "/interactions",
      "roles": "/roles",
      "permissions": "/permissions",
      "mfa_orch": "/",
      "change_password": "/change-password",
      "preferences": "/preferences",
      "password_reset_request": "/password-reset/request",
      "password_reset_confirm": "/password-reset/confirm",
      "oauth_login": "/oauth/{provider}/login",
      "oauth_callback": "/oauth/{provider}/callback",
      "oauth_status": "/oauth/status",
      "sessions_revoke": "/sessions/{session_id}",
      "toggle_role_permission": "/roles/{role_id}/toggle-permission"
    }
  },
  "capabilities": {
    "security": {
      "mfa": { "challengeStatus": "MFA_REQUIRED" },
      "oauth": {
        "enabled": true,
        "display": "full",
        "providers": ["google", "github"]
      },
      "rateLimit": {
        "handleStatus": 429,
        "message": "Muitas tentativas. Tente novamente mais tarde."
      },
      "policy": {
        "idleTimeoutMinutes": 60,
        "refreshTokenDays": 1
      }
    }
  },
  "visualContracts": [
    {
      "id": "security_analytics_stats",
      "type": "STATS",
      "label": "Métricas de Soberania",
      "endpoint": "v1.interactions",
      "tab": "Monitoramento",
      "requiredPermission": "rbac:view",
      "actions": [],
      "mapping": {
        "total_logins": "Logins (24h)",
        "active_sessions": "Sessões Ativas",
        "blocked_attempts": "Ataques Bloqueados"
      },
      "config": {
        "clickable": true,
        "detailMappings": {
          "total_logins": "audit_logins_table",
          "active_sessions": "audit_sessions_table",
          "blocked_attempts": "audit_attacks_table"
        }
      }
    },
    {
      "id": "audit_sessions_table",
      "type": "TABLE",
      "label": "Sessões Ativas em Tempo Real",
      "endpoint": "v1.interactions",
      "tab": "Monitoramento",
      "requiredPermission": "rbac:view",
      "config": {
        "params": { "scope": "sessions" },
        "columns": ["username", "ip_address", "user_agent", "created_at"],
        "actions": [
          { 
            "id": "revoke", 
            "label": "Revogar Acesso", 
            "endpoint": "v1.sessions_revoke", 
            "method": "DELETE",
            "confirm": "Deseja realmente derrubar esta sessão?"
          }
        ]
      },
      "mapping": {
        "username": "Usuário",
        "ip_address": "Endereço IP",
        "user_agent": "Dispositivo",
        "created_at": "Início da Sessão"
      }
    },
    {
      "id": "audit_logins_table",
      "type": "TABLE",
      "label": "Histórico de Acessos (Logins)",
      "endpoint": "v1.interactions",
      "tab": "Monitoramento",
      "requiredPermission": "rbac:view",
      "actions": [],
      "config": {
        "params": { "scope": "logins" },
        "columns": ["username", "ip", "status", "created_at"]
      },
      "mapping": {
        "username": "Identidade",
        "ip": "Origem IP",
        "status": "Resultado",
        "created_at": "Horário"
      }
    },
    {
      "id": "audit_attacks_table",
      "type": "TABLE",
      "label": "Incidentes e Bloqueios",
      "endpoint": "v1.interactions",
      "tab": "Monitoramento",
      "requiredPermission": "rbac:view",
      "actions": [],
      "config": {
        "params": { "scope": "attacks" },
        "columns": ["ip", "reason", "created_at"]
      },
      "mapping": {
        "ip": "Origem Suspeita",
        "reason": "Motivo do Bloqueio",
        "created_at": "Data/Hora"
      }
    },
    {
      "id": "users_control_center",
      "type": "TABLE",
      "label": "Diretório de Identidades Ativas",
      "endpoint": "v1.users",
      "tab": "Identidades",
      "requiredPermission": "user:manage",
      "config": {
        "actions": [
          { 
            "id": "promote", 
            "label": "Ajustar Papel", 
            "endpoint": "v1.user_role", 
            "method": "PATCH",
            "form": {
              "fields": [
                { "name": "role_id", "label": "Novo Papel", "type": "SELECT", "source": "v1.roles" }
              ]
            }
          },
          { "id": "ban", "label": "Desativar", "endpoint": "v1.user_detail", "method": "DELETE", "confirm": "Deseja desativar este usuário?" }
        ],
        "columns": ["username", "email", "role_names", "is_active"]
      },
      "mapping": {
        "username": "Identidade",
        "email": "E-mail Principal",
        "role_names": "Papéis",
        "is_active": "Status"
      }
    },
    {
      "id": "rbac_expandable_matrix",
      "type": "EXPANDABLE_MATRIX",
      "label": "Matriz de Governança (Papéis x Permissões)",
      "tab": "Governança",
      "endpoint": "v1.roles",
      "requiredPermission": "rbac:manage",
      "config": {
        "subItemsEndpoint": "v1.permissions",
        "toggleEndpoint": "v1.toggle_role_permission",
        "mappingField": "permission_names",
        "subItemIdentifier": "name",
        "parentLabel": "name",
        "parentDescription": "description"
      }
    },
    {
      "id": "permissions_rule_editor",
      "type": "TABLE",
      "label": "Dicionário de Regras Técnicas (Permissões)",
      "tab": "Governança",
      "endpoint": "v1.permissions",
      "requiredPermission": "rbac:manage",
      "actions": [
        { 
          "id": "create", 
          "label": "Nova Regra", 
          "endpoint": "v1.permissions", 
          "method": "POST",
          "form": {
            "fields": [
              { "name": "name", "label": "Identificador (ex: user:manage)", "type": "TEXT" },
              { "name": "description", "label": "Descrição", "type": "TEXT" }
            ]
          }
        }
      ],
      "config": {
        "allowCreate": true,
        "columns": ["name", "description"]
      },
      "mapping": {
        "id": "id",
        "name": "Identificador da Regra",
        "description": "O que esta regra permite?"
      }
    }
,
    {
      "id": "oauth_sso_config",
      "type": "CARD_GRID",
      "label": "Provedores de SSO (OAuth)",
      "tab": "Segurança",
      "endpoint": "v1.oauth_status",
      "requiredPermission": "rbac:manage",
      "actions": [],
      "mapping": {
        "title": "Google / GitHub",
        "status": "Configurado"
      }
    },
    {
      "id": "mfa_vault",
      "type": "SECURITY_ORCHESTRATOR",
      "label": "Configuração de MFA Soberano",
      "tab": "Segurança",
      "endpoint": "v1.mfa_orch",
      "actions": [],
      "mapping": {}
    }
  ],
  "components": {}
};
