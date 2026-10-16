---
title: "Arrays e objetos"
category: "Fundamentos"
order: 3
source: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Indexed_collections"
sourceLabel: "MDN Web Docs — Coleções indexadas (Arrays)"
officialTranslation: true
---

## Objetos

```js
const aluno = {
  id: 1,
  nome: 'Ana Souza',
  ativo: true,
};

console.log(aluno.nome);     // acesso por ponto
console.log(aluno['nome']);  // acesso por colchetes (útil com nome dinâmico)

aluno.email = 'ana@email.com'; // adiciona nova propriedade
delete aluno.ativo;             // remove uma propriedade
```

### Desestruturação de objeto

```js
const { nome, email } = aluno;
console.log(nome); // 'Ana Souza'
```

## Arrays

```js
const numeros = [1, 2, 3];
const alunos = [
  { id: 1, nome: 'Ana' },
  { id: 2, nome: 'Bruno' },
];
```

### Métodos mais usados

| Método | Descrição |
|---|---|
| `array.push(item)` | Adiciona um item ao final |
| `array.map(fn)` | Cria um novo array transformando cada item |
| `array.filter(fn)` | Cria um novo array só com os itens que satisfazem a condição |
| `array.find(fn)` | Retorna o primeiro item que satisfaz a condição (ou `undefined`) |
| `array.forEach(fn)` | Executa uma função para cada item (sem retornar array novo) |
| `array.length` | Quantidade de itens |

```js
const nomes = alunos.map((a) => a.nome);
// ['Ana', 'Bruno']

const ativos = alunos.filter((a) => a.ativo);

const encontrado = alunos.find((a) => a.id === 2);
// { id: 2, nome: 'Bruno' }

alunos.forEach((a) => console.log(a.nome));
```

### Percorrendo com `for...of`

```js
for (const aluno of alunos) {
  console.log(aluno.nome);
}
```

## JSON: convertendo entre objeto e texto

Usado ao trocar dados entre o navegador e o servidor (ex.: `fetch`, `req.body`).

```js
const texto = JSON.stringify(aluno); // objeto -> texto JSON
const objeto = JSON.parse(texto);    // texto JSON -> objeto
```
