---
title: "Objetos req e res"
category: "Fundamentos"
order: 3
source: "https://expressjs.com/pt-br/4x/api.html"
sourceLabel: "Express.js — Documentação oficial em português (pt-br), referência da API"
officialTranslation: true
---

## Objeto `req` (requisição)

| Propriedade | Descrição |
|---|---|
| `req.params` | Parâmetros de rota, ex.: `/alunos/:id` → `req.params.id` |
| `req.query` | Parâmetros da query string, ex.: `/alunos?termo=ana` → `req.query.termo` |
| `req.body` | Corpo da requisição (precisa de `express.json()` ou `express.urlencoded()`) |
| `req.headers` | Cabeçalhos HTTP da requisição |
| `req.method` | Método HTTP usado (`GET`, `POST`, etc.) |

```js
app.get('/alunos/:id', (req, res) => {
  const id = req.params.id;
  // ...
});

app.get('/alunos', (req, res) => {
  const termoBusca = req.query.termo;
  // ...
});
```

## Objeto `res` (resposta)

| Método | Descrição |
|---|---|
| `res.send(corpo)` | Envia uma resposta (texto, HTML, Buffer ou objeto) |
| `res.json(objeto)` | Envia uma resposta em JSON |
| `res.status(codigo)` | Define o código de status HTTP (encadeável: `res.status(404).send(...)`) |
| `res.render(view, dados)` | Renderiza uma view (ex.: EJS) com os dados informados |
| `res.redirect(caminho)` | Redireciona para outra rota |

```js
app.get('/api/alunos', async (req, res) => {
  const [alunos] = await pool.query('SELECT * FROM aluno');
  res.json(alunos);
});

app.get('/alunos', async (req, res) => {
  const [alunos] = await pool.query('SELECT * FROM aluno');
  res.render('alunos', { alunos }); // renderiza views/alunos.ejs
});

app.post('/alunos', async (req, res) => {
  await pool.query('INSERT INTO aluno (nome) VALUES (?)', [req.body.nome]);
  res.redirect('/alunos'); // volta para a listagem após salvar
});

app.get('/alunos/:id', async (req, res) => {
  const [linhas] = await pool.query('SELECT * FROM aluno WHERE id = ?', [req.params.id]);
  if (linhas.length === 0) {
    return res.status(404).send('Aluno não encontrado');
  }
  res.json(linhas[0]);
});
```

## Combinando status e JSON (comum em APIs)

```js
res.status(201).json({ mensagem: 'Aluno criado com sucesso' });
res.status(400).json({ erro: 'Nome é obrigatório' });
res.status(401).json({ erro: 'Não autenticado' });
res.status(404).json({ erro: 'Não encontrado' });
```
