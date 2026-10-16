---
title: "Tratamento de erros"
category: "Fundamentos"
order: 5
source: "https://expressjs.com/pt-br/guide/error-handling.html"
sourceLabel: "Express.js — Documentação oficial em português (pt-br)"
officialTranslation: true
---

## Erros em rotas síncronas

O Express já captura automaticamente erros lançados (`throw`) dentro de funções de rota síncronas.

```js
app.get('/exemplo', (req, res) => {
  throw new Error('Algo deu errado'); // o Express captura e responde com erro 500
});
```

## Erros em código assíncrono (async/await)

Em rotas `async`, erros dentro de um `await` que falha devem ser tratados com `try/catch` e repassados com `next(erro)`, ou capturados diretamente na resposta:

```js
app.get('/alunos/:id', async (req, res, next) => {
  try {
    const [linhas] = await pool.query('SELECT * FROM aluno WHERE id = ?', [req.params.id]);
    if (linhas.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }
    res.json(linhas[0]);
  } catch (erro) {
    next(erro); // repassa para o middleware de tratamento de erros
  }
});
```

## Middleware de tratamento de erros

Um middleware de erro é reconhecido pelo Express por ter **quatro parâmetros**: `(err, req, res, next)`. Deve ser declarado **depois** de todas as rotas.

```js
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});
```

## Validação de entrada (erro esperado, não exceção)

Nem todo erro precisa de `try/catch` — validações simples podem simplesmente responder com um status apropriado:

```js
app.post('/alunos', async (req, res) => {
  const { nome } = req.body;

  if (!nome || nome.trim() === '') {
    return res.status(400).json({ erro: 'O campo nome é obrigatório.' });
  }

  await pool.query('INSERT INTO aluno (nome) VALUES (?)', [nome]);
  res.status(201).json({ mensagem: 'Aluno criado com sucesso' });
});
```

## Rota não encontrada (404)

Como os middlewares são avaliados em ordem, uma rota "coringa" no final captura qualquer caminho não tratado:

```js
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});
```
