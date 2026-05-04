# Workflow de Execução: Lib Commit

Realize o processo para **um módulo Sarak por vez**. Não tente agrupar múltiplos módulos em um único comando de commit.

---

## Passo 0: Auditoria Global (Opcional, mas Recomendado)

**Objetivo:** Ter uma visão clara de todos os módulos que precisam de atenção.

1. Execute o script de auditoria a partir da raiz da Biblioteca:
   ```powershell
   powershell -ExecutionPolicy Bypass -File ".agents/skills/lib-commit/scripts/audit_repos.ps1"
   ```

## Passo 1: Identificação e Navegação

**Objetivo:** Garantir que estamos operando no contexto correto do repositório.

1. Identifique o diretório do módulo (ex: `Sarak-Lib-Shared`).
2. Use `run_command` para navegar até o diretório:
   ```powershell
   cd path/to/Sarak-Lib-Shared
   ```
   *(Nota: O agente deve gerenciar o contexto do diretório internamente em cada chamada de ferramenta).*

**Formato esperado:**
[MODULO]: Sarak-Lib-XYZ identificado em [CAMINHO]

---

## Passo 2: Preparação do Stage

**Objetivo:** Adicionar apenas as mudanças pertinentes ao módulo.

1. Use `run_command` para verificar arquivos alterados no diretório atual:
   ```powershell
   git status
   ```
2. Adicione os arquivos ao stage:
   ```powershell
   git add .
   ```

---

## Passo 3: Commit e Push Individual

**Objetivo:** Registrar as mudanças e subir para o repositório remoto específico.

1. Realize o commit com uma mensagem clara (se não houver padrão definido, use `feat: update [module name]` ou similar):
   ```powershell
   git commit -m "feat: sincronização de mudanças do módulo"
   ```
2. Realize o push obrigatoriamente para a branch `main`:
   ```powershell
   git push origin main
   ```

---

## Passo N: Registro

Ao finalizar o push, registre no log da sessão:
- Nome do módulo: `Sarak-XYZ`
- Status: `Push concluído para main`
- Arquivos afetados: [Lista de arquivos]
