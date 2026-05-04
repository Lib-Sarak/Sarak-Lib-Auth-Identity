# Workflow de Execução: Especialista em Organização de Site

Siga estes passos para construir uma arquitetura modular e escalável.

---

## Passo 1: Mapeamento de Hierarquia
**Objetivo:** Definir como a informação será distribuída.

1. Analise os requisitos do usuário e determine as seções principais.
2. Defina a árvore de rotas seguindo obrigatoriamente a estrutura hierárquica de diretórios (como em um PC):
   - Raiz -> Aba -> Subaba -> Sub-subaba.
   - Exemplo: `/configuracoes/seguranca/autenticacao-dois-fatores`.
3. Garanta que cada nível da URL tenha um propósito lógico e reflita o "caminho de pastas" do site, permitindo navegação semântica.

## Passo 2: Decisão de Organização Visual (Abas vs. Páginas)
**Objetivo:** Escolher a melhor UX para o cenário atual.

1. **Pergunte ao usuário:** "Deseja a organização geral por Abas (Tabs) para alternar rápido entre seções ou Páginas Padrão (Full Reload)?"
2. **Critério de Decisão:**
   - **Abas:** Melhor para dados densos e relacionados (ex: Perfil do Usuário, Painéis de ERP). Máximo de 10 abas. 
     - *Regra SEO:* Use rotas semânticas de caminho (Ex: `/perfil/seguranca`) em vez de hashes. Isso garante melhor indexação pela skill `site-especialista-seo-geo`.
     - *Linkability:* Utilize o sistema de roteamento do framework (ex: App Router no Next.js) para que cada aba tenha sua própria URL limpa. Evite hashes (#) para navegação principal.
   - **Páginas:** Melhor para conteúdos distintos (ex: Blog, Sobre, Contato). Garanta que cada nova página atualize o `sitemap.xml` da skill de SEO.

## Passo 3: HITL de Metadados (Título e Ícone)
**Objetivo:** Personalizar a identidade do site na aba do navegador.

1. **Pergunte ao usuário:** "Qual será o nome (Título) e o ícone (Favicon) que aparecerão na aba do navegador?"
2. Garanta que o ícone sugerido ou fornecido seja claro e em formato compatível (`.ico` ou `.png` 32x32).
3. Configure o título da página inicial para ser descritivo e amigável para SEO.

## Passo 4: Modularização Sarak
**Objetivo:** Eliminar código morto e duplicado.

1. Identifique seções repetitivas (Header, Footer, Navbar, Cards).
2. Extraia-as em arquivos separados. 
3. Siga o princípio SRP (Single Responsibility): Um componente, uma função.
4. Garanta que componentes de UI não possuam lógica de negócio acoplada (use injeção de dependência ou props).

## Passo 4: Auditoria de Acessibilidade (a11y)
**Objetivo:** Garantir que o site seja inclusivo.

1. Valide o uso de **HTML Semântico** (`<main>`, `<nav>`, `<section>`, `<article>`).
2. Garanta que todas as imagens possuam atributo `alt` descritivo.
3. Verifique se elementos interativos (botões, links) possuem **Aria-labels** quando o texto visual não for suficiente.
4. Garanta que o contraste de cores atenda ao padrão WCAG (mínimo 4.5:1).
5. Certifique-se de que o site é navegável via teclado (foco visível em todos os elementos).

## Passo 5: Definição de Estratégia de Estado
**Objetivo:** Organizar o fluxo de dados entre os módulos.

1. Analise a árvore de componentes e minimize o uso de estado global desnecessário.
2. Defina os limites:
   - **Estado Local:** Para interações de UI simples (modais, abas).
   - **Estado Compartilhado (Context):** Para dados de autenticação ou temas.
   - **Injeção de Props:** Para manter componentes "burros" e testáveis.

## Passo 6: Implementação de Navegação Inteligente
**Objetivo:** Impedir que o usuário se perca.

1. Implemente **Breadcrumbs** (Trilhas de navegação) em todas as páginas profundas (nível > 1).
2. Limite o menu principal a no máximo 7-9 itens. Se houver mais, use submenus ou uma barra lateral de navegação (Sidebar).

## Passo 5: Apresentação e Confirmação do Usuário (HITL)

```markdown
## ✅ Plano de Organização de Site — [Projeto]

**Identidade da Aba (Browser):**
- **Título:** [Título informado pelo usuário]
- **Ícone:** [Favicon informado ou sugerido]

**Tipo de Organização:** [Abas / Páginas]
**Hierarquia de Rotas:** [Lista das rotas principais]
**Componentes Modularizados:** [Lista de novos componentes]
**Acessibilidade (a11y):** [Resumo da conformidade encontrada]
**Estratégia de Estado:** [Definição: Local/Context/Global]
**Navegação:** [Breadcrumbs, Limitação de Menu]

⚠️ Confirma a estrutura e os metadados propostos?
```

## Passo 6: Registro
Use a skill `gsd-registro-sessao` para documentar o novo mapa do site e a estrutura de componentes.
