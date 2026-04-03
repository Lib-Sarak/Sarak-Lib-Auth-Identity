# 🌌 Sarak OS Matrix: Guia Mestre de Arquitetura e Estabilização

Este documento detalha o ecossistema Sarak, focado na escalabilidade modular e na transição contínua entre desenvolvimento local e produção via GitHub.

---

## 🏗️ Os 3 Pilares da Arquitetura Matrix

Para manter o princípio **GSD (Get Shit Done)** sem comprometer a qualidade, o ecossistema é dividido em três camadas rígidas:

### 1. Módulos da Biblioteca (The Foundation)
*Ex: Sarak-Lib-Shared, Sarak-Lib-Auth-Identity, Sarak-Lib-UI-Core*
- **Onde o Código Vive**: Repositórios independentes no GitHub (Organização `@Lib-Sarak`).
- **Filosofia**: São a fonte de toda a verdade. Devem ser **100% Plug & Play**. 
- **Desenvolvimento**: Durante a criação, usamos `pip install -e .` para refletir mudanças locais em tempo real.
- **Produção**: São instalados via Git URLs (`git+https://github...`). 
- **Regra**: Nunca faça "gambiarra" no Framework para compensar uma falha na Lib. **A correção DEVE ser na Lib**.

### 2. Framework Full (The Aggregator / Gateway)
*Repositório: Sarak-Framework-Full*
- **Onde o Código Vive**: Repositório centralizador no GitHub.
- **Função**: Atua como o **Orquestrador de Microsserviços**. É responsável por:
    - **Middleware Global**: Gerencia o Multi-Tenant via `X-System-ID`.
    - **Dependency Hijacking**: Sobrescreve funções de "stub" das bibliotecas com implementações reais de produção.
    - **Database Orchestration**: Gerencia a criação de schemas dinâmicos via `sarak_shared`.
- **Produção**: O Framework Full também deve ser consumido via GitHub, garantindo que o Gateway seja sempre a versão estável e auditada.

### 3. Microsserviço / Projeto Final (The Product)
*Ex: Sarak-MyService*
- **Natureza**: A aplicação de ponta que o usuário final interage.
- **Integração**: Consome as Bibliotecas e o Framework para entregar valor.
- **Conexão de Produção**: Em ambiente produtivo, o arquivo `requirements.txt` deste microsserviço deve apontar exclusivamente para os endereços do GitHub das Libs e do Framework, garantindo que o deploy seja imutável e seguro.

---

## 🎯 Objetivo Prático: Multi-Tenant Híbrido

O objetivo é suportar **N sistemas independentes** com:
- **Identidade Unificada**: Login centralizado no schema `public`. Um usuário loga uma vez e tem acesso aos seus N sistemas.
- **Dados e Chaves Isolados**: Chaves de API, consumos de LLM e analytics mudam conforme o `X-System-ID`, isolando os dados de cada cliente/projeto.
- **Modularidade Total**: Adicionar uma nova funcionalidade (ex: tradução nova) significa apenas adicionar uma nova Lib ao Framework.

---

## 🔴 Diagnóstico do Bloqueador: Erro 401 (Identity)

### Histórico de Correções (Sem Gambiarras):
- [x] **UUID Fix** (Conserto na Lib): Busca de usuário agora entende UUID do Postgres.
- [x] **Async Gateway** (Conserto no Framework): `main.py` agora aguarda o objeto de usuário real.
- [x] **Atomic DB Sync** (Sincronização): Lib Identity agora "fala" a língua do Nucleus (`sarak_shared`).

### Próximo Passo Crítico:
O `POST /api/auth/login` **funciona (200)**, mas o `GET /api/auth/me` **falha (401)**.
O foco deve ser a **reconciliação de credenciais** entre o token gerado e o que o Gateway tenta validar, garantindo que o `JWT_SECRET` e a sessão de banco estejam em harmonia absoluta.

---

**"Software de elite não aceita adaptações temporárias. Sarak Matrix é construído para a eternidade do código modular."** 🫡🚀🦾
