# Skill: Lib Commit

## O que é
A skill Lib Commit é uma especialização do fluxo de trabalho Git focada na arquitetura modular do projeto Sarak. Ela reconhece que o workspace não é um monorepo único, mas uma coleção de repositórios independentes que coabitam um diretório comum.

Esta skill automatiza a identificação de módulos Sarak (diretórios iniciados com `Sarak-`) e garante que as mudanças sejam versionadas em seus respectivos repositórios remotos, evitando a mistura de código de diferentes domínios em um único commit.

## Objetivo
- Isolar o versionamento de cada biblioteca para manter a integridade dos repositórios individuais.
- Automatizar o fluxo de Stage -> Commit -> Push para a branch `main`.
- Garantir que cada módulo `Sarak-*` esteja sincronizado com o GitHub individualmente.

## Responsabilidades Exclusivas desta Skill
1. **Identificação de Escopo**: Validar se a operação Git está ocorrendo dentro de um diretório que segue o padrão `Sarak-*`.
2. **Isolamento de Commit**: Impedir que arquivos fora do diretório do módulo atual sejam incluídos no commit.
3. **Sincronização Direta**: Realizar o push para a branch `main` de cada repositório específico.

## Quando usar
- Sempre que houver mudanças concluídas em um dos módulos `Sarak-*`.
- Após a conclusão de um ciclo de desenvolvimento em uma biblioteca específica.
- Quando o usuário ou o `skill-planejamento-gsd` solicitar a sincronização de um módulo com o GitHub.
