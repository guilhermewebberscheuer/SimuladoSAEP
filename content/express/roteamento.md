---
title: "Roteamento básico"
category: "Fundamentos"
order: 1
source: "https://expressjs.com/pt-br/starter/basic-routing.html"
sourceLabel: "Express.js — Documentação oficial em português (pt-br)"
officialTranslation: true
---

## O que é roteamento

Roteamento refere-se à forma como os endpoints (URIs) de uma aplicação respondem às requisições dos clientes. Cada rota pode ter uma ou mais funções de tratamento (*handlers*), executadas quando a rota é combinada.

A definição de rota segue a estrutura:

```js
app.METHOD(PATH, HANDLER)
```

- `app`: uma instância do `express`.
- `METHOD`: um método HTTP, em minúsculas (`get`, `post`, `put`, `delete`, etc.).
- `PATH`: um caminho (ou padrão) no servidor.
- `HANDLER`: a função executada quando a rota é combinada.

## Exemplos

Respondendo `Hello World!` na página inicial:

```js
app.get('/', (req, res) => {
  res.send('Hello World!');
});
```

Respondendo a uma requisição POST na rota raiz:

```js
app.post('/', (req, res) => {
  res.send('Got a POST request');
});
```

Respondendo a uma requisição PUT em `/user`:

```js
app.put('/user', (req, res) => {
  res.send('Got a PUT request at /user');
});
```

Respondendo a uma requisição DELETE em `/user`:

```js
app.delete('/user', (req, res) => {
  res.send('Got a DELETE request at /user');
});
```

## Parâmetros de rota

Parâmetros de rota são capturados usando `:` no caminho e ficam disponíveis em `req.params`:

```js
app.get('/usuarios/:id', (req, res) => {
  res.send(`ID do usuário: ${req.params.id}`);
});
```
