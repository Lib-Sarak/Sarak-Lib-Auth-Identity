# Exemplo Bom de Skill — Skill Completa e Operacional

**Skill de referência:** `skill-padronizacao-codigo`

---

## Por que é uma boa skill

### Definição (`1_definicao.md`)
✅ Responsabilidade única clara: "aplicar ativamente padronização de código"
✅ Objetivo com resultados concretos (lista com bullets)
✅ "Responsabilidades Exclusivas" delimita o escopo claramente
✅ Gatilho de uso preciso: "quando planejamento identificar problemas do tipo [PADRONIZAÇÃO]"

---

### Instruções (`2_instrucoes.md`)
✅ Declara trabalho um arquivo por vez
✅ 5 categorias de ação bem definidas (SRP, guard clauses, erros, dead code, DRY)
✅ Cada categoria tem:
  - O que detectar (sintomas concretos)
  - Como corrigir (ação passo a passo)
  - Exemplo antes/depois em código real
✅ Uso de ferramentas declarado (`view_file`, `grep_search`)
✅ Último passo é sempre o Registro

---

### Regras (`3_regras_e_limites.md`)
✅ Todos os itens iniciam com NÃO ou NUNCA
✅ 7 itens (dentro do limite 5–10)
✅ Item de escopo presente: "NÃO resolva problemas de acoplamento nesta skill"

---

### Validação (`4_validacao.md`)
✅ Organizado por categoria (A, B, C, D, E + Verificação Final)
✅ Todos itens verificáveis com sim/não
✅ Último item pede confirmação do registro para `skill-registro-snapshot`

---

### Exemplos
✅ `exemplo_bom.md`: cenário real, antes (código com 4 violações), depois (código refatorado), lista das categorias corrigidas
✅ `exemplo_ruim.md`: código com todas as violações identificadas com marcação clara

---

### Templates
✅ Nenhum output externo a documentar — os templates são na `skill-registro-snapshot`

---

**Conclusão:** Esta skill pode ser executada por qualquer agente sem intervenção humana constante porque cada passo é preciso, cada categoria tem exemplos e os limites de responsabilidade estão claros.
