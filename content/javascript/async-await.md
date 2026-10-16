---
title: "Promises e async/await"
category: "Assíncrono"
order: 4
source: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Statements/async_function"
sourceLabel: "MDN Web Docs — async function"
officialTranslation: true
---

## O que é uma Promise

Uma `Promise` representa um valor que pode não estar disponível ainda (ex.: resultado de uma consulta ao banco, ou de uma requisição HTTP). Ela tem três estados: *pending* (pendente), *fulfilled* (resolvida) e *rejected* (rejeitada).

```js
fetch('/api/alunos')
  .then((resposta) => resposta.json())
  .then((dados) => console.log(dados))
  .catch((erro) => console.error(erro));
```

## `async`/`await`

`await` só pode ser usado dentro de uma função marcada com `async`. Ele "pausa" a função até a Promise ser resolvida, tornando o código assíncrono parecido com código síncrono.

```js
async function carregarAlunos() {
  try {
    const resposta = await fetch('/api/alunos');
    const dados = await resposta.json();
    console.log(dados);
  } catch (erro) {
    console.error('Erro ao carregar alunos:', erro);
  }
}
```

Toda função `async` retorna, implicitamente, uma `Promise`.

## No lado do servidor (Node.js/Express)

```js
app.get('/api/alunos', async (req, res) => {
  try {
    const [alunos] = await pool.query('SELECT * FROM aluno');
    res.json(alunos);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar alunos.' });
  }
});
```

## No lado do navegador: buscando dados sem recarregar a página

```js
async function buscarAlunos(termo) {
  const resposta = await fetch(`/api/alunos?termo=${encodeURIComponent(termo)}`);
  const alunos = await resposta.json();
  atualizarTabela(alunos); // função que reescreve o HTML da tabela
}

document.querySelector('#form-busca').addEventListener('submit', (evento) => {
  evento.preventDefault(); // impede o recarregamento da página
  const termo = document.querySelector('#campo-busca').value;
  buscarAlunos(termo);
});
```

## Tratamento de erro

Sempre envolva `await` em `try/catch` quando a operação pode falhar (requisição de rede, consulta ao banco), para não deixar o erro "estourar" sem tratamento.
