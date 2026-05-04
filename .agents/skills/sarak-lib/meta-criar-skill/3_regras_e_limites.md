# Regras e Limites — Criar Skills

O que **NÃO** fazer ao criar uma nova skill:

---

### 1. NÃO crie uma skill sem antes verificar se já existe uma similar
Leia os `1_definicao.md` de todas as skills existentes. Se a sobreposição for ≥ 70%, expanda a existente. Skills redundantes fragmentam o sistema e criam conflitos de responsabilidade.

### 2. NÃO crie uma skill que faz mais de uma coisa
Se a definição precisar de "e" para descrever o que a skill faz, ela tem escopo demais. Divida. Cada skill tem responsabilidade única.

### 3. NÃO escreva instruções vagas no `2_instrucoes.md`
Frases como "analise o código", "verifique se está correto" ou "faça as melhorias necessárias" são proibidas. Cada passo deve indicar qual ferramenta usar, qual formato de output produzir e qual critério de decisão aplicar.

### 4. NÃO omita os exemplos
`exemplos/exemplo_bom.md` e `exemplos/exemplo_ruim.md` são **obrigatórios**. Uma skill sem exemplos não pode ser considerada completa — o exemplo é onde a teoria vira prático.

### 5. NÃO omita os templates
Se a skill produz qualquer output (documento, log, relatório, arquivo de configuração), deve existir um template correspondente em `ferramentas/templates/`. Um agente não deve precisar inventar o formato do output.

### 6. NÃO crie checklists subjetivos no `4_validacao.md`
Cada item do checklist deve ser verificável com sim/não objetivo. "O código está limpo?" é inaceitável. "Todas as funções têm menos de 40 linhas?" é aceitável.

### 7. NÃO considere a skill pronta sem passar pelo checklist de `4_validacao.md` desta própria skill
Toda skill nova deve ser validada contra o checklist de qualidade desta skill antes de ser registrada como operacional.

### 8. NÃO copie o conteúdo de uma skill existente para criar outra
Se duas skills compartilham conteúdo, o conteúdo compartilhado deve ser extraído para a skill mais abrangente, não duplicado.
