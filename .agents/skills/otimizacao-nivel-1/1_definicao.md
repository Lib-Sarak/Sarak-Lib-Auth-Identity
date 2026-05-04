# Definição: Otimização de Performance (Nível 1)

## O que é
A skill **Otimização-Nivel-1** é o primeiro nível de maturidade em performance para aplicações web. Ela foca em "Gananhos Rápidos" (Quick Wins) e otimizações técnicas profundas que não exigem orçamentos extras, serviços de terceiros pagos ou redução da qualidade visual que o usuário possa notar.

Esta skill atua diretamente no código-fonte, na configuração de build e na forma como os ativos (assets) são servidos, garantindo que o navegador receba apenas o necessário, no formato mais eficiente possível.

## Objetivo
- Reduzir o **LCP** (Largest Contentful Paint) através de priorização de ativos e compressão.
- Minimizar o **CLS** (Cumulative Layout Shift) garantindo dimensões reservadas para elementos.
- Melhorar o **TBT** (Total Blocking Time) otimizando o carregamento de JS e a hidratação.
- Garantir que o site seja o mais leve possível sem custo operacional adicional.

## Responsabilidades Exclusivas desta Skill
1.  **Auditoria Técnica de Assets:** Identificar imagens em formatos obsoletos (PNG, JPG) e recomendar a conversão para WebP/AVIF.
2.  **Configuração de Lazy Loading:** Implementar estratégias de carregamento sob demanda para imagens e componentes fora da dobra.
3.  **Gestão de Cache de Browser:** Implementar políticas de cache local eficiente (LocalStorage/IndexedDB) e estratégias de revalidação de dados de API.
4.  **Otimização de Fontes:** Configurar `font-display`, pré-conexão e formatos leves (woff2).
5.  **Limpeza de Bundle:** Identificar e remover código morto (Tree Shaking) e aplicar Code Splitting por rota.

## Quando usar
- Ao finalizar o desenvolvimento de uma nova página ou seção do site.
- Quando o relatório de performance (Lighthouse/PageSpeed) indicar notas baixas em Core Web Vitals.
- Como parte do fluxo de "Polimento" antes de um commit de entrega.
