// Leitura da documentação baixada (docs/) para o servidor.

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const store = require('./store');
const { normalizeUrl } = require('./html');
const { getSources } = require('./sources');
const escopo = require('./escopo');

const CACHE_LIMIT = 300;

function localPath(techId, slug) {
  return `/docs/${techId}/${slug.split('/').map(encodeURIComponent).join('/')}`;
}

function sortPages(pages) {
  const catMin = new Map();
  for (const p of pages) {
    if (p.order != null) catMin.set(p.category, Math.min(catMin.get(p.category) ?? Infinity, p.order));
  }
  const byCategory = (a, b) =>
    (catMin.get(a.category) ?? Infinity) - (catMin.get(b.category) ?? Infinity) ||
    a.category.localeCompare(b.category, 'en', { numeric: true });
  return pages.sort(
    (a, b) =>
      byCategory(a, b) ||
      (a.order ?? Infinity) - (b.order ?? Infinity) ||
      a.title.localeCompare(b.title, 'en', { numeric: true })
  );
}

function groupCategories(pages) {
  const groups = [];
  for (const p of pages) {
    const last = groups[groups.length - 1];
    if (last && last.name === p.category) last.pages.push(p);
    else groups.push({ name: p.category, pages: [p] });
  }
  return groups;
}

function load() {
  const order = getSources().map((s) => s.id);
  const rank = (id) => (order.includes(id) ? order.indexOf(id) : order.length);
  const ids = store.listDownloadedTechs().sort((a, b) => rank(a) - rank(b));

  const techs = [];
  const pages = new Map(); // "tech/slug" -> page
  const urlMap = new Map(); // url normalizada -> caminho local
  const translated = new Set(); // "tech/slug" com tradução automática (não oficial)

  for (const id of ids) {
    const manifest = store.readManifest(id);
    const ptDir = path.join(store.techDir(id), 'pt');
    const ptFiles = new Set(fs.existsSync(ptDir) ? fs.readdirSync(ptDir).map((f) => f.replace(/\.json$/, '')) : []);

    const techPages = sortPages(
      escopo.filtrar(id, manifest.pages).map((p) => ({ ...p, techId: id, href: localPath(id, p.slug) }))
    );
    for (const p of techPages) {
      pages.set(`${id}/${p.slug}`, p);
      const key = normalizeUrl(p.url);
      if (key && !urlMap.has(key)) urlMap.set(key, p.href);
      if (ptFiles.has(p.file)) {
        translated.add(`${id}/${p.slug}`);
        const t = store.readJson(store.translationPath(id, p.file));
        if (t && t.title) p.autoTitle = t.title;
      }
    }
    const { assets, pages: _omit, ...meta } = manifest;
    if (techPages.length === 0) continue; // tecnologia fora do escopo da prova
    const ptCount = techPages.filter((p) => p.ptTitle).length;
    techs.push({ ...meta, pages: techPages, totalPages: manifest.pages.length, ptCount, categories: groupCategories(techPages) });
  }

  const mdnRedirects = store.readJson(path.join(store.DOCS_DIR, '_shared', 'mdn-redirects.json'), {});
  return { techs, pages, urlMap, translated, mdnRedirects, cache: new Map() };
}

const LOCALE_PATHS = [
  ['developer.mozilla.org', /^\/pt-BR\//i, '/en-US/'],
  ['expressjs.com', /^\/pt-br\//i, '/en/'],
  ['sidorares.github.io', /^\/node-mysql2\/pt-BR\//i, '/node-mysql2/'],
];

function resolveHref(lib, href) {
  let u;
  try {
    u = new URL(href);
  } catch {
    return null;
  }
  const hash = u.hash || '';
  // Links das versões em português apontam para /pt-BR/...; a cópia local é indexada pela URL em inglês.
  for (const [host, from, to] of LOCALE_PATHS) {
    if (u.hostname === host && from.test(u.pathname)) u.pathname = u.pathname.replace(from, to);
  }
  let key = normalizeUrl(u.href);
  if (lib.urlMap.has(key)) return lib.urlMap.get(key) + hash;

  if (u.hostname === 'developer.mozilla.org') {
    let p = decodeURIComponent(u.pathname).replace(/\/+$/, '');
    for (let i = 0; i < 3; i++) {
      const to = lib.mdnRedirects[p.toLowerCase()];
      if (!to) break;
      if (/^https?:/.test(to)) return null;
      p = to.split('#')[0];
      key = normalizeUrl(`https://developer.mozilla.org${p}`);
      if (lib.urlMap.has(key)) return lib.urlMap.get(key) + (to.includes('#') ? `#${to.split('#')[1]}` : hash);
    }
  }
  return null;
}

function rewriteLinks(lib, html) {
  const $ = cheerio.load(html, null, false);
  $('a[href]').each((_, a) => {
    const $a = $(a);
    const href = $a.attr('href');
    if (href.startsWith('#') || /^mailto:/i.test(href)) return;
    const local = resolveHref(lib, href);
    if (local) {
      $a.attr('href', local);
    } else {
      $a.addClass('link-externo').attr({ target: '_blank', rel: 'noopener', title: 'Link externo — requer internet' });
    }
  });
  return $.html();
}

/**
 * Conteúdo de uma página no idioma pedido. Com lang = 'pt' usa, nesta ordem:
 * a versão oficial em português, a tradução automática (se permitida) ou o original.
 * Retorna { html, title, kind: 'en' | 'oficial' | 'automatica', ptUrl?, translation? }.
 */
function render(lib, page, lang, { allowAuto = true } = {}) {
  const key = `${page.techId}/${page.slug}`;
  let kind = 'en';
  if (lang === 'pt' && page.ptTitle) kind = 'oficial';
  else if (lang === 'pt' && allowAuto && lib.translated.has(key)) kind = 'automatica';

  const cacheKey = `${kind}:${key}`;
  if (lib.cache.has(cacheKey)) return lib.cache.get(cacheKey);

  let result;
  if (kind === 'oficial') {
    const t = store.readJson(store.officialPtPath(page.techId, page.file));
    result = { kind, html: rewriteLinks(lib, t.html), title: t.title || page.ptTitle, ptUrl: t.url };
  } else if (kind === 'automatica') {
    const t = store.readJson(store.translationPath(page.techId, page.file));
    result = {
      kind,
      html: rewriteLinks(lib, t.html),
      title: t.title || page.title,
      translation: { model: t.model, translatedAt: t.translatedAt },
    };
  } else {
    const raw = fs.readFileSync(store.pagePath(page.techId, page.file), 'utf8');
    result = { kind, html: rewriteLinks(lib, raw), title: page.title };
  }

  if (lib.cache.size >= CACHE_LIMIT) lib.cache.delete(lib.cache.keys().next().value);
  lib.cache.set(cacheKey, result);
  return result;
}

module.exports = { load, render, localPath };
