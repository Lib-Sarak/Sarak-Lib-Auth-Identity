# Template Completo de Skill — Guia de Preenchimento

Use estes templates como base para criar qualquer nova skill.
Cada arquivo da skill tem seu template abaixo com instruções de preenchimento.

---

## Template: `1_definicao.md`

```markdown
# Skill: [Nome Descritivo da Skill]

## O que é
[2 a 4 parágrafos em texto corrido explicando a skill. Descreva o problema que ela resolve, 
como ela age e o que a diferencia de outras skills. NÃO use bullet points nesta seção.]

## Objetivo
- [Resultado concreto 1 que a skill produz]
- [Resultado concreto 2 que a skill produz]
- [Resultado concreto 3 que a skill produz]

## Responsabilidades Exclusivas desta Skill
1. [O que SÓ esta skill faz — não compartilhado com outras]
2. [Limite claro de responsabilidade: o que ela NÃO faz e para quem passa]

## Quando usar
- [Situação específica que dispara o uso desta skill]
- [Gatilho de acionamento pelo skill-planejamento-gsd ou pelo usuário]
```

---

## Template: `2_instrucoes.md`

```markdown
# Workflow de Execução: [Nome da Skill]

Trate **um [item: arquivo / módulo / domínio] por vez**. Não avance sem concluir o atual.

---

## Passo 1: [Nome do Passo]

**Objetivo:** [O que este passo alcança]

1. [Ação atômica com ferramenta declarada: ex: "Use `view_file` para ler..."]
2. [Ação atômica — o que fazer com o resultado]

**Formato esperado do output deste passo:**
[ARQUIVO]: [TIPO] — [descrição]
[ex: src/services/order.ts: [PADRONIZAÇÃO] — função com 60 linhas sem guard clauses]

---

## Passo 2: [Nome do Passo]

**O que detectar:**
- [Sintoma 1 do problema]
- [Sintoma 2 do problema]

**Como corrigir:**
1. [Ação concreta de correção]
2. [Próxima ação]

**Exemplo — Antes:**
\`\`\`[linguagem]
[código com o problema]
\`\`\`

**Exemplo — Depois:**
\`\`\`[linguagem]
[código corrigido]
\`\`\`

---

## Passo N: Registro

Ao finalizar [o item], registre no log da sessão (para uso do `skill-registro-snapshot`):
- [O que deve ser registrado — campos obrigatórios]
```

---

## Template: `3_regras_e_limites.md`

```markdown
# Regras e Limites — [Nome da Skill]

O que **NÃO** fazer durante o uso desta skill:

---

### 1. NÃO [proibição 1]
[Justificativa: por que é proibido e qual o impacto de violar]

### 2. NUNCA [proibição 2]
[Justificativa]

### 3. NÃO misture responsabilidades
Se durante a execução detectar um problema do tipo [X], registre e passe para `[skill responsável]`.
Não tente resolver aqui.

[... mínimo 5, máximo 10 itens]
```

---

## Template: `4_validacao.md`

```markdown
# Checklist de Validação — [Nome da Skill]

Execute este checklist **por [item]** antes de considerar [o item] concluído.

---

## [Fase 1: Nome]
- [ ] [Item verificável com sim/não — objetivo e sem subjetividade]
- [ ] [Item verificável]

## [Fase 2: Nome]
- [ ] [Item verificável]

## Verificação Final
- [ ] [Item de verificação geral]
- [ ] As correções realizadas foram registradas para o `skill-registro-snapshot`?
```

---

## Template: `exemplos/exemplo_bom.md`

```markdown
# Exemplo Bom de [Nome da Skill]

## Cenário
[Descreva o contexto: qual sistema, qual problema, qual módulo/arquivo em foco]

---

## Antes ([estado com problema])

[Mostre código, estrutura de pastas ou documento com o problema]

**Problemas presentes:**
- [⚠️ Descrição do problema 1]
- [⚠️ Descrição do problema 2]

---

## Depois (após execução da skill)

[Mostre o resultado corrigido]

---

**Correções aplicadas:**
- [Categoria A] [Descrição da correção]
- [Categoria B] [Descrição da correção]
```

---

## Template: `exemplos/exemplo_ruim.md`

```markdown
# Exemplo Ruim de [Nome da Skill]

## Cenário
[Descreva o contexto: qual o problema que ocorre sem a skill]

---

## [Estado incorreto]

[Mostre código, estrutura ou decisão incorreta]

**Por que é ruim?**
- [Problema 1 — explicação do impacto]
- [Problema 2 — explicação do impacto]
```
