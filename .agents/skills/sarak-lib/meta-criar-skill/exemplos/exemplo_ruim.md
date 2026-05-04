# Exemplo Ruim de Skill — Skill Vaga e Inutilizável

**Skill fictícia de referência negativa:** `skill-melhorar-codigo`

---

## Estrutura

```
skill-melhorar-codigo/
└── SKILL.md   ← arquivo único, sem separação de responsabilidades
```

❌ Não segue a estrutura padrão (4 arquivos + exemplos + templates)

---

## Conteúdo do SKILL.md (ruim)

```markdown
# Skill: Melhorar Código

Você é um especialista em código limpo. Quando solicitado, melhore o código
seguindo as melhores práticas. Garanta qualidade e escalabilidade.

- Analise o código
- Faça melhorias onde necessário
- Garanta que está dentro dos padrões
```

---

## Análise das Violações

| Problema | Por que é ruim |
|----------|---------------|
| "Analise o código" | Qual ferramenta? Quais critérios? O que procurar exatamente? |
| "Faça melhorias onde necessário" | "Onde necessário" é subjetivo — cada agente interpretará de forma diferente |
| "Dentro dos padrões" | Que padrões? Não há referência concreta |
| Sem exemplos | O agente não sabe como o resultado correto se parece |
| Sem regras | O agente não sabe o que não deve fazer |
| Sem checklist | O agente não sabe quando a tarefa está concluída |
| Sem delimitação de escopo | O agente pode fazer qualquer coisa em nome de "melhorar" |

---

## Impacto

Um agente executando esta skill vai:
- Fazer refatorações aleatórias sem critério
- Não saber quando parar
- Introduzir mudanças de comportamento acidentalmente
- Não deixar registro de nada
- Produzir resultados inconsistentes a cada execução

**Uma skill ruim é pior do que nenhuma skill** — ela dá falsa sensação de controle.
