---
title: "Módulo crypto (criptografia)"
category: "Módulos Core"
order: 2
source: "https://nodejs.org/docs/latest/api/crypto.html"
sourceLabel: "Node.js Documentation — Crypto"
officialTranslation: false
---

> Tradução e adaptação da documentação oficial do Node.js (idioma original: inglês).

## Visão geral

O módulo `crypto` fornece funcionalidades criptográficas que incluem um conjunto de wrappers para as funções de *hash*, HMAC, cifra, decifra, assinatura e verificação do OpenSSL.

```js
const crypto = require('crypto');
```

Existem dois usos típicos em sistemas com banco de dados:

1. **Hash (irreversível)** — para dados que só precisam ser *comparados*, nunca lidos de volta (ex.: conferir uma senha). Não recomendado sozinho para senhas em produção (prefira uma lib própria para isso, como `bcrypt`), mas útil para checksums e dados que não precisam voltar ao valor original.
2. **Criptografia simétrica (reversível)** — para dados que precisam ser *recuperados* depois (ex.: um CPF, que em algum momento a aplicação precisa exibir ou usar). Usa uma chave secreta para cifrar e a mesma chave para decifrar.

## Hash com `createHash`

```js
const crypto = require('crypto');

function gerarHash(texto) {
  return crypto.createHash('sha256').update(texto).digest('hex');
}

const hash = gerarHash('meuTexto');
console.log(hash); // string hexadecimal, sempre a mesma para a mesma entrada
```

## Criptografia reversível com `createCipheriv` / `createDecipheriv`

Para dados que precisam ser recuperados (como um CPF), o Node.js oferece cifra simétrica (ex.: AES-256-CBC). É necessário guardar, além do texto cifrado, o **vetor de inicialização (IV)** usado — ele não é segredo, mas precisa ser o mesmo na hora de decifrar.

```js
const crypto = require('crypto');

const ALGORITMO = 'aes-256-cbc';
// A chave precisa ter 32 bytes para aes-256. Em um projeto real, isso fica
// em uma variável de ambiente, nunca escrito direto no código.
const CHAVE = crypto.scryptSync('senha-secreta-do-projeto', 'sal-fixo', 32);

function criptografar(texto) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITMO, CHAVE, iv);
  const cifrado = Buffer.concat([cipher.update(texto, 'utf8'), cipher.final()]);
  // Guardamos o IV junto com o texto cifrado (ex.: "iv:textoCifrado"), em hexadecimal
  return iv.toString('hex') + ':' + cifrado.toString('hex');
}

function descriptografar(valorCifrado) {
  const [ivHex, cifradoHex] = valorCifrado.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const cifrado = Buffer.from(cifradoHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITMO, CHAVE, iv);
  const texto = Buffer.concat([decipher.update(cifrado), decipher.final()]);
  return texto.toString('utf8');
}

const cpfCifrado = criptografar('12345678900');
console.log(cpfCifrado);          // ex.: "a1b2.../c3d4..."
console.log(descriptografar(cpfCifrado)); // "12345678900"
```

### Por que não usar só hash para o CPF?

`createHash` é uma via de mão única: não existe forma de recuperar o texto original a partir do hash. Isso é perfeito para senha (você só precisa *comparar*, nunca mostrar a senha de novo), mas não serve para dados que a aplicação precisa ler de volta, como o CPF. Para esse caso, o correto é cifra reversível (`createCipheriv`/`createDecipheriv`), guardando a chave secreta fora do código-fonte (variável de ambiente).
