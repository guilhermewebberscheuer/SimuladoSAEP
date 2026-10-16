---
title: "Middleware (app.use, express.json, express.static)"
category: "Fundamentos"
order: 2
source: "https://expressjs.com/pt-br/guide/using-middleware.html"
sourceLabel: "Express.js — Documentação oficial em português (pt-br)"
officialTranslation: true
---

## O que é um middleware

Funções de middleware são funções que têm acesso ao objeto de requisição (`req`), ao objeto de resposta (`res`) e à próxima função de middleware no ciclo de requisição-resposta da aplicação, comumente chamada de `next`.

Um middleware pode:

- Executar qualquer código.
- Alterar os objetos de requisição e resposta.
- Encerrar o ciclo de requisição-resposta.
- Chamar o próximo middleware da pilha, usando `next()`.

**Se a função de middleware atual não encerrar o ciclo de requisição-resposta, ela deve chamar `next()`**, ou a requisição ficará "pendurada" (sem resposta).

## Middleware próprio

```js
function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next(); // obrigatório para continuar
}

app.use(logger);
```

## Middlewares embutidos no Express

### `express.json()`

Lê o corpo da requisição quando o `Content-Type` é `application/json` e disponibiliza o resultado em `req.body`.

```js
app.use(express.json());
```

### `express.urlencoded()`

Lê o corpo de formulários HTML tradicionais (`Content-Type: application/x-www-form-urlencoded`).

```js
app.use(express.urlencoded({ extended: true }));
```

### `express.static()`

Serve arquivos estáticos (CSS, imagens, JS do navegador) a partir de uma pasta.

```js
app.use(express.static('public'));
// um arquivo em public/css/estilo.css fica acessível em /css/estilo.css
```

## Ordem importa

Os middlewares são executados na ordem em que são declarados com `app.use`/`app.METHOD`. Middlewares de leitura do corpo (`express.json`, `express.urlencoded`) devem vir **antes** das rotas que usam `req.body`.

```js
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/alunos', (req, res) => {
  console.log(req.body); // já disponível, pois os middlewares acima rodaram antes
  res.send('ok');
});
```
