# Instruções Operacionais: Expansão da Galeria

Este workflow deve ser seguido rigorosamente para cada nova categoria de design.

## Passo 1: Definição de Constantes (Presets)
Toda categoria deve ter um arquivo de constantes dedicado em `src/constants/`.
- Nomeie como `[nome]-presets.ts`.
- Siga o padrão de exportar um array de objetos com `id`, `name`, `description` e `tokens`.
- **Regra**: Use apenas nomes de tokens existentes no `DESIGN_MANIFEST`.

## Passo 2: Criação do Componente de Galeria
Crie o componente em `src/features/DesignEngine/Canvas/Galleries/`.
- Nomeie como `[Categoria]Gallery.tsx`.
- Use o padrão de `Sub-Provider Sandboxing`:
  ```tsx
  <UIContext.Provider value={mergedContext}>
      <CardSpecimen />
  </UIContext.Provider>
  ```
- Garanta que cada card de preview esteja isolado para que seus tokens não afetem os cards vizinhos.

## Passo 3: Implementação de Variáveis Locais
Crie uma função `get[Category]Variables` para transformar os tokens do preset em CSS Variables.
- Use o `DESIGN_MANIFEST` como referência para mapear chaves para nomes de variáveis (ex: `borderRadius` -> `--radius-theme`).
- **Importante**: Para texturas, utilize o novo token `cardTexture` para evitar conflitos com a atmosfera global.

## Passo 4: Sincronização com a Barra Lateral
Verifique os arquivos em `src/features/DesignEngine/Sections/`.
1. Identifique a `Section` correspondente (ex: `TypographySection`).
2. Certifique-se de que todos os tokens presentes no seu arquivo de presets tenham um controle (`SliderControl`, `SelectControl`, etc.) correspondente na barra lateral.
3. Se um token novo foi criado (ex: `cardTexture`), adicione-o ao `DESIGN_MANIFEST` no `SarakUIProvider.tsx`.

## Passo 5: Registro e Backup de Sessão
Ao final da implementação de uma categoria:
1. Execute `.\run_all.ps1` para garantir que as mudanças não quebraram o build.
2. Atualize o Roadmap em `1_definicao.md` desta skill.
3. Se o contexto do chat estiver alto, peça ao usuário para iniciar uma nova conversa chamando esta skill.

## Exemplo de Implementação (Padrão Industrial):
Sempre utilize atributos `data-*` no container do espécime para permitir que o motor de CSS aplique materiais e geometrias de forma agnóstica:
```tsx
<div 
    data-surface={preset.tokens.surfaceMaterial}
    data-geometric={preset.tokens.isGeometricCut}
    data-card-texture={preset.tokens.cardTexture}
>
    {/* Conteúdo do Specimen */}
</div>
```
