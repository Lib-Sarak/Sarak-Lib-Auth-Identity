# Skill: Segurança Cibernética e Auditoria — Padrão Sarak

## O que é
Esta skill é responsável pela **detecção, mitigação e correção** de vulnerabilidades técnicas, falhas de lógica de autorização e exposição de dados sensíveis. Ela garante que o código Sarak seja resiliente a ataques comuns (OWASP Top 10) e livre de vulnerabilidades em dependências de terceiros (CVEs).

Diferente de uma limpeza superficial, esta auditoria mergulha na lógica do sistema buscando falhas de conformidade de segurança e configurações de infraestrutura (CORS, CSP, Headers de Segurança).

## Objetivo
- Identificar e corrigir vulnerabilidades críticas em dependências (`npm audit`).
- Detectar e refatorar padrões de código inseguros (SAST).
- Prevenir o vazamento de segredos, tokens e chaves de API.
- Gerar relatórios detalhados com métricas de segurança "Antes" e "Depois".
- Sanitizar o ambiente de auditoria após as correções ("Ghost Mode").

## Responsabilidades Exclusivas desta Skill
Esta auditoria é dividida em três pilares obrigatórios:

1.  **Pilar 1 (Dependências):** Scan de CVEs e atualização de pacotes críticos.
2.  **Pilar 2 (SAST & Segredos):** Análise estática em busca de Injection, XSS, `eval()` e vazamento de chaves.
3.  **Pilar 3 (Higiene Sarak):** Garantia de que nenhuma ferramenta de auditoria ou log sensível permaneça no diretório de produção.

## Quando usar
- **Antes de qualquer publicação** em repositórios públicos.
- Ao adicionar novas dependências relevantes ao projeto.
- Periodicamente como auditoria de conformidade em módulos Sarak.
- Após detectar qualquer atividade suspeita ou ao encontrar dados sensíveis fora do `.env`.
