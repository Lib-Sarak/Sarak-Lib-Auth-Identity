# Workflow de Execução: Limpeza Profunda e Sanitização (Elite)

Siga as três fases em ordem.

---

## Fase 1: Limpeza Estrutural, Espacial e de Acesso

**Objetivo:** Remover arquivos irrelevantes, otimizar o tamanho do repositório e corrigir o acesso via `.gitignore`.

### Passo 1.0: Auditoria de Pesos Pesados
1. Use comandos do sistema (`ls -lhS` ou equivalentes via `run_command`) para identificar os **10 maiores arquivos** do diretório.
2. Identifique se são binários desnecessários, dumps de banco de dados ou arquivos de mídia que não deveriam estar no controle de versão.
3. Se forem lixo, adicione-os à lista de remoção no passo HITL.

### Passo 1.1: Detecção de Padrões Irrelevantes
Use `list_dir` e `find_by_name` para localizar itens com os seguintes padrões:
- **Pastas de backup:** `old/`, `backup/`, `legacy/`, `_bkp/`, `v1_trash/`.
- **Scripts de debug local:** `test_api.py`, `check_connection.js`, `debug_script.ts`.
- **Logs e Temporários:** `*.log`, `temp/`, `.tmp`, `.swp`.

### Passo 1.2: Alinhamento com .gitignore
1. Verifique se os padrões de "lixo" encontrados (ex: `.log`, `node_modules/` em subpastas) estão presentes no `.gitignore`.
2. Se não estiverem, prepare uma atualização para o `.gitignore` para evitar que esses arquivos retornem ao repositório após a limpeza.

### Passo 1.3: Apresentação e Confirmação — Fase 1 (HITL)
Apresente ao usuário:
- Lista de arquivos grandes identificados (Top 10).
- Lista de arquivos/pastas órfãos.
- Proposta de atualização do `.gitignore`.

⚠️ **Confirma a remoção estrutural e atualização do ignore?**

---

## Fase 2: Limpeza Analítica e Segurança (Sanitização)

**Objetivo:** Limpar o interior dos arquivos, remover dependências mortas e proteger segredos.

### Passo 2.1: Automação via Linter e Ferramentas
1. Verifique se o projeto possui scripts de lint (`npm run lint` ou similar).
2. Tente executar o linter para identificar automaticamente imports não usados e variáveis mortas.
3. Se houver `depcheck` disponível, execute-o para encontrar pacotes no `package.json` que não estão sendo importados em nenhum lugar.

### Passo 2.2: Varredura de Segredos e Chaves
1. Use `grep_search` para buscar padrões de chaves e segredos em arquivos de código (ex: `API_KEY`, `SECRET`, `PASSWORD`, `DATABASE_URL`).
2. Procure por arquivos `.env` ou `.pem` que possam ter sido commitados por erro.
3. **Ação:** Liste-os para o usuário confirmar a remoção ou substituição por variáveis de ambiente seguras.

### Passo 2.3: Limpeza de Código Morto Manual
1. Para arquivos refatorados, use `grep_search` em nomes de funções suspeitas.
2. Remova blocos de código comentado que não possuam nota explicativa (Regra: Git é o histórico).

### Passo 2.4: Apresentação e Confirmação — Fase 2 (HITL)
Apresente ao usuário:
- Resumo de segredos/chaves encontrados.
- Lista de dependências `package.json` para remoção.
- Resumo de código morto interno identificado.

⚠️ **Confirma a sanitização e limpeza analítica?**

---

## Fase 3: Validação e Registro

1. **Integridade**: Tente rodar o comando de build (`npm run build`, `go build`, etc.) para garantir que nenhuma dependência essencial foi removida.
2. **Registro**: Use a `gsd-registro-sessao` para documentar:
   - Quantidade de espaço liberado (estimativa).
   - Segredos sanitizados.
   - Dependências removidas e código morto eliminado.

---
*Gerado via Skill code-limpeza-projeto (Elite)*
