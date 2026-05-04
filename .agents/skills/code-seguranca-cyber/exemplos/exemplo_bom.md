# Exemplo Bom: Código Sarak Após Auditoria de Segurança

Este exemplo demonstra a aplicação correta dos padrões de segurança Sarak após a intervenção da skill de auditoria.

## Estado Depois (Resultado da Skill)

```javascript
// c:\Sarak\site\api\v1\user.js
const express = require('express');
const router = express.Router();
const db = require('../../db');
const helmet = require('helmet'); // CORREÇÃO: Middleware de headers ativos
const escapeHtml = require('escape-html'); // CORREÇÃO: Sanitização de saída

// Garantindo cabeçalhos de segurança básicos em todas as rotas
router.use(helmet());

// PROTEÇÃO 1: Consulta Parametrizada (Contra SQL Injection)
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    // O driver do banco trata a sanitização do parâmetro 'id'
    const query = "SELECT * FROM users WHERE id = ?"; 
    const user = await db.query(query, [id]); 
    res.json(user);
});

// PROTEÇÃO 2: Escape de HTML (Contra XSS)
router.get('/profile/:id', async (req, res) => {
    const user = await db.getUser(req.params.id);
    // O input do usuário (nome) é escapado antes de ser renderizado
    res.send(`<h1>Perfil de ${escapeHtml(user.name)}</h1>`); 
});

// PROTEÇÃO 3: Uso de Variáveis de Ambiente (Segredos Protegidos)
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY; // Chave está no .env, protegida pelo .gitignore

module.exports = router;
```

## Categorias de Correção Aplicadas

- **✅ Parameterized Queries:** O input do usuário nunca é interpolado diretamente em strings SQL, garantindo imunidade total a SQL Injection simples.
- **✅ Output Sanitization:** O conteúdo vindo do usuário (ou banco) é escapado antes de ser renderizado como HTML, prevenindo ataques de XSS refletido.
- **✅ Secret Management:** Nenhuma chave sensível permanece no código fonte (hardcoded). Todas são consumidas via `process.env`.
- **✅ Security Headers:** O middleware `helmet` configura diversos cabeçalhos HTTP (CSP, HSTS, No-Sniff) que aumentam a barreira de proteção do site.

## Resultado da Auditoria
Vulnerabilidades Críticas resolvidas: 3. Vulnerabilidades Médias resolvidas: 1 (Headers). Ambiente 100% em conformidade com o padrão Sarak.
