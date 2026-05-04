# Checklist de Validação: Limpeza de Projeto (Elite)

## Fase 1: Estrutural e Espacial
- [ ] Os 10 maiores arquivos foram auditados?
- [ ] Arquivos órfãos e pastas de backup foram removidos apenas após o HITL?
- [ ] O arquivo `.gitignore` foi atualizado para cobrir novos padrões de lixo?
- [ ] Scripts de debug local e temporários foram removidos?
- [ ] O projeto continua compilando/iniciando após as remoções?

## Fase 2: Analítica e Segurança
- [ ] Segredos e chaves de API foram identificados e sanitizados (mascarados no log)?
- [ ] O linter foi executado para confirmar a ausência de código morto?
- [ ] As dependências não utilizadas no `package.json` foram confirmadas e removidas?
- [ ] O `grep_search` foi utilizado para confirmar que as funções deletadas eram realmente órfãs?
- [ ] Funções e variáveis sem referência (confirmadas via grep) foram removidas?
- [ ] Blocos de código comentado sem nota técnica foram removidos?
- [ ] Imports não utilizados no topo dos arquivos foram limpos?
- [ ] Espaços vazios excessivos e redundâncias óbvias foram eliminados?

## Verificação de Segurança
- [ ] Nenhum arquivo de configuração (`.env.example`, `*.json`) foi deletado?
- [ ] A suite de testes oficial continua passando?
- [ ] Nenhuma informação crítica de documentação técnica foi perdida?

## Registro
- [ ] A lista de todas as deleções foi enviada para a `gsd-registro-sessao`?
- [ ] O resumo de "Ganho de Limpeza" foi incluído no log?
