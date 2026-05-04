# Definição: Sarak Module Onboarding (v10.0)

## O que é
A skill Sarak Module Onboarding é o protocolo oficial para a expansão do ecossistema Sarak. Ela define como um novo sistema (ex: Forzi, MyService, etc.) deve ser configurado para ser "Plug & Play" dentro do motor de interface soberano. Ela foca na transição de arquiteturas legadas para o modelo baseado em manifesto, onde o DNA do módulo é descrito em um arquivo JSON e consumido dinamicamente pelo core.

Esta skill garante que todos os módulos independentes compartilhem a mesma linguagem visual (Industrial/Sovereign), sincronizem estados de autenticação de forma invisível e se registrem no Discovery Engine sem necessidade de alterações no código-fonte do Core.

## Objetivo
- Padronizar a estrutura de arquivos de integração em novos módulos.
- Garantir 100% de paridade na autenticação entre módulos via TokenSyncBridge.
- Eliminar o acoplamento rígido através do sarak.manifest.json.
- Automatizar a configuração de variáveis globais de sistema.

## Responsabilidades Exclusivas desta Skill
1. Configuração da dependência @sarak/lib-ui-core via GitHub ou Local.
2. Criação e validação do DNA do módulo (sarak.manifest.json).
3. Implementação da ponte de sincronização de tokens (TokenSyncBridge).
4. Configuração do entry point (main.tsx) para arquitetura v10.0.
5. Purgar estados residuais via cleanLocalStorage.

## Quando usar
- Ao iniciar a integração do Sarak em um novo repositório.
- Ao atualizar um módulo existente para a arquitetura soberana v10.0.
- Quando um módulo apresentar falhas de autenticação (401/403) ou "White Screen" devido a falha de discovery.
