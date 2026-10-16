---
title: "Hash de senha (bcrypt.hash / bcrypt.compare)"
category: "Senhas"
order: 1
source: "https://www.npmjs.com/package/bcrypt"
sourceLabel: "bcrypt — Documentação oficial (npm/README)"
officialTranslation: false
---

> Tradução e adaptação da documentação oficial do pacote `bcrypt` (idioma original: inglês). Instalação: `npm install bcrypt` (alternativa 100% JavaScript, sem compilação nativa: `bcryptjs`, mesma API).

## Por que não guardar a senha em texto puro (nem com `crypto` simples)

Senhas nunca devem ser armazenadas em texto puro no banco. O `bcrypt` gera um **hash com sal (salt) embutido e automático**, tornando cada hash único mesmo para senhas iguais, e é propositalmente lento (dificultando ataques de força bruta).

```js
const bcrypt = require('bcrypt');
```

## Gerando o hash (`bcrypt.hash`)

```js
const SALT_ROUNDS = 10; // custo do processamento (quanto maior, mais lento e seguro)

async function cadastrarUsuario(email, senha) {
  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

  await pool.query(
    'INSERT INTO usuario (email, senha_hash) VALUES (?, ?)',
    [email, senhaHash]
  );
}
```

O valor salvo no banco (`senhaHash`) é algo como:
```
$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```
Esse valor já contém o algoritmo, o custo e o salt usados — não é necessário guardar o salt separadamente.

## Conferindo a senha no login (`bcrypt.compare`)

```js
async function conferirSenha(senhaDigitada, senhaHashSalva) {
  return bcrypt.compare(senhaDigitada, senhaHashSalva);
  // retorna true ou false
}
```

```js
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const [linhas] = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]);
  const usuario = linhas[0];

  if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
    return res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
  }

  // login correto: gerar token JWT, iniciar sessão, etc.
});
```

## Importante

- Nunca compare a senha digitada com o hash usando `===`. Sempre use `bcrypt.compare`, que sabe extrair o salt do hash salvo e refazer o cálculo.
- O `bcrypt.hash` já é assíncrono (retorna uma Promise) — use `await` ou `.then()`.
