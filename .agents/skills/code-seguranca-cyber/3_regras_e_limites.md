# Regras e Limites da Skill: Segurança Cibernética

Estas regras garantem que a auditoria não se torne um risco de segurança por si só.

1. **NÃO** mantenha logs de vulnerabilidades (JSON ou texto) no repositório após a auditoria. Apague-os permanentemente.
2. **NUNCA** faça hardcode de segredos, mesmo como "teste". Use sempre variáveis de ambiente (`.env`).
3. **NÃO** ignore alertas de nível `CRITICAL` ou `HIGH` sem justificativa técnica documentada e aprovação do usuário.
4. **NUNCA** exponha vulnerabilidades reais do projeto Sarak em relatórios públicos ou logs não criptografados.
5. **NÃO** realize alterações de rede ou infraestrutura de firewall; o escopo desta skill é limitado ao **código e dependências**.
6. **NUNCA** deixe de validar se o `.gitignore` está protegendo o arquivo `.env`.
7. **NÃO** realize auditoria de segurança durante uma fase de desenvolvimento ativo intensa; deve ser uma etapa isolada.
8. **NUNCA** use ferramentas de auditoria sem antes verificar a integridade do pacote no NPM.
