# Sarak-Lib-Auth-Identity

Módulo essencial de Identidade e Autenticação Base da Biblioteca Sarak. Este módulo fornece a fundação para controle de acesso, persistência de sessão e proteção de rotas.

## 🚀 Funcionalidades
- **Gestão de Sessão:** Login, Logout e persistência de estado.
- **Segurança:** Implementação de JWT (JSON Web Tokens).
- **Provedor de Dados:** Integração nativa com Supabase Auth.
- **Frontend:** Contexto de Autenticação (`AuthContext`) e Guarda de Rotas (`ProtectedRoute`).

## 🛠️ Como Implementar

### Backend (Python)
Instale o pacote:
```bash
pip install sarak-lib-auth-identity
```

### Frontend (React)
Adicione o provedor no topo da sua aplicação:
```tsx
import { AuthProvider } from '@sarak/auth-identity';

function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
}
```

## 🔗 Conexões
- **Sarak-Lib-Shared:** Utiliza os contratos e modelos base de dados.
- **Sarak-Lib-UI-Core:** Consome os tokens de design para os formulários de login.
- **Sarak-Lib-Auth-Management:** Fornece a base de identidade para a edição de perfil.

---
**Desenvolvido por Igor Sarak**
