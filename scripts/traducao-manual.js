#!/usr/bin/env node
// Tradução feita fora do sistema (à mão ou por uma IA), salva como tradução não oficial.
// Só o texto é extraído: tags, links e blocos de código ficam intactos.
//
//   node scripts/traducao-manual.js extrair <tech> <slug> <arquivo.txt>
//       grava os trechos de texto da página, numerados assim:
//         @@ 0
//         Título da página
//         @@ 1
//         The <code>res</code> object represents...
//   node scripts/traducao-manual.js aplicar <tech> <slug> <arquivo.txt> [--autor=Nome]
//       lê o arquivo com os trechos traduzidos (mesma numeração), recoloca no HTML
//       original e salva em docs/<tech>/pt/.
//   node scripts/traducao-manual.js pendentes [tech...]
//       lista as páginas sem versão oficial em português e sem tradução, com o tamanho do texto.

const fs = require('fs');
const cheerio = require('cheerio');
const store = require('../lib/store');

const BLOCK = new Set([
  'address', 'article', 'aside', 'blockquote', 'caption', 'dd', 'details', 'dialog', 'div', 'dl', 'dt',
  'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header',
  'hr', 'li', 'main', 'nav', 'ol', 'p', 'pre', 'section', 'summary', 'table', 'tbody', 'td', 'tfoot',
  'th', 'thead', 'tr', 'ul',
]);
const SKIP = new Set(['pre', 'code', 'kbd', 'samp', 'var', 'script', 'style', 'svg', 'math']);

const isTag = (n) => n.type === 'tag';
const hasLetters = (s) => /\p{L}{2,}/u.test(s);

// Texto que precisa de tradução (ignora o que está dentro de <code> etc.).
function prose($, nodes) {
  let out = '';
  for (const n of nodes) {
    if (n.type === 'text') out += n.data;
    else if (isTag(n) && !SKIP.has(n.name)) out += prose($, n.children || []);
  }
  return out;
}

function hasBlockDescendant(el) {
  return (el.children || []).some((c) => isTag(c) && (BLOCK.has(c.name) || hasBlockDescendant(c)));
}

/**
 * Marca cada trecho traduzível com data-tseg="N" e retorna { $, segments }.
 * A numeração é determinística: rodar de novo no mesmo HTML gera os mesmos números.
 */
function segment(html) {
  const $ = cheerio.load(html, null, false);
  const segments = [];

  const visit = (el, isRoot) => {
    if (!isRoot && SKIP.has(el.name)) return;
    if (!isRoot && !hasBlockDescendant(el)) {
      if (hasLetters(prose($, el.children || []))) {
        $(el).attr('data-tseg', String(segments.length));
        segments.push($(el).html());
      }
      return;
    }
    // Elemento com blocos dentro: agrupa os trechos soltos de texto/inline em <span data-tseg>.
    let run = [];
    const flush = () => {
      if (run.length && hasLetters(prose($, run))) {
        const $span = $(`<span data-tseg="${segments.length}"></span>`);
        $(run[0]).before($span);
        $span.append(run);
        segments.push($span.html());
      }
      run = [];
    };
    for (const child of [...(el.children || [])]) {
      if (isTag(child) && (BLOCK.has(child.name) || hasBlockDescendant(child))) {
        flush();
        visit(child, false);
      } else {
        run.push(child);
      }
    }
    flush();
  };

  visit($.root()[0], true);
  return { $, segments };
}

// Rótulos repetidos da documentação, traduzidos automaticamente.
const LABELS = {
  'Type:': 'Tipo:',
  'Default:': 'Padrão:',
  'Returns:': 'Retorna:',
  'Added in:': 'Adicionado em:',
  'Deprecated in:': 'Obsoleto desde:',
  'Terminal window': 'Janela do terminal',
};
const WHOLE = {
  Arguments: 'Argumentos',
  Note: 'Observação',
  Caution: 'Cuidado',
  Warning: 'Atenção',
  Tip: 'Dica',
  Important: 'Importante',
  'For example:': 'Por exemplo:',
  Example: 'Exemplo',
  Examples: 'Exemplos',
  Properties: 'Propriedades',
  Methods: 'Métodos',
  Events: 'Eventos',
  Options: 'Opções',
};
// Trechos que ficam iguais (nomes de abas e de arquivos).
const KEEP = /^(JavaScript|TypeScript|CommonJS|ESM|JSON|HTML|SQL|Bash|Shell|npm|yarn|pnpm)$/;

function autoTranslate(seg) {
  let s = seg.trim();
  if (WHOLE[s]) return WHOLE[s];
  if (KEEP.test(s)) return s;
  s = s.replace(/(<span class="(?:param__label|signature__line-label|sr-only)">)([^<]+)(<\/span>)/g, (m, a, label, b) =>
    LABELS[label] ? a + LABELS[label] + b : m
  );
  // Sobrou algum texto fora de tags, <code> e nomes de arquivo?
  const $ = cheerio.load(s, null, false);
  $('code, .title').remove();
  const rest = $.root().text().trim();
  // Nomes de API sozinhos (ex.: "res.json()", "router.METHOD()") ficam iguais.
  if (/^[\w$.]+(\(\))?$/.test(rest) && /[.(]/.test(rest)) return s;
  if (!rest || Object.values(LABELS).some((v) => v === rest) || /^(Tipo:|Padrão:|Retorna:|Adicionado em:|Obsoleto desde:|↵|\s)+$/u.test(rest)) {
    return s;
  }
  return null;
}

// Grava só os trechos que precisam de tradução manual.
function serialize(title, segments) {
  return [title, ...segments]
    .map((s, i) => (i > 0 && autoTranslate(s) !== null ? '' : `@@ ${i}\n${s.trim()}\n`))
    .join('');
}

function parse(text) {
  const out = [];
  for (const part of text.split(/^@@ (\d+)\s*$/m).slice(1).reduce((acc, v, i, arr) => {
    if (i % 2 === 0) acc.push([Number(v), arr[i + 1]]);
    return acc;
  }, [])) {
    out[part[0]] = part[1].trim();
  }
  return out;
}

function findPage(techId, slug) {
  const manifest = store.readManifest(techId);
  const page = manifest && manifest.pages.find((p) => p.slug === slug);
  if (!page) throw new Error(`Página não encontrada: ${techId}/${slug}`);
  return page;
}

function readOriginal(techId, page) {
  return fs.readFileSync(store.pagePath(techId, page.file), 'utf8');
}

function pending(ids) {
  const techs = ids.length ? ids : store.listDownloadedTechs();
  for (const techId of techs) {
    for (const page of store.readManifest(techId).pages) {
      if (page.ptTitle || fs.existsSync(store.translationPath(techId, page.file))) continue;
      const { segments } = segment(readOriginal(techId, page));
      const chars = segments.reduce((n, s) => n + s.length, 0);
      console.log(`${String(chars).padStart(8)}  ${techId}/${page.slug}`);
    }
  }
}

function main() {
  const [cmd, techId, slug, file] = process.argv.slice(2);
  if (cmd === 'pendentes') return pending(process.argv.slice(3));

  const author = (process.argv.find((a) => a.startsWith('--autor=')) || '--autor=tradução manual').split('=')[1];
  if (!['extrair', 'aplicar'].includes(cmd) || !techId || !slug || !file) {
    console.error('Uso: traducao-manual.js extrair|aplicar <tech> <slug> <arquivo.txt> [--autor=Nome]');
    console.error('     traducao-manual.js pendentes [tech...]');
    process.exit(1);
  }
  const page = findPage(techId, slug);
  const { $, segments } = segment(readOriginal(techId, page));

  if (cmd === 'extrair') {
    const text = serialize(page.title, segments);
    fs.writeFileSync(file, text);
    console.log(`${file}: ${segments.length + 1} trechos, ${text.length} caracteres`);
    return;
  }

  const translated = parse(fs.readFileSync(file, 'utf8'));
  const missing = [];
  for (let i = 0; i <= segments.length; i++) {
    if (!translated[i] && i > 0) translated[i] = autoTranslate(segments[i - 1]);
    if (!translated[i]) missing.push(i);
  }
  if (missing.length) throw new Error(`Faltam os trechos: ${missing.join(', ')}`);
  if (translated.length > segments.length + 1) {
    throw new Error(`O arquivo tem ${translated.length} trechos; a página tem ${segments.length + 1}.`);
  }

  // Confere se cada trecho manteve os mesmos <code> e links do original.
  const count = (s, re) => (s.match(re) || []).length;
  segments.forEach((orig, i) => {
    const tr = translated[i + 1];
    for (const re of [/<code\b/g, /<a\b/g]) {
      if (count(orig, re) !== count(tr, re)) {
        throw new Error(`Trecho ${i + 1}: quantidade de ${re.source.slice(1, -2)} diferente do original.`);
      }
    }
  });

  $('[data-tseg]').each((_, el) => {
    const $el = $(el);
    $el.html(translated[Number($el.attr('data-tseg')) + 1]);
    if (el.name === 'span' && Object.keys(el.attribs).length === 1) $el.replaceWith($el.contents());
    else $el.removeAttr('data-tseg');
  });

  store.writeJson(store.translationPath(techId, page.file), {
    title: translated[0],
    html: $.html(),
    model: author,
    translatedAt: new Date().toISOString(),
  });
  console.log(`Tradução salva: ${techId}/${slug}`);
}

try {
  main();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
