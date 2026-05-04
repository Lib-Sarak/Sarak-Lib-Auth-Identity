# Definição: Sarak UI Gallery Engine

## O que é
Esta skill é o orquestrador de desenvolvimento para o motor de galeria do Sarak UI-Core. Ela gerencia o ciclo de vida da interface de design, desde a criação de constantes de presets até a implementação de espécimes de alta fidelidade que servem como "Digital Twins" do sistema em produção. 

O foco é garantir que o usuário possa visualizar, testar e aplicar mudanças de design (Temas, Cards, Tipografia, etc.) de forma 100% agnóstica e baseada em manifestos.

## Objetivo
- Expandir a Galeria para suportar todas as 10 categorias de design do Sarak.
- Garantir 100% de sincronia entre a coluna lateral (Design Engine) e os cards de preview.
- Eliminar qualquer vazamento de estilos (CSS Leakage) entre diferentes espécimes usando sandboxing de tokens.

## Responsabilidades Exclusivas desta Skill
1. **Gerenciamento de Presets**: Definir e manter os scripts de constantes (ex: `cards-presets.ts`, `typo-presets.ts`).
2. **Orquestração de Previews**: Implementar os componentes de Galeria (`CardsGallery`, `TypographyGallery`, etc.).
3. **Sincronização de Twin Digital**: Validar se um token alterado na barra lateral é refletido fielmente na preview e vice-versa.

## Quando usar
- Ao iniciar a implementação de uma nova categoria de design na galeria.
- Ao detectar que uma alteração visual na barra lateral não está sendo refletida corretamente na preview.
- Ao refatorar componentes atômicos que precisam de suporte a novos atributos (ex: `data-surface`, `data-card-texture`).

## Estado Atual do Roadmap (v8.5)
- [x] **Categoria 0 (Temas)**: Implementado e Sincronizado.
- [x] **Categoria 1 (Cards & Containers)**: Implementado com suporte a Materiais Industriais e Texturas Atômicas.
- [ ] **Categoria 2 (Tipografia)**: Pendente de implementação de Galeria e Presets.
- [ ] **Categoria 3 (Animações/Kinetic)**: Pendente.
