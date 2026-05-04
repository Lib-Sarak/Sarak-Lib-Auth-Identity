# Validação: Otimização de Performance (Nível 1)

Use este checklist para garantir a excelência da skill aplicada.

---

### Auditoria de Ativos
- [ ] Todas as imagens acima de 50KB foram convertidas para WebP ou AVIF?
- [ ] As dimensões das imagens foram reduzidas para o tamanho máximo necessário em desktop/mobile?
- [ ] O atributo `loading="lazy"` foi aplicado em todos os elementos abaixo da dobra?
- [ ] Elementos da dobra (`First Fold`) possuém `fetchpriority="high"` e **NÃO** possuem `lazy loading`?

### Cache e Dados
- [ ] Foi implementada uma estratégia de cache de dados (SWR ou similar) para requisições repetitivas?
- [ ] O CSS utiliza `font-display: swap` para fontes de terceiros?
- [ ] As dimensões (`width`/`height`) estão explicitamente definidas para evitar Layout Shift (CLS)?

### Bundle e Código
- [ ] As rotas principais utilizam `dynamic imports` para separar os bundles?
- [ ] Imports de bibliotecas pesadas foram substituídos por imports granulares (Tree Shaking)?
- [ ] Código morto ou comentários de log foram removidos da versão final?

### Registro
- [ ] O plano de otimização foi aprovado pelo usuário (HITL)?
- [ ] Os resultados estimados foram registrados para a skill `gsd-registro-sessao`?
