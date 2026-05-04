# Exemplo Ruim: Otimização de Performance (Nível 1)

Neste exemplo, ignoramos todas as técnicas de performance básica, resultando em um site lento e com excesso de deslocamento de layout.

## Cenário
Componente de galeria com múltiplas imagens PNG sem dimensões ou carregamento preguiçoso.

## Estado Incorreto (Violações)
```jsx
// components/Gallery.tsx
export default function Gallery() {
  return (
    <div className="grid">
      {/* ⚠️ Erro 1: Formato .png pesado sem conversão */}
      {/* ⚠️ Erro 2: Sem width/height (Gera CLS) */}
      {/* ⚠️ Erro 3: Sem lazy loading (Carrega todas de uma vez) */}
      <img src="/foto1.png" alt="Foto 1" />
      <img src="/foto2.png" alt="Foto 2" />
      <img src="/foto3.png" alt="Foto 3" />
      <img src="/foto4.png" alt="Foto 4" />
    </div>
  );
}
```

## Análise das Violações
- **Peso de Carregamento:** Cada imagem .png pode ter 1MB-5MB. O navegador tentará baixar todas simultaneamente, saturando a rede do usuário.
- **Instabilidade Visual:** Sem dimensões de reservadas, a página "pula" conforme as imagens terminam de baixar, o que aumenta o índice de CLS e irrita o usuário.
- **Desperdício de Recursos:** Imagens que o usuário ainda não viu (fora da dobra) estão sendo carregadas, atrasando a renderização dos elementos principais.
- **Impacto no Negócio:** Usuários em conexões lentas (3G/4G) provavelmente abandonarão o site antes que ele carregue completamente.
