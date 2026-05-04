# Regras e Limites: Otimização de Performance (Nível 1)

Siga estas normas para garantir que a performance seja melhorada sem impacto negativo.

---

1. **NUNCA** use serviços pagos de CDN ou de transformação de imagem (ex: Cloudinary, Imgix) sem aprovação explícita. O Nível 1 usa apenas ferramentas locais e gratuitas.
2. **NÃO** reduza a qualidade das imagens (`quality < 75`) ou a resolução a ponto de ser perceptível a degradação visual para o olho humano.
3. **NUNCA** remova bibliotecas de terceiros essenciais para o negócio apenas por performance sem consultar o usuário primeiro. Refatore para usar Tree Shaking, se possível.
4. **NÃO** use abreviações crípticas nos nomes dos arquivos otimizados (ex: `img_opt_v1.webp`. Use `hero-banner.webp`).
5. **NUNCA** ignore o **LCP** (Largest Contentful Paint). Toda otimização de imagem na dobra deve ser priorizada.
6. **NÃO** aplique Lazy Loading na imagem principal do site (First Fold). Isso piora a métrica LCP.
7. **NÃO** adicione novos frameworks ou bibliotecas pesadas de terceiros (como bibliotecas grandes de tratamento de imagem em runtime) para resolver problemas simples de performance.
8. **NÃO** saia do escopo desta skill. Se detectar problemas de infraestrutura (servidor, latência de rede), registre-os para a skill `infra-ambiente`.
9. **NUNCA** finalize uma otimização sem garantir que os elementos possuam largura (`width`) e altura (`height`) explícitas no HTML/CSS para evitar Layout Shifts (CLS).
