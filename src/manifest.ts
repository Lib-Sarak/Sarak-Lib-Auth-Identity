/**
 * AuthModuleManifest (v8.1)
 * Extraído para arquivo próprio para evitar dependências circulares.
 */
export const AuthModuleManifest = {
  "contract": "v6.8",
  "id": "sarak-lib-auth-identity",
  "label": "Sovereign Identity",
  "icon": "ShieldCheck",
  "category": "Core Security",
  "baseUrl": "/auth",
  "version": "8.0.0",
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
      "user_role": "/users/{user_id}/role",
      "interactions": "/interactions",
      "roles": "/roles",
      "permissions": "/permissions",
      "mfa_orch": "/",
      "change_password": "/change-password",
      "preferences": "/preferences",
      "oauth_login": "/oauth/{provider}/login",
      "oauth_callback": "/oauth/{provider}/callback"
    }
  },
  "capabilities": {
    "security": {
      "levels": [
        { "id": 10, "label": "USER", "color": "blue" },
        { "id": 50, "label": "ADMIN", "color": "purple" },
        { "id": 100, "label": "MASTER", "color": "gold" }
      ],
      "mfa": { "challengeStatus": "MFA_REQUIRED" },
      "oauth": {
        "enabled": true,
        "display": "full",
        "providers": ["google", "github"]
      },
      "rateLimit": {
        "handleStatus": 429,
        "message": "Muitas tentativas. Tente novamente mais tarde."
      }
    }
  },
  "visualContracts": [
    {
      "id": "security_analytics_stats",
      "type": "STATS",
      "label": "Métricas de Soberania",
      "endpoint": "v1.interactions",
      "tab": "Auditoria",
      "mapping": {
        "total_logins": "Logins (24h)",
        "active_sessions": "Sessões Ativas",
        "blocked_attempts": "Ataques Bloqueados"
      }
    },
    {
      "id": "users_control_center",
      "type": "TABLE",
      "label": "Diretório de Identidades Ativas",
      "endpoint": "v1.users",
      "tab": "Usuários",
      "config": {
        "actions": [
          { "id": "promote", "label": "Promover", "endpoint": "v1.user_role", "method": "PATCH" },
          { "id": "ban", "label": "Bloquear", "endpoint": "v1.users", "method": "DELETE" }
        ],
        "columns": ["username", "email", "role_names", "is_active"]
      },
      "mapping": {
        "username": "Identidade",
        "email": "E-mail Principal",
        "role_names": "Nível / Papel",
        "is_active": "Acesso"
      }
    },
    {
      "id": "rbac_matrix_grid",
      "type": "MANAGEMENT_GRID",
      "label": "Matriz de Papéis e Níveis",
      "tab": "Governança",
      "endpoint": "v1.roles",
      "groupBy": "level",
      "ghostGroups": [
        { "key": 10, "label": "NÍVEL: USER" },
        { "key": 50, "label": "NÍVEL: ADMIN" },
        { "key": 100, "label": "NÍVEL: MASTER" }
      ],
      "mapping": {
        "id": "role_id",
        "title": "name",
        "description": "description",
        "tags": "permission_tags",
        "isActive": "is_active"
      },
      "formMapping": {
        "name": "Nome do Papel",
        "level": "Nível Hierárquico (10-100)",
        "description": "Finalidade do Papel",
        "permission_names": "Regras Aplicadas"
      },
      "config": {
        "allowCreate": true,
        "tagField": "name",
        "tagSource": "v1.permissions"
      }
    },
    {
      "id": "permissions_rule_editor",
      "type": "TABLE",
      "label": "Dicionário de Regras Técnicas (Permissões)",
      "tab": "Governança",
      "endpoint": "v1.permissions",
      "config": {
        "allowCreate": true,
        "columns": ["name", "description"]
      },
      "mapping": {
        "name": "Identificador da Regra",
        "description": "O que esta regra permite?"
      }
    },
    {
      "id": "oauth_sso_config",
      "type": "GRID",
      "label": "Provedores de SSO (OAuth)",
      "tab": "Segurança",
      "endpoint": "v1.interactions",
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
      "endpoint": "v1.mfa_orch"
    },
    {
      "id": "account_security_form",
      "type": "FORM",
      "label": "Gestão de Credenciais",
      "tab": "Minha Conta",
      "endpoint": "v1.change_password",
      "mapping": {
        "current_password": "Senha Atual",
        "new_password": "Nova Senha"
      },
      "actions": [
        { "label": "Atualizar Chave", "endpoint": "v1.change_password", "method": "POST" }
      ]
    }
  ],
  "components": {}
};
