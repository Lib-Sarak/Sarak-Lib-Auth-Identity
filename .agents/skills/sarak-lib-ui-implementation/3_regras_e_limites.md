# Regras e Limites: Module Onboarding

1. **NUNCA** hardcodeie o registro de componentes via `registerLocalComponent`. Use sempre o `componentMap` injetado no `SarakUIProvider`.
2. **NÃO** ignore o erro 401. Se ocorrer, verifique se o `system.id` no manifesto coincide com o ID técnico do backend.
3. **NUNCA** deixe o `TokenSyncBridge` fora da hierarquia do `AuthProvider`. Ele precisa dos hooks de auth para funcionar.
4. **NÃO** crie CSS ad-hoc para os componentes core. Utilize as variáveis injetadas pelo `Design Engine`.
5. **NUNCA** publique o módulo sem o arquivo `sarak.manifest.json` válido na pasta `src`.
6. **NÃO** altere o `SarakShell` dentro do módulo. Ele é soberano e deve ser consumido como uma "caixa preta" configurável via manifesto.
7. **NUNCA** esqueça de incluir o módulo `personalization` no manifesto; ele é o coração da customização industrial.
