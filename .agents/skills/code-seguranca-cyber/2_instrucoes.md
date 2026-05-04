# Workflow de Execução: Auditoria de Segurança Sarak

Esta skill opera em modo de auditoria episódica, garantindo o estado "Zero Vulnerabilidade" e saindo sem deixar rastros.

---

## Passo 1: Preparação do Ambiente de Auditoria

**Objetivo:** Instalar ferramentas de varredura temporárias.

1. Identifique o tipo de projeto (Node, React, etc.).
2. Use `run_command` para instalar as ferramentas de suporte:
   ```powershell
   npm install --save-dev eslint-plugin-security audit-ci
   ```
3. Verifique se o `npm audit` está disponível.

---

## Passo 2: Varredura Inicial e Relatório de Baseline

**Objetivo:** Capturar o estado atual de vulnerabilidades (Métricas Iniciais).

1. Execute scanner de dependências: `npm audit --json > initial-audit.json`.
2. Analise o código estaticamente (SAST): Busque por padrões como `eval(`, `dangerouslySetInnerHTML`, `process.env.SECRET` expostos.
3. Use o template `./ferramentas/templates/relatorio_seguranca.md` para preencher as **Vulnerabilidades Iniciais** e **Métricas Iniciais** (Total de alertas, nível de risco).

---

## Passo 3: Auditoria Manual de Lógica Sensível

**Objetivo:** Validar pontos que ferramentas automáticas podem falhar.

1. Revise configurações de **CORS** e **CSP**.
2. Verifique se cookies sensíveis possuem as flags `HttpOnly` e `Secure`.
3. Garanta que todas as rotas da API possuam validação de entrada (Sanitização contra Injeção).

## Passo 4: Auditoria Dinâmica e "Smoke Test" (DAST)
**Objetivo:** Validar se as proteções estão ativas no ambiente de execução.

1. Se o site estiver rodando localmente/staging, use `curl -I [URL]` para verificar os headers HTTP.
2. Valide a presença de:
   - `Content-Security-Policy`
   - `Strict-Transport-Security` (HSTS)
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY` ou `SAMEORIGIN`
3. Execute um teste de injeção simples via URL ou Form (em ambiente seguro) para garantir que o backend rejeita payloads maliciosos.

## Passo 5: Plano de Correção e Confirmação (HITL)

```markdown
## ✅ Plano de Segurança — Relatório de Auditoria
**Vulnerabilidades Detectadas:** [Lista resumida]
**Nível de Risco Médio:** [Baixo/Médio/Alto/Crítico]
**Proposta de Correção:** [Explique o que será modificado em cada arquivo]
**Impacto Esperado:** [Redução de CVEs para zero, aumento de segurança de headers]

⚠️ Confirma a execução dos patches de segurança?
```

---

## Passo 5: Execução dos Patches e Refatoração

1. Corrija as dependências: `npm audit fix`.
2. Refatore códigos inseguros conforme identificado no Passo 2 e 3.
3. Migre qualquer segredo detectado para arquivos `.env` e atualize o `.gitignore`.

---

## Passo 6: Varredura de Verificação e Métricas Finais

1. Execute uma nova varredura completa: `npm audit`.
2. Atualize o relatório em `./ferramentas/templates/relatorio_seguranca.md` com as **Métricas Finais** e a lista completa do **Que Foi Modificado**.

---

## Passo 7: Sanitização de Auditoria ("Ghost Mode")

**Objetivo:** Remover ferramentas e rastros de auditoria.

1. Desinstale as ferramentas temporárias:
   ```powershell
   npm uninstall eslint-plugin-security audit-ci
   ```
2. Remova logs de auditoria temporários (ex: `initial-audit.json`).
3. Remova quaisquer comentários de debug de segurança do código.

---

## Passo 8: Registro Final

Instrua o registro da conclusão para o `gsd-registro-sessao`, anexando o Relatório de Segurança finalizado.
