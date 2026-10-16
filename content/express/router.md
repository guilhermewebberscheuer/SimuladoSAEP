---
title: "express.Router() — organizando rotas em módulos"
category: "Fundamentos"
order: 4
source: "https://expressjs.com/pt-br/guide/routing.html"
sourceLabel: "Express.js — Documentação oficial em português (pt-br)"
officialTranslation: true
---

## Por que usar Router

Em vez de colocar todas as rotas em um único arquivo `server.js`, o Express permite criar "mini aplicações" de rotas (`Router`), cada uma em seu próprio arquivo, e depois conectá-las na aplicação principal com `app.use`.

## Criando um Router

```js
// routes/alunos.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const [alunos] = await pool.query('SELECT * FROM aluno');
  res.render('alunos/listar', { alunos });
});

router.get('/novo', (req, res) => {
  res.render('alunos/form');
});

router.post('/', async (req, res) => {
  await pool.query('INSERT INTO aluno (nome, email) VALUES (?, ?)', [req.body.nome, req.body.email]);
  res.redirect('/alunos');
});

router.get('/:id/editar', async (req, res) => {
  const [linhas] = await pool.query('SELECT * FROM aluno WHERE id = ?', [req.params.id]);
  res.render('alunos/form', { aluno: linhas[0] });
});

router.post('/:id', async (req, res) => {
  await pool.query(
    'UPDATE aluno SET nome = ?, email = ? WHERE id = ?',
    [req.body.nome, req.body.email, req.params.id]
  );
  res.redirect('/alunos');
});

module.exports = router;
```

## Conectando o Router na aplicação principal

```js
// server.js
const express = require('express');
const app = express();

const alunosRouter = require('./routes/alunos');

app.use(express.urlencoded({ extended: true }));
app.use('/alunos', alunosRouter); // tudo dentro de alunosRouter fica prefixado com /alunos

app.listen(3000);
```

Com isso, `router.get('/')` dentro de `routes/alunos.js` responde, na prática, pela rota `GET /alunos`, e `router.get('/:id/editar')` responde por `GET /alunos/:id/editar`.
