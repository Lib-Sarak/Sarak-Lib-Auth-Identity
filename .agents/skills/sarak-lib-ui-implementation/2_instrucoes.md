# Instruções Operacionais: Onboarding Sarak v10.0

Este workflow transforma um projeto comum em um módulo soberano Sarak. Execute um item de cada vez.

## Passo 1: Preparação do Ambiente
1. Adicione a biblioteca ao `package.json`: `"@sarak/lib-ui-core": "git+https://github.com/Lib-Sarak/Sarak-Lib-UI-Core.git"`.
2. Execute `npm install`.
3. Verifique se o projeto utiliza `AuthProvider` do `Sarak-Lib-Auth-Identity`.

## Passo 2: Criação do DNA do Módulo (Manifesto)
1. Crie o arquivo `src/sarak.manifest.json`.
2. Utilize o template de manifesto industrial.
3. **IMPORTANTE:** O `system.id` deve ser idêntico ao esperado pelo servidor de autenticação para evitar erros 401.

## Passo 3: Configuração da Soberania (Entry Point)
No arquivo `main.tsx` ou `App.tsx`:
1. Importe `sarakManifest` do JSON criado.
2. Defina `(window as any).__SARAK_SYSTEM__ = sarakManifest.system.id`.
3. Implemente a estrutura `AppContent` para consumir hooks de autenticação.
4. Envolva a aplicação no `SarakUIProvider`.

## Passo 4: Sincronização de Autenticação (HITL)
Implemente o `TokenSyncBridge` dentro do `SarakUIProvider`. Este componente deve:
- Monitorar mudanças no token do `AuthProvider`.
- Espelhar o token para as chaves `auth_token` e `sarak_token` no localStorage.
- Fornecer o `userId` para o motor.

## Passo 5: Mapeamento de Componentes
1. Crie um objeto `componentMap`.
2. Associe as chaves definidas no manifesto (módulos) aos componentes React reais do projeto.
3. Passe este mapa para o `SarakUIProvider`.

## Passo 6: Higiene e Validação
1. Adicione a chamada `cleanLocalStorage()` antes da inicialização do React.
2. Verifique no console se o `Discovery Engine` carregou os módulos via manifesto.
3. Valide se a aba de "Personalização" aparece e salva os estados de design no banco.

## Passo 7: Apresentação e Confirmação (HITL)
Apresente o resumo da integração ao usuário seguindo este formato:

```markdown
## ✅ Onboarding Concluído — [Nome do Módulo]
**ID do Sistema:** [system.id]
**Módulos Registrados:** [lista de módulos]
**Auth Sync:** [Status da ponte de token]
**Design Engine:** v10.0 Sovereign (Industrial)
```
⚠️ Deseja realizar um teste de login e renderização?
```
