---
title: "Estrutura básica de um documento HTML"
category: "Fundamentos"
order: 1
source: "https://developer.mozilla.org/pt-BR/docs/Learn/Getting_started_with_the_web/HTML_basics"
sourceLabel: "MDN Web Docs — Primeiros passos com HTML"
officialTranslation: true
---

## Estrutura mínima de uma página

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Título da página</title>
</head>
<body>
  <h1>Título principal</h1>
  <p>Conteúdo da página.</p>
</body>
</html>
```

### Elementos principais

- `<!DOCTYPE html>`: declara que o documento é HTML5.
- `<html>`: elemento raiz da página. O atributo `lang` informa o idioma do conteúdo.
- `<head>`: contém metadados (não visíveis na página): `<meta>`, `<title>`, links para CSS, etc.
- `<meta charset="UTF-8">`: define a codificação de caracteres do documento.
- `<title>`: define o título exibido na aba do navegador.
- `<body>`: contém todo o conteúdo visível da página.

### Elementos de texto comuns

| Elemento | Finalidade |
|---|---|
| `<h1>` a `<h6>` | Títulos, do mais importante (`h1`) ao menos importante (`h6`) |
| `<p>` | Parágrafo de texto |
| `<a href="...">` | Link/âncora |
| `<img src="..." alt="...">` | Imagem (o atributo `alt` é obrigatório para acessibilidade) |
| `<ul>` / `<ol>` / `<li>` | Listas não ordenadas, ordenadas e seus itens |
| `<div>` | Bloco genérico sem significado semântico |
| `<span>` | Trecho de texto em linha, sem significado semântico |

### Elementos semânticos (HTML5)

A especificação atual do HTML recomenda o uso de elementos semânticos sempre que possível, pois eles descrevem o papel do conteúdo:

- `<header>`: cabeçalho de página ou seção.
- `<nav>`: bloco de navegação/links.
- `<main>`: conteúdo principal da página (deve haver apenas um por página).
- `<section>`: seção temática de conteúdo.
- `<article>`: conteúdo independente e autocontido (ex.: um post).
- `<footer>`: rodapé de página ou seção.
