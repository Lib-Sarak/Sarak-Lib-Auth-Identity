# Workflow de Execução: Otimização de Performance (Nível 1)

Siga este passo a passo para aplicar as otimizações recomendadas sem custo extra.

---

## Passo 1: Auditoria de Ativos (Assets)
**Objetivo:** Identificar o que está pesando no carregamento inicial.

1.  Use `list_dir` e `view_file` para analisar os arquivos de imagem e vídeo no projeto.
2.  **Ação Corretiva:** Recomende a conversão de arquivos de imagem (`PNG`, `JPG`) para `WebP` ou `AVIF` (usando ferramentas locais gratuitas como `Sharp` ou plugins do framework).
3.  **Ação Corretiva:** Aplique o atributo `loading="lazy"` em todas as imagens que não estão na tela inicial (abaixo da dobra).
4.  **Ação Corretiva:** Garanta que a imagem principal (LCP) tenha o atributo `fetchpriority="high"`.

## Passo 2: Estratégia de Cache e Dados
**Objetivo:** Tornar a navegação instantânea.

1.  Analise como os dados são buscados em APIs.
2.  **Ação Corretiva:** Implemente padrões de cache como `SWR` (Stale-While-Revalidate) ou `React Query` com configurações de staleTime agressivas para dados estáticos.
3.  **Ação Corretiva:** Verifique se as fontes estão usando `font-display: swap` no CSS global.

## Passo 3: Limpeza de Bundle e Entrega
**Objetivo:** Reduzir o JavaScript que o navegador precisa processar.

1.  Identifique imports de bibliotecas pesadas.
2.  **Ação Corretiva (Tree Shaking):** Substitua imports padrão por imports nomeados (ex: `import { icon } from 'lib'` em vez de `import lib from 'lib'`).
3.  **Ação Corretiva (Code Splitting):** Verifique se as rotas usam `Dynamic Imports` (ex: `React.lazy` ou `next/dynamic`) para que o navegador só baixe o código da página atual.

## Passo 4: Apresentação e Confirmação do Usuário (HITL)

Antes de aplicar qualquer alteração de código, apresente o plano seguindo este template:

```markdown
## ✅ Plano de Otimização (Nível 1) — [Nome do Componente/Página]

**Otimização de Assets:**
- [x] Converter imagem X para WebP (Redução estimada: ~70%)
- [ ] Aplicar Lazy Loading em imagens secundárias

**Performance de Dados:**
- [ ] Implementar cache SWR para a lista de [Entidade]
- [ ] Configurar font-display: swap

**Código e Bundle:**
- [ ] Aplicar Code Splitting na rota /exemplo

⚠️ Confirma a aplicação dessas otimizações de Custo Zero?
```

## Passo 5: Implementação e Registro
Após confirmação, aplique as mudanças e use a skill `gsd-registro-sessao` para documentar a melhoria esperada.
