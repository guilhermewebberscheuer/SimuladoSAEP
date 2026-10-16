---
title: "Funções (declaração, expressão e arrow functions)"
category: "Fundamentos"
order: 2
source: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Functions"
sourceLabel: "MDN Web Docs — Guia de Funções"
officialTranslation: true
---

## Declaração de função

```js
function somar(a, b) {
  return a + b;
}
```

Funções declaradas assim sofrem *hoisting* completo: podem ser chamadas antes de aparecerem no código.

## Expressão de função

```js
const somar = function (a, b) {
  return a + b;
};
```

## Arrow function (função de seta)

Sintaxe mais curta, introduzida no ES6. Não possui seu próprio `this` (usa o `this` do escopo onde foi definida).

```js
const somar = (a, b) => a + b; // retorno implícito, sem chaves

const saudacao = (nome) => {
  return `Olá, ${nome}!`;
};
```

## Parâmetros padrão (default parameters)

```js
function criarAluno(nome, ativo = true) {
  return { nome, ativo };
}

criarAluno('Ana'); // { nome: 'Ana', ativo: true }
```

## Funções como parâmetro (callbacks)

```js
function processar(lista, callback) {
  for (const item of lista) {
    callback(item);
  }
}

processar([1, 2, 3], (numero) => console.log(numero * 2));
```

## Funções assíncronas

Ver a página [Promises e async/await](/javascript/async-await) para funções que retornam `Promise` e usam `await`.
