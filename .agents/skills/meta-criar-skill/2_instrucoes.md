# Workflow de Execução: Criar uma Nova Skill

Siga esta sequência sempre que for criar uma skill do zero. Cada passo gera um arquivo concreto.

---

## Passo 1: Definir o Escopo (Antes de criar qualquer arquivo)

**Objetivo:** Garantir que a skill tem uma responsabilidade única e não duplica outra skill já existente.

Responda as seguintes perguntas antes de criar qualquer arquivo:

1. **Qual é o problema específico que esta skill resolve?**
   - Descreva em uma frase. Se a frase precisar de "e" para conectar dois problemas, a skill está fazendo coisa demais. Divida.

2. **Esta skill já existe ou está parcialmente coberta por outra?**
   - Leia as definições (`1_definicao.md`) de todas as skills existentes antes de criar uma nova.
   - Se houver sobreposição ≥ 70%, expanda a skill existente em vez de criar uma nova.

3. **Qual é o gatilho de uso desta skill?**
   - Defina com precisão quando ela deve ser acionada (ex: "ao detectar acoplamento entre módulos" ou "ao final de toda sessão de trabalho").

4. **Qual skill aciona esta?**
   - Toda skill deve ser acionada por outra (normalmente pelo `skill-planejamento-gsd`) ou pelo usuário explicitamente.

**Só avance para o Passo 2 após responder todas as perguntas acima.**

---

## Passo 2: Criar a Estrutura de Pastas

A estrutura obrigatória de toda skill é:

```
skill-<nome-da-skill>/
├── 1_definicao.md               ← O que é, objetivo e quando usar
├── 2_instrucoes.md              ← Workflow passo a passo (o mais rico dos arquivos)
├── 3_regras_e_limites.md        ← O que NÃO fazer
├── 4_validacao.md               ← Checklist de conclusão
├── exemplos/
│   ├── exemplo_bom.md           ← Demonstração do resultado correto (com antes/depois)
│   └── exemplo_ruim.md          ← Demonstração do erro comum (com análise)
└── ferramentas/
    └── templates/
        └── [template_relevante].md   ← Template(s) que a skill usa ou gera
```

Crie todas as pastas antes de escrever qualquer conteúdo.

---

## Passo 3: Escrever `1_definicao.md`

**Seções obrigatórias:**
- `## O que é` — 2 a 4 parágrafos explicando a skill. Sem bullet points, texto corrido.
- `## Objetivo` — Lista de bullets com os resultados concretos que a skill produz.
- `## Responsabilidades Exclusivas desta Skill` — Lista numerada do que SÓ esta skill faz.
- `## Quando usar` — Lista de situações que disparam o uso desta skill.

**Critério de qualidade:** Um agente que leia apenas `1_definicao.md` deve saber:
- O que a skill faz.
- O que a skill NÃO faz (limite de responsabilidade).
- Em qual momento do processo ela entra.

---

## Passo 4: Escrever `2_instrucoes.md` *(arquivo mais importante)*

**Regras para este arquivo:**

1. **Cada passo deve ser acionável.** O agente deve poder executar o passo sem ambiguidade. "Analise o código" é inaceitável. "Use `view_file` para ler o arquivo X e classifique cada import como interno, externo ou outro módulo" é aceitável.

2. **Inclua exemplos inline para passos complexos.** Se um passo pede uma classificação, formato de output, ou tomada de decisão, mostre o formato esperado dentro do próprio passo.

3. **Para cada categoria de ação, inclua:**
   - O que detectar (sintomas do problema)
   - Como corrigir (ação concreta)
   - Antes/depois (código ou estrutura)

4. **Granularidade dos passos:** Cada passo deve corresponder a uma ação atômica.

5. **Declare a ferramenta usada em cada passo.**

6. **Inclua obrigatoriamente um Passo de HITL (Human in the Loop)** imediatamente antes da primeira ação destrutiva ou mutativa. O formato padrão é:

```markdown
## Passo N: Apresentação e Confirmação do Usuário (HITL)

```
## ✅ Plano de Execução — [Nome da Operação]

**O que será modificado:** [lista de arquivos/componentes]
**Por que:** [justificativa técnica]
**Como:** [método de execução]
**Expectativa de melhora:** [resultado esperado]

⚠️ Confirma para prosseguir?
```

**Regra:** Não execute nenhuma alteração antes de receber confirmação explícita do usuário.
```

**Seções obrigatórias:**
- Cabeçalho indicando que a skill trata **um item de cada vez** (arquivo, módulo, etc.)
- Passos numerados com nomes descritivos (`## Passo 1: [Nome]`)
- **Passo HITL obrigatório** antes de qualquer ação destrutiva ou mutativa
- Último passo sempre é `## Passo N: Registro` — instrui a registrar o resultado para o `gsd-registro-sessao`

---

## Passo 5: Escrever `3_regras_e_limites.md`

**Regras para este arquivo:**

1. Cada item começa com **NÃO** ou **NUNCA** — é uma lista de proibições.
2. Cada proibição deve ter uma justificativa curta (por que é proibido).
3. Mínimo de 5, máximo de 10 itens. Se precisar de mais, a skill provavelmente está fazendo coisas demais.
4. Pelo menos um item deve tratar de escopo: "NÃO saia do escopo desta skill. Se detectar problema de tipo X, registre e passe para a skill Y."

---

## Passo 6: Escrever `4_validacao.md`

**Regras para este arquivo:**

1. Checklist em formato `- [ ]` com itens verificáveis objetivamente.
2. Organize por seções que reflitam as fases de execução da skill.
3. Último item sempre: "As correções realizadas foram registradas para o `skill-registro-snapshot`?"
4. Um agente deve conseguir passar por cada item e responder sim ou não — sem interpretação subjetiva.

---

## Passo 7: Criar os Exemplos

**`exemplos/exemplo_bom.md`:**
- Apresente um cenário real do que a skill trata.
- Mostre o estado **antes** (o problema).
- Mostre o estado **depois** (o resultado da skill aplicada).
- Liste ao final as categorias de correção aplicadas.

**`exemplos/exemplo_ruim.md`:**
- Mostre o estado incorreto (sem a skill).
- Liste cada violação com marcação clara (⚠️ ou comentário).
- Explique ao final por que cada ponto é ruim e qual seria o impacto.

---

## Passo 8: Criar Templates em `ferramentas/templates/`

- Todo output que a skill produz (documento, log, relatório) deve ter um template.
- O template usa campos entre colchetes `[PLACEHOLDER]` para valores variáveis.
- Inclua valores de exemplo em cada campo para guiar o preenchimento.
- Templates devem ser preencháveis por qualquer agente sem consultar a skill inteira.

---

## Passo 9: Verificação Final

Após criar todos os arquivos, aplique o checklist de `4_validacao.md` desta própria skill antes de considerar a nova skill pronta.
