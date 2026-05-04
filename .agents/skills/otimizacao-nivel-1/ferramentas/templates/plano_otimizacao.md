# Plano de Otimização (Nível 1) — [PAGINA / COMPONENTE]

Este plano detalha as otimizações de performance de custo zero que serão aplicadas.

## 🖼️ Ativos Visuais (Imagens e Vídeos)
- [ ] **Conversão:** Converter [NOMES_ARQUIVOS] para `.webp` ou `.avif`.
- [ ] **Lazy Loading:** Aplicar `loading="lazy"` em itens fora da dobra.
- [ ] **Priorização:** Garantir `fetchpriority="high"` na imagem principal (LCP).
- [ ] **Dimensões:** Adicionar `width` e `height` explícitas para evitar CLS.

## 💾 Estratégia de Cache e Dados
- [ ] **SWR:** Implementar cache local para a chamada da API [NOME_API].
- [ ] **Fonts:** Configurar `font-display: swap` no CSS de [NOME_FONTE].

## 📦 Código e Bundle
- [ ] **Dynamic Imports:** Aplicar Code Splitting na rota [ROTA].
- [ ] **Tree Shaking:** Refatorar imports de [NOME_BIBLIOTECA].

---

**Expectativa de Melhora:**
- **Redução de Peso Estimada:** [VALOR] KB.
- **Melhoria esperada no LCP:** [VALOR] s.

⚠️ Confirma para prosseguir com a implementação?
