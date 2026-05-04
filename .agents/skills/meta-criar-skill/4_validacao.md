# Checklist de Validação — Criar Skills

Aplique este checklist em toda skill recém-criada **antes** de considerá-la operacional.

---

## Escopo e Unicidade
- [ ] A skill tem responsabilidade única (definível em uma frase sem "e")?
- [ ] As skills existentes foram consultadas e não há sobreposição ≥ 70%?
- [ ] A skill tem um gatilho de uso claramente definido (quando ela é acionada)?
- [ ] Está documentado qual skill a aciona?

## Estrutura de Arquivos
- [ ] A pasta da skill segue a nomenclatura `skill-<nome-em-kebab-case>`?
- [ ] Existem exatamente os arquivos: `1_definicao.md`, `2_instrucoes.md`, `3_regras_e_limites.md`, `4_validacao.md`?
- [ ] A pasta `exemplos/` existe com `exemplo_bom.md` e `exemplo_ruim.md`?
- [ ] A pasta `ferramentas/templates/` existe com pelo menos um template?

## Qualidade do `1_definicao.md`
- [ ] Contém as seções: O que é / Objetivo / Responsabilidades Exclusivas / Quando usar?
- [ ] Um agente que leia apenas este arquivo sabe o que a skill faz e o que ela não faz?

## Qualidade do `2_instrucoes.md` *(mais crítico)*
- [ ] Cada passo é acionável sem ambiguidade (especifica ferramenta, formato de output, critério)?
- [ ] Passos complexos têm exemplos inline do formato esperado?
- [ ] Para cada categoria de ação: o que detectar, como corrigir e exemplo antes/depois estão presentes?
- [ ] O último passo é sempre o Registro para o `skill-registro-snapshot`?
- [ ] A instrução indica que a skill trata um item por vez?

## Qualidade do `3_regras_e_limites.md`
- [ ] Todos os itens começam com NÃO ou NUNCA?
- [ ] Cada proibição tem justificativa?
- [ ] Há entre 5 e 10 itens?
- [ ] Pelo menos um item delimita o escopo (o que fazer quando um problema de outra skill for detectado)?

## Qualidade do `4_validacao.md`
- [ ] Todos os itens são verificáveis com sim/não objetivo (sem subjetividade)?
- [ ] O último item pergunta se o resultado foi registrado para o `skill-registro-snapshot`?

## Qualidade dos Exemplos
- [ ] `exemplo_bom.md` tem: cenário, estado antes, estado depois e lista de correções aplicadas?
- [ ] `exemplo_ruim.md` tem: o estado incorreto, marcação das violações e análise do impacto?
- [ ] Os exemplos são realistas (não triviais demais nem complexos demais)?

## Qualidade dos Templates
- [ ] Existe template para cada output que a skill produz?
- [ ] Os campos do template usam `[PLACEHOLDER]` com exemplos de valor?
- [ ] O template pode ser preenchido sem consultar a skill inteira?
