---
title: "Gerar e verificar tokens (jwt.sign / jwt.verify)"
category: "Autenticação"
order: 1
source: "https://github.com/auth0/node-jsonwebtoken#readme"
sourceLabel: "jsonwebtoken — Documentação oficial (README)"
officialTranslation: false
---

> Tradução e adaptação da documentação oficial do pacote `jsonwebtoken` (idioma original: inglês). Instalação: `npm install jsonwebtoken`.

## O que é

O `jsonwebtoken` implementa o padrão **JWT (JSON Web Token)**, usado para autenticação baseada em token. O token carrega informações (payload), uma assinatura e, opcionalmente, um **tempo de expiração**.

```js
const jwt = require('jsonwebtoken');
```

## Gerando um token (`jwt.sign`)

```js
const SEGREDO = process.env.JWT_SECRET || 'segredo-do-projeto';

function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, nome: usuario.nome },  // payload
    SEGREDO,                                  // chave secreta
    { expiresIn: '1h' }                       // expira em 1 hora
  );
}
```

Valores comuns para `expiresIn`: `'60s'`, `'15m'`, `'1h'`, `'7d'` (segundos se for número puro).

## Login: gerando e devolvendo o token

```js
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  const [linhas] = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]);
  const usuario = linhas[0];

  if (!usuario) {
    return res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
  }

  const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaCorreta) {
    return res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
  }

  const token = gerarToken(usuario);
  res.json({ token, nome: usuario.nome });
});
```

## Verificando um token (`jwt.verify`)

```js
function verificarToken(token) {
  try {
    return jwt.verify(token, SEGREDO); // retorna o payload se válido
  } catch (erro) {
    return null; // token inválido ou expirado
  }
}
```

`jwt.verify` lança um erro automaticamente quando o token expirou (`TokenExpiredError`) ou é inválido (`JsonWebTokenError`).

## Middleware para proteger rotas

```js
function exigirAutenticacao(req, res, next) {
  const authHeader = req.headers.authorization; // formato: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Token não informado.' });
  }

  try {
    const payload = jwt.verify(token, SEGREDO);
    req.usuario = payload; // disponibiliza os dados do usuário nas próximas funções
    next();
  } catch (erro) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

// uso:
app.get('/alunos', exigirAutenticacao, async (req, res) => {
  // só chega aqui se o token for válido
});
```
