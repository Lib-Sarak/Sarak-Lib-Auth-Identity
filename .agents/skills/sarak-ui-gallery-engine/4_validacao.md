# Checklist de Validação: Sarak Gallery Engine

## Fase de Implementação
- [ ] O arquivo de presets foi criado em `src/constants/`?
- [ ] O componente de galeria utiliza `UIContext.Provider` para isolamento?
- [ ] Todos os tokens do preset existem no `DESIGN_MANIFEST`?
- [ ] O motor de CSS (`sarak-base.css`) possui suporte para os atributos `data-*` usados?

## Fase de Sincronização
- [ ] Ao clicar em um card da galeria, os controles na barra lateral são atualizados corretamente?
- [ ] Ao mover um slider na barra lateral, a mudança é refletida nos cards da galeria?
- [ ] As texturas dos cards estão independentes da textura global da atmosfera?

## Fase de Qualidade Industrial (v8.5)
- [ ] Os espécimes possuem o fundo de teste de estresse (checkerboard) para validar transparência?
- [ ] O z-index das camadas de atmosfera interna do card está correto (frente ao fundo, atrás do conteúdo)?
- [ ] O componente consome a skill `@sarak-ui-core-specialist` para validação de contratos visuais?
