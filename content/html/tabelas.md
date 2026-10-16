---
title: "Tabelas (table, thead, tbody, tr, td)"
category: "Formulários"
order: 3
source: "https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/table"
sourceLabel: "MDN Web Docs — Elemento <table>"
officialTranslation: true
---

## Estrutura básica

```html
<table>
  <thead>
    <tr>
      <th>Nome</th>
      <th>E-mail</th>
      <th>Ações</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Ana Souza</td>
      <td>ana@email.com</td>
      <td><a href="/alunos/1/editar">Editar</a></td>
    </tr>
    <tr>
      <td>Bruno Lima</td>
      <td>bruno@email.com</td>
      <td><a href="/alunos/2/editar">Editar</a></td>
    </tr>
  </tbody>
</table>
```

- `<table>`: elemento raiz da tabela.
- `<thead>`: cabeçalho da tabela (geralmente uma linha com os títulos das colunas, usando `<th>`).
- `<tbody>`: corpo da tabela, com os dados em si.
- `<tr>`: uma linha (*table row*).
- `<th>`: célula de cabeçalho (texto em negrito/centralizado por padrão).
- `<td>`: célula de dado comum.

## Gerando linhas dinamicamente a partir do servidor (EJS)

```html
<table>
  <thead>
    <tr><th>Nome</th><th>E-mail</th></tr>
  </thead>
  <tbody>
    <% alunos.forEach(function(aluno) { %>
      <tr>
        <td><%= aluno.nome %></td>
        <td><%= aluno.email %></td>
      </tr>
    <% }) %>
  </tbody>
</table>
```

## Mesclando células: `colspan` e `rowspan`

```html
<tr>
  <td colspan="2">Ocupa duas colunas</td>
</tr>
```
