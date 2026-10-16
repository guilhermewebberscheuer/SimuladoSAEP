---
title: "Formulários (form, input, select, label)"
category: "Formulários"
order: 2
source: "https://developer.mozilla.org/pt-BR/docs/Learn/Forms"
sourceLabel: "MDN Web Docs — Formulários da Web"
officialTranslation: true
---

## Estrutura básica

```html
<form action="/alunos" method="POST">
  <label for="nome">Nome:</label>
  <input type="text" id="nome" name="nome" required>

  <label for="email">E-mail:</label>
  <input type="email" id="email" name="email">

  <button type="submit">Salvar</button>
</form>
```

- `action`: rota para onde os dados são enviados.
- `method`: método HTTP usado (`GET` ou `POST`; formulários HTML só suportam esses dois diretamente).
- O atributo `name` de cada campo é a chave usada em `req.body` no servidor (ex.: `req.body.nome`).
- `for` no `<label>` deve bater com o `id` do campo correspondente — isso associa o rótulo ao campo (clicar no rótulo foca o campo).

## Tipos de `<input>` comuns

| Tipo | Uso |
|---|---|
| `text` | Texto livre |
| `email` | Texto validado como e-mail pelo navegador |
| `password` | Texto oculto (pontos/asteriscos) |
| `number` | Apenas números |
| `date` | Seletor de data |
| `checkbox` | Caixa de marcação (verdadeiro/falso) |
| `radio` | Opção única dentro de um grupo (mesmo `name`) |
| `hidden` | Campo não visível, enviado junto com o formulário (ex.: um `id`) |

## `<select>` (lista suspensa)

```html
<label for="plano">Plano de treino:</label>
<select id="plano" name="plano_treino_id">
  <option value="1">Emagrecimento</option>
  <option value="2">Hipertrofia</option>
</select>
```

## `<textarea>` (texto longo)

```html
<textarea name="observacoes" rows="4" cols="40"></textarea>
```

## Atributos de validação nativa do navegador

```html
<input type="text" name="nome" required minlength="3" maxlength="100">
<input type="number" name="idade" min="0" max="120">
```

## Formulário de edição (pré-preenchido)

Em uma página renderizada pelo servidor (ex.: EJS), os valores atuais são colocados no atributo `value`:

```html
<input type="text" name="nome" value="<%= aluno.nome %>">
```
