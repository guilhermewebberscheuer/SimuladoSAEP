---
title: "Manipulação do DOM"
category: "Navegador"
order: 5
source: "https://developer.mozilla.org/pt-BR/docs/Web/API/Document_Object_Model/Introduction"
sourceLabel: "MDN Web Docs — Introdução ao DOM"
officialTranslation: true
---

## Selecionando elementos

```js
const titulo = document.querySelector('h1');          // primeiro elemento que casa com o seletor CSS
const itens = document.querySelectorAll('.item');      // todos os elementos (NodeList)
const campo = document.getElementById('nome');         // por id
```

## Lendo e alterando conteúdo

```js
titulo.textContent = 'Novo título';      // texto puro
titulo.innerHTML = '<strong>Título</strong>'; // permite HTML dentro

const valor = campo.value; // valor de um <input>
campo.value = 'Ana';       // altera o valor de um <input>
```

## Alterando atributos e classes

```js
elemento.setAttribute('data-id', '5');
elemento.classList.add('ativo');
elemento.classList.remove('ativo');
elemento.classList.toggle('ativo');
```

## Criando e inserindo elementos

```js
const linha = document.createElement('tr');
linha.innerHTML = `<td>${aluno.nome}</td><td>${aluno.email}</td>`;
document.querySelector('#tabela-alunos tbody').appendChild(linha);
```

## Eventos

```js
document.querySelector('#botao-salvar').addEventListener('click', (evento) => {
  console.log('Botão clicado');
});

document.querySelector('#form-aluno').addEventListener('submit', (evento) => {
  evento.preventDefault(); // impede o envio tradicional do formulário (recarregar a página)
  // ... enviar dados via fetch
});
```

## Exemplo: atualizando uma listagem após uma busca

```html
<input id="campo-busca" type="text">
<button id="botao-buscar">Buscar</button>
<table id="tabela-alunos">
  <thead><tr><th>Nome</th><th>Email</th></tr></thead>
  <tbody></tbody>
</table>
```

```js
document.querySelector('#botao-buscar').addEventListener('click', async () => {
  const termo = document.querySelector('#campo-busca').value;
  const resposta = await fetch(`/api/alunos?termo=${encodeURIComponent(termo)}`);
  const alunos = await resposta.json();

  const corpo = document.querySelector('#tabela-alunos tbody');
  corpo.innerHTML = ''; // limpa a listagem anterior

  alunos.forEach((aluno) => {
    const linha = document.createElement('tr');
    linha.innerHTML = `<td>${aluno.nome}</td><td>${aluno.email}</td>`;
    corpo.appendChild(linha);
  });
});
```
