# Exemplo Bom: Otimização de Performance (Nível 1)

Neste exemplo, transformamos um componente de Hero Banner com imagens pesadas e sem priorização de ativos em um componente otimizado de custo zero.

## Cenário
Componente de Hero Banner com imagem PNG de 2MB e sem dimensões explícitas.

## Antes (Problema)
```jsx
// components/Hero.tsx
export default function Hero() {
  return (
    <section>
      <h1>Bem-vindo!</h1>
      <img src="/hero-banner.png" alt="Banner principal" />
    </section>
  );
}
```
**Impacto:** LCP alto (2MB carregando), CLS alto (layout pula quando a imagem carrega).

---

## Depois (Resultado Otimizado)
```jsx
// components/Hero.tsx
// 1. Imagem convertida para .webp (~300KB)
// 2. Dimensões explícitas (width/height) para evitar CLS
// 3. fetchpriority="high" para LCP (Primeira dobra)
export default function Hero() {
  return (
    <section>
      <h1>Bem-vindo!</h1>
      <img 
        src="/hero-banner.webp" 
        alt="Banner principal" 
        width={1200} 
        height={600}
        fetchpriority="high" 
        style={{ width: '100%', height: 'auto' }}
      />
    </section>
  );
}
```

## Categorias de Otimização Aplicadas:
- **Ativos Visuais:** Conversão para WebP e Redução de Tamanho.
- **Performance Core:** LCP Prioritizado.
- **Estabilidade Visual:** Dimensões para evitar Layout Shift (CLS).
