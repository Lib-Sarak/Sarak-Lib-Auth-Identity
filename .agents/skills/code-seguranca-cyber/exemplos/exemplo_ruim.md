# Exemplo Ruim: Código Sarak Inseguro

Este exemplo demonstra uma aplicação com múltiplas falhas graves de segurança.

## Estado Antes (Problema)

```javascript
// c:\Sarak\site\api\v1\user.js
const express = require('express');
const router = express.Router();
const db = require('../../db');

// VULNERABILIDADE 1: SQL Injection (Interpolação direta de input)
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const query = `SELECT * FROM users WHERE id = ${id}`; 
    const user = await db.query(query);
    res.json(user);
});

// VULNERABILIDADE 2: XSS (Renderização de HTML sem escape)
router.get('/profile/:id', async (req, res) => {
    const user = await db.getUser(req.params.id);
    res.send(`<h1>Perfil de ${user.name}</h1>`); // User.name pode conter <script>
});

// VULNERABILIDADE 3: Segredos Expostos (Hardcode de chave)
const FIREBASE_API_KEY = "AIzaSyD-7X8x9Y0z-ExampleKey-12345"; 

module.exports = router;
```

## Análise das Violações (⚠️)

- **⚠️ Injeção de SQL:** O parâmetro `req.params.id` é passado diretamente para o banco de dados. Um atacante pode injetar comandos SQL maliciosos.
- **⚠️ Cross-Site Scripting (XSS):** O nome do usuário é injetado diretamente no HTML sem sanitização, permitindo a execução de scripts maliciosos no navegador do cliente.
- **⚠️ Exposição de Segredo:** A chave da API do Firebase está escrita diretamente no código fonte, o que é proibido pelo padrão Sarak.
- **⚠️ Falta de Headers de Segurança:** Não há uso de `helmet` ou políticas de `CORS`.

## Impacto
Risco alto de vazamento de dados de usuários e sequestro de sessões via XSS. Comprometimento total da segurança do framework.
