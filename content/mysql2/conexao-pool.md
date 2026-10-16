---
title: "Conectando ao MySQL (createConnection / createPool)"
category: "Conexão"
order: 1
source: "https://sidorares.github.io/node-mysql2/docs"
sourceLabel: "node-mysql2 — Documentação oficial"
officialTranslation: false
---

> Tradução e adaptação da documentação oficial do pacote `mysql2` (idioma original: inglês). Instalação: `npm install mysql2`.

## Visão geral

O `mysql2` é um driver para o MySQL/MariaDB que suporta tanto o estilo clássico de callbacks quanto **Promises**, permitindo uso com `async/await`. Para usar Promises, importa-se a partir de `mysql2/promise`.

## Conexão única

```js
const mysql = require('mysql2/promise');

async function main() {
  const conexao = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'senha',
    database: 'academia_db',
  });

  const [linhas] = await conexao.query('SELECT * FROM aluno');
  console.log(linhas);

  await conexao.end();
}
```

## Pool de conexões (recomendado para aplicações web)

Em uma aplicação Express, o recomendado é criar um **pool** de conexões uma única vez (ao iniciar o servidor) e reutilizá-lo em todas as rotas, em vez de abrir e fechar uma conexão a cada requisição.

```js
// db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'senha',
  database: 'academia_db',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
```

```js
// em uma rota, por exemplo routes/alunos.js
const pool = require('../db');

app.get('/alunos', async (req, res) => {
  const [alunos] = await pool.query('SELECT * FROM aluno');
  res.render('alunos', { alunos });
});
```

O método `.query()` (ou `.execute()`) de um pool pega automaticamente uma conexão livre, executa a consulta e a devolve ao pool — sem precisar chamar `.end()` manualmente.
