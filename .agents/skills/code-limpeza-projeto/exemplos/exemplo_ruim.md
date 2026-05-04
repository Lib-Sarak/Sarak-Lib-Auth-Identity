# Exemplo Ruim de Limpeza de Projeto

## Cenário
Desenvolvedor quer "limpar tudo" antes do feriado e deleta arquivos por intuição.

---

## Ações de Limpeza (Erradas)

### Erro 1 — Deletar sem verificar referências
❌ O desenvolvedor viu um arquivo `utils_old.py` e assumiu que era lixo. Deletou sem rodar `grep_search`.
- **Impacto:** O arquivo continha uma função helper importada por 5 outros arquivos que o desenvolvedor "esqueceu" que ainda usavam. Sistema quebrou.

### Erro 2 — Deletar suite de testes oficial
❌ O desenvolvedor achou que a pasta `tests/` era apenas para desenvolvimento local e a removeu.
- **Impacto:** O CI/CD falhou e o projeto perdeu sua rede de segurança de longo prazo.

### Erro 3 — Deletar código comentado que tinha nota técnica
❌ O desenvolvedor removeu um bloco comentado que dizia: `// NOTE: reativar quando o backend da Vercel suportar streaming`.
- **Impacto:** Perda de conhecimento técnico e retrabalho futuro quando a funcionalidade puder ser reativada.

### Erro 4 — Não registrar a limpeza
❌ Deletou 10 arquivos e não enviou a lista para a `gsd-registro-sessao`.
- **Impacto:** Os outros membros da equipe não sabem por que os arquivos sumiram e perdem tempo procurando (ou dão restore no que era lixo).
