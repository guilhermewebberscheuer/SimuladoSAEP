---
title: "Consultas parametrizadas (evitando SQL Injection)"
category: "Consultas"
order: 2
source: "https://sidorares.github.io/node-mysql2/docs/documentation/prepared-statements"
sourceLabel: "node-mysql2 — Documentação oficial (Prepared Statements)"
officialTranslation: false
---

> Tradução e adaptação da documentação oficial do pacote `mysql2` (idioma original: inglês).

## Por que não concatenar valores direto na query

```js
// NUNCA faça isso: permite SQL Injection
const nome = req.body.nome;
const [linhas] = await pool.query(`SELECT * FROM aluno WHERE nome = '${nome}'`);
```

Se o valor vier do usuário sem ser tratado, alguém pode digitar algo como `' OR '1'='1` e alterar o comportamento da consulta.

## Usando `?` como placeholder

O `mysql2` substitui `?` pelos valores informados em um array, escapando-os corretamente:

```js
const nome = req.body.nome;
const [linhas] = await pool.query(
  'SELECT * FROM aluno WHERE nome = ?',
  [nome]
);
```

## Busca com `LIKE` (campo de pesquisa)

Para implementar um campo de busca que filtra por um termo digitado pelo usuário:

```js
const termo = req.query.termo || '';
const [linhas] = await pool.query(
  'SELECT * FROM aluno WHERE nome LIKE ?',
  [`%${termo}%`]
);
```

## INSERT, UPDATE e DELETE parametrizados

```js
// INSERT
await pool.query(
  'INSERT INTO aluno (nome, cpf, email) VALUES (?, ?, ?)',
  [nome, cpfCriptografado, email]
);

// UPDATE
await pool.query(
  'UPDATE aluno SET nome = ?, email = ? WHERE id = ?',
  [nome, email, id]
);

// DELETE
await pool.query('DELETE FROM aluno WHERE id = ?', [id]);
```

## Consulta com JOIN (ex.: listar agendamentos com dados do aluno e do plano)

```js
const [linhas] = await pool.query(`
  SELECT a.id, a.data_aula, al.nome AS aluno_nome, p.descricao AS plano_descricao
  FROM agendamento a
  JOIN aluno al ON al.id = a.aluno_id
  JOIN plano_treino p ON p.id = a.plano_treino_id
  ORDER BY a.data_aula ASC
`);
```

Toda vez que um valor vem de `req.body`, `req.params` ou `req.query` (ou seja, de uma entrada do usuário), ele deve entrar na consulta como `?`, nunca por concatenação de string.
