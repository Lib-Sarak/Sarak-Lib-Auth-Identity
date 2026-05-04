# Regras e Limites: Especialista em Organização de Site

Proibições para garantir uma arquitetura limpa e sustentável.

1. **NUNCA** use URLs crípticas ou baseadas apenas em IDs (ex: `/p=123`). Use slugs semânticos (`/produto-especifico`).
2. **NÃO** misture lógica de negócio (chamadas de API, cálculos complexos) dentro de componentes de pura visualização (Dumb Components).
3. **NUNCA** ultrapasse 10 abas em uma única visualização. Se necessário, crie uma sub-navegação.
4. **NÃO** use abreviações genéricas para nomes de componentes (ex: `Btn`. Use `ButtonMain`).
5. **NUNCA** crie componentes "monstro" (arquivos com >500 linhas). Refatore em partes menores.
6. **NUNCA** use hashes (`#`) ou apenas query params para a navegação principal entre seções. As URLs devem obrigatoriamente seguir a estrutura hierárquica de diretórios (ex: `/aba/subaba/sub-subaba`), mantendo a semântica de um sistema de arquivos de desktop.
7. **NÃO** ignore a acessibilidade. Toda navegação (especialmente abas) deve ser navegável via teclado (Tab/Enter).
8. **NUNCA** finalize a estruturação de um site ou página mantendo títulos (Next.js App, Vite App) ou favicons genéricos. A identidade da aba (HITL do Passo 3) é obrigatória.
