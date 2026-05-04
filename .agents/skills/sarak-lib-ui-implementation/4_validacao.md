# Checklist de Validação: Onboarding

- [ ] A dependência `@sarak/lib-ui-core` está apontando para o repositório correto no `package.json`?
- [ ] O arquivo `src/sarak.manifest.json` existe e contém o `system.id` correto?
- [ ] A variável global `(window as any).__SARAK_SYSTEM__` está sendo definida na inicialização?
- [ ] O `SarakUIProvider` está envolvendo a aplicação e recebendo o `componentMap`?
- [ ] O `TokenSyncBridge` está espelhando os tokens no localStorage (`auth_token` e `sarak_token`)?
- [ ] A função `cleanLocalStorage()` está sendo chamada para limpar lixo de sessões anteriores?
- [ ] O login está funcional e redireciona para o dashboard industrial?
- [ ] A aba de "Personalização" renderiza e as alterações de design (ex: vidro, neon) são persistidas?
