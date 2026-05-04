# Exemplo Bom: Especialista em Organização de Site

## Cenário
Um site institucional que cresceu e agora possui dezenas de serviços, tornando o menu confuso.

## Antes (O Problema)
- Todos os arquivos na raiz `/`.
- Menu com 15 itens.
- Sem breadcrumbs.
- URLs como `/servico1`, `/servico2`, etc.

## Depois (O Resultado da Skill)
- Estrutura de pastas hierárquica: `/servicos/industriais/manutencao`.
- Menu principal com 5 categorias + submenus.
- Breadcrumbs ativos: `Home > Serviços > Industriais`.
- Organização por abas no painel do cliente para alternar entre "Pedidos", "Faturas" e "Suporte".

### Categorias de Correção Aplicadas:
1. **Hierarquia:** URLs semânticas e lógicas.
2. **Modulariade:** Header e Footer extraídos em componentes.
3. **UX:** Redução da carga cognitiva no menu.
4. **Persistência:** Estado da página mantido na URL.
