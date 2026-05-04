# Regras e Limites

1. **NÃO** use estilos hardcoded (style={{...}}) para propriedades que existem como tokens. Se um estilo precisa mudar, ele deve ser uma CSS Variable.
2. **NUNCA** deixe que o clique em um card de preview mude a textura global da atmosfera se o objetivo for apenas mudar o card. Use o token `cardTexture`.
3. **NÃO** misture lógica de diferentes categorias no mesmo arquivo de presets. Mantenha a separação modular (SRP).
4. **NUNCA** ignore o Sandboxing de Provedores. Se os cards de preview começarem a influenciar uns aos outros visualmente, o sandboxing está quebrado.
5. **NÃO** adicione novos atributos `data-*` no CSS sem registrá-los primeiro no `DESIGN_MANIFEST` do `SarakUIProvider`.
6. **NUNCA** implemente uma nova categoria sem antes verificar se os controles correspondentes existem na barra lateral do Design Engine. A sincronia deve ser bidirecional.
