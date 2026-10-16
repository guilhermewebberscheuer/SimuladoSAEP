// Índice de busca. Cada página é dividida em trechos (um por título h2/h3),
// para que a busca leve direto à seção certa de páginas longas.

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const MiniSearch = require('minisearch');
const store = require('./store');

const INDEX_FILE = path.join(store.DOCS_DIR, 'search-index.json');
const INDEX_VERSION = 2;

const normalizeTerm = (term) =>
  term
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const OPTIONS = {
  fields: ['title', 'heading', 'text'],
  storeFields: ['tech', 'slug', 'title', 'heading', 'anchor', 'snippet', 'lang'],
  processTerm: (term) => {
    const t = normalizeTerm(term);
    return t.length > 1 ? t : null;
  },
  // Mantém nomes como "Array.prototype.map" e "res.json" como termos pesquisáveis.
  tokenize: (text) => text.split(/[\s\-()[\]{}<>,;:!?"'`|/\\=+*&^%$#@~]+/u).flatMap((w) => [w, ...w.split('.')]),
  searchOptions: {
    boost: { title: 6, heading: 3 },
    prefix: true,
    fuzzy: (term) => (term.length > 5 ? 0.15 : 0),
  },
};

function splitSections(html) {
  const $ = cheerio.load(html, null, false);
  $('.page-toc, pre').remove(); // sumário e código não entram no texto do índice
  // Espaço entre elementos de bloco, para o texto não sair grudado ("Argumentsbody").
  const spaced = $.html().replace(/<\/?(p|div|li|dt|dd|tr|td|th|h\d|br|table|ul|ol|dl|section|span)\b[^>]*>/gi, ' $& ');
  const parts = spaced.split(/(?=<h[234][\s>])/i); // h4: métodos na API do Node (ex.: fs.readFile)
  return parts.map((part) => {
    const $p = cheerio.load(part, null, false);
    const $h = $p('h2, h3, h4').first();
    let heading = '';
    let anchor = '';
    if ($h.length && part.trimStart().match(/^<h[234]/i)) {
      heading = $h.text().replace(/\s+/g, ' ').trim().replace(/\s*#$/, '');
      anchor = $h.attr('id') || $h.find('[id]').attr('id') || $h.find('a[name]').attr('name') || '';
      $h.remove();
    }
    const text = $p.root().text().replace(/\s+/g, ' ').trim();
    return { heading, anchor, text };
  });
}

function* documentsFor(techId, page, html, lang, title) {
  const sections = splitSections(html);
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    if (!s.text && !s.heading) continue;
    yield {
      id: `${lang}:${techId}/${page.slug}#${i}`,
      tech: techId,
      slug: page.slug,
      lang,
      title,
      heading: s.heading,
      anchor: s.anchor,
      text: s.text,
      snippet: s.text.slice(0, 200),
    };
  }
}

function buildIndex() {
  const ms = new MiniSearch(OPTIONS);
  for (const techId of store.listDownloadedTechs()) {
    const manifest = store.readManifest(techId);
    for (const page of manifest.pages) {
      const file = store.pagePath(techId, page.file);
      if (!fs.existsSync(file)) continue;
      ms.addAll([...documentsFor(techId, page, fs.readFileSync(file, 'utf8'), 'en', page.title)]);

      // Português oficial = 'pt'; tradução automática = 'pt-auto' (some no modo prova).
      const official = page.ptTitle && store.readJson(store.officialPtPath(techId, page.file));
      if (official && official.html) ms.addAll([...documentsFor(techId, page, official.html, 'pt', official.title)]);
      const auto = store.readJson(store.translationPath(techId, page.file));
      if (auto && auto.html) ms.addAll([...documentsFor(techId, page, auto.html, 'pt-auto', auto.title || page.title)]);
    }
  }
  return ms;
}

function buildAndSave() {
  const ms = buildIndex();
  store.writeJson(INDEX_FILE, { version: INDEX_VERSION, builtAt: new Date().toISOString(), index: ms.toJSON() });
  return ms.documentCount;
}

function load() {
  const saved = store.readJson(INDEX_FILE);
  if (saved && saved.version === INDEX_VERSION) {
    return MiniSearch.loadJS(saved.index, OPTIONS);
  }
  console.log('Índice de busca não encontrado; gerando agora (pode levar alguns segundos)...');
  buildAndSave();
  return MiniSearch.loadJS(store.readJson(INDEX_FILE).index, OPTIONS);
}

/**
 * Busca e agrupa os trechos por página (no máximo 3 trechos por página).
 * Com lang = 'en' só considera o original; com 'pt' considera os dois idiomas
 * (a tradução automática só entra se allowAuto).
 */
function query(ms, q, { lang = 'en', tech = null, limit = 30, allowAuto = true } = {}) {
  const langOk = (l) => l === 'en' || (lang === 'pt' && (l === 'pt' || (allowAuto && l === 'pt-auto')));
  const filter = (r) => langOk(r.lang) && (!tech || r.tech === tech);
  let hits = ms.search(q, { filter, combineWith: 'AND' });
  if (hits.length === 0) hits = ms.search(q, { filter, combineWith: 'OR' });

  const pages = new Map();
  for (const h of hits) {
    const key = `${h.tech}/${h.slug}`;
    if (!pages.has(key)) {
      if (pages.size >= limit) continue;
      pages.set(key, { tech: h.tech, slug: h.slug, title: h.title, score: h.score, sections: [] });
    }
    const page = pages.get(key);
    if (page.sections.length < 3 && !page.sections.some((s) => s.anchor === h.anchor && s.heading === h.heading)) {
      page.sections.push({ heading: h.heading, anchor: h.anchor, snippet: h.snippet, lang: h.lang });
    }
  }
  return [...pages.values()];
}

module.exports = { buildAndSave, load, query };
