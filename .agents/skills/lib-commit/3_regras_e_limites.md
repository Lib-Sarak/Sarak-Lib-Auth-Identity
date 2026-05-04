# Regras e Limites — Lib Commit

O que **NÃO** fazer durante o uso desta skill:

---

### 1. NÃO realizar commits globais
**Proibição:** Fazer `git add .` na raiz do projeto (Biblioteca) que inclua mudanças em múltiplos diretórios `Sarak-*`.
**Justificativa:** Cada módulo é um repositório independente. Commits globais falharão na sincronização individual de cada repo.

### 2. NUNCA fazer push para branches diferentes de `main`
**Proibição:** Usar `git push origin [qualquer-outra-branch]`.
**Justificativa:** A política do projeto exige sincronização direta e exclusiva com a branch `main` para os módulos de biblioteca.

### 3. NÃO misturar responsabilidades
Se durante o processo de commit você detectar bugs lógicos ou necessidade de refatoração, registre o problema e passe para a skill de desenvolvimento pertinente. O foco aqui é estritamente **sincronização de estado**.

### 4. NÃO ignorar erros de remote
Se o `git push` retornar erro de conflito ou permissão, NÃO force o push (`--force`). Pare a execução e peça orientação ao usuário.

### 5. NÃO realizar commit sem arquivos
Se o `git status` indicar que não há mudanças no diretório `Sarak-*` selecionado, aborte o fluxo para aquele módulo imediatamente.
