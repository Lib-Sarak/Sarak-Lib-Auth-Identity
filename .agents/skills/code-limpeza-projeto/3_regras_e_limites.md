# Regras e Limites — Limpeza de Projeto (Elite)

O que **NÃO** fazer durante o uso desta skill:

---

### 1. NUNCA delete sem verificar referências
Cuidado extremo. Antes de deletar qualquer script ou função, o `grep_search` é obrigatório. Se houver uma única referência viva em código de produção, a deleção é proibida.

### 2. NUNCA exponha segredos em logs
Se encontrar uma chave de API ou senha, **não a escreva por extenso** no relatório final ou log de sessão. Use máscaras (ex: `AKIA...XXXX`). Informe apenas o arquivo e a natureza do segredo.

### 3. NÃO delete arquivos de infraestrutura
Arquivos como `.gitignore`, `docker-compose.yml`, `package.json` ou `requirements.txt` nunca são lixo. Eles podem ser **auditados** (remover conteúdo interno), mas o arquivo em si deve permanecer.

### 4. NÃO misture limpeza com novas funcionalidades
Se encontrar um bug, registre o problema e finalize a limpeza primeiro. A limpeza deve ser uma operação atômica de "apenas deletar".

### 5. NÃO remova dependências sem validação de build
Nunca remova um pacote do `package.json` sem tentar rodar o build do projeto logo em seguida. Ferramentas automáticas podem falhar na detecção de dependências dinâmicas.

### 6. NÃO delete pastas ocultas críticas
Pastas como `.git`, `.github`, `.vscode` ou `.agents` nunca devem ser tocadas.

### 7. NÃO considere a limpeza finalizada sem registro
Toda deleção é uma alteração de estado importante. Deve ser registrada na `gsd-registro-sessao` para fins de auditoria e segurança.

