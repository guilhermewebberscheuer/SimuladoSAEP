---
title: "Variáveis: var, let e const"
category: "Fundamentos"
order: 1
source: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Statements/let"
sourceLabel: "MDN Web Docs — Referência JavaScript (var, let, const)"
officialTranslation: true
---

## Declaração de variáveis

O JavaScript possui três palavras-chave para declarar variáveis: `var`, `let` e `const`.

### `var`

- Escopo de **função** (não de bloco).
- Pode ser redeclarada e reatribuída.
- Sofre *hoisting*: a declaração é movida para o topo do escopo, mas o valor só é atribuído na linha original.

```js
var x = 1;
if (true) {
  var x = 2; // mesma variável
}
console.log(x); // 2
```

### `let`

- Escopo de **bloco** (`{ }`).
- Pode ser reatribuída, mas não redeclarada no mesmo escopo.
- Fica em "zona morta temporal" até a linha da declaração (não pode ser usada antes de ser declarada).

```js
let y = 1;
if (true) {
  let y = 2; // variável diferente, escopo do bloco
  console.log(y); // 2
}
console.log(y); // 1
```

### `const`

- Escopo de **bloco**, assim como `let`.
- Precisa ser inicializada na declaração.
- Não pode ser **reatribuída**. Porém, se o valor for um objeto ou array, as propriedades internas ainda podem ser alteradas.

```js
const z = { nome: "Ana" };
z.nome = "Maria"; // permitido, o objeto é mutável
z = {};           // erro: não é possível reatribuir const
```

## Recomendação da documentação oficial

A documentação do MDN recomenda usar `const` por padrão, e `let` apenas quando o valor da variável precisar ser reatribuído. O uso de `var` é considerado legado e geralmente evitado em código moderno.
