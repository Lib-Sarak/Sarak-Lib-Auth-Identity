# Skill: Limpeza de Projeto — Higienização de Pré-Produção (Elite)

## O que é
Esta skill é responsável pela **faxina técnica profunda e sanitização** do projeto antes de uma entrega, deploy ou publicação. Ela garante que a base de código esteja livre de "ruídos de desenvolvimento", segredos expostos e arquivos obsoletos que degradam a qualidade, a segurança e a performance do repositório.

O foco é a remoção cirúrgica de tudo que foi útil durante o desenvolvimento mas que é irrelevante, perigoso ou volumoso demais para a versão final ("Production Ready").

## Objetivo
- Reduzir o tamanho do repositório identificando e removendo arquivos pesados desnecessários.
- Eliminar scripts, pastas órfãs e backups manuais.
- Sanitizar o projeto de segredos (chaves de API, arquivos `.env`) e garantir a integridade do `.gitignore`.
- Remover código morto (comentado ou não referenciado) e dependências não utilizadas no `package.json`.
- Garantir uma base de código profissional, limpa e segura.

## Responsabilidades Exclusivas desta Skill
Esta limpeza é dividida em três eixos obrigatórios:

1.  **Fase 1 (Estrutural e Espacial):** Identificação de arquivos pesados (Top 10), remoção de pastas sem uso e alinhamento do `.gitignore`.
2.  **Fase 2 (Analítica e Segurança):** Remoção de código obsoleto (via Linter ou manual), dependências mortas e sanitização de segredos/chaves expostas.
3.  **Fase 3 (Validação):** Verificação de integridade após limpeza para garantir que o projeto ainda compila e funciona.

## Quando usar
- **Antes de um merge** para a branch `main` ou publicação no GitHub.
- Ao finalizar uma grande refatoração ou transição de arquitetura.
- Periodicamente para manter a higiene e a segurança (auditoria de segredos) do workspace.
- **Nunca** durante uma refatoração ativa — a limpeza deve ser uma etapa isolada e dedicada.

