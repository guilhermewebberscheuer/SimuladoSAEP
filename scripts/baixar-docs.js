#!/usr/bin/env node
// Baixa a documentação oficial para a pasta docs/ (precisa de internet).
// Depois disso o servidor funciona 100% offline.
//
// Uso:
//   npm run baixar-docs                      -> baixa tudo
//   npm run baixar-docs -- javascript nodejs -> só as tecnologias indicadas
//   npm run baixar-docs -- --listar          -> mostra as tecnologias disponíveis
// Opções:
//   --forcar        baixa de novo páginas que já existem localmente
//   --sem-imagens   não baixa imagens
//   --paralelo=N    requisições simultâneas (padrão 6)

const fs = require('fs');
const path = require('path');
const store = require('../lib/store');
const { prepare, escapeHtml } = require('../lib/html');
const fetcher = require('../lib/fetcher');
const { getSources } = require('../lib/sources');
const search = require('../lib/search');

const IMAGE_EXT = /\.(png|jpe?g|gif|svg|webp)$/i;
const CONTENT_TYPE_EXT = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/gif': '.gif', 'image/svg+xml': '.svg', 'image/webp': '.webp' };
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function parseArgs(argv) {
  const opts = { ids: [], force: false, images: true, concurrency: 6, list: false };
  for (const a of argv) {
    if (a === '--forcar') opts.force = true;
    else if (a === '--sem-imagens') opts.images = false;
    else if (a === '--listar') opts.list = true;
    else if (a.startsWith('--paralelo=')) opts.concurrency = Math.max(1, Number(a.split('=')[1]) || 6);
    else if (!a.startsWith('--')) opts.ids.push(a);
  }
  return opts;
}

function createContext(source, opts, shared) {
  const old = store.readManifest(source.id);
  const oldPages = new Map(((old && old.pages) || []).map((p) => [p.slug, p]));
  const pages = new Map();
  const assets = { ...((old && old.assets) || {}) };
  const pendingAssets = new Map();
  const failures = [];
  let version = source.version || null;
  let added = 0;
  let reused = 0;
  let ptAdded = 0;

  const log = (msg) => console.log(`[${source.id}] ${msg}`);

  const manifest = (final) => {
    const merged = new Map(final && failures.length === 0 ? [] : oldPages);
    for (const [k, v] of pages) merged.set(k, v);
    return {
      id: source.id,
      name: source.name,
      description: source.description,
      sourceLabel: source.sourceLabel,
      homepage: source.homepage,
      version,
      language: 'en',
      downloadedAt: new Date().toISOString(),
      complete: !!final,
      pages: [...merged.values()],
      assets,
    };
  };

  async function localizeImage(src) {
    if (!/^https?:/i.test(src)) return src;
    if (assets[src]) return `/docs-files/${source.id}/assets/${assets[src]}`;
    if (!pendingAssets.has(src)) {
      pendingAssets.set(
        src,
        (async () => {
          const { data, contentType } = await fetcher.fetchBuffer(src);
          if (data.length > MAX_IMAGE_BYTES) throw new Error('imagem grande demais');
          const extFromUrl = (new URL(src).pathname.match(IMAGE_EXT) || [])[0];
          const ext = extFromUrl || CONTENT_TYPE_EXT[contentType.split(';')[0].trim()];
          if (!ext) throw new Error(`tipo não suportado: ${contentType}`);
          const file = store.fileIdForSlug(src) + ext.toLowerCase();
          fs.mkdirSync(store.assetsDir(source.id), { recursive: true });
          fs.writeFileSync(path.join(store.assetsDir(source.id), file), data);
          assets[src] = file;
          return file;
        })()
      );
    }
    return `/docs-files/${source.id}/assets/${await pendingAssets.get(src)}`;
  }

  async function prepareWithImages(html, baseUrl, removeSelectors) {
    const { $, images } = prepare(html, baseUrl, { removeSelectors });
    for (const img of images) {
      const $img = $(img);
      const src = $img.attr('src');
      try {
        if (!opts.images) throw new Error('imagens desativadas');
        $img.attr('src', await localizeImage(src));
        $img.attr('data-original-src', src);
      } catch {
        $img.replaceWith(`<span class="img-indisponivel">[imagem: ${escapeHtml($img.attr('alt') || src)}]</span>`);
      }
    }
    return $;
  }

  const ctx = {
    shared,
    log,
    fetchText: fetcher.fetchText,
    fetchJson: fetcher.fetchJson,
    mapLimit: (items, fn) => fetcher.mapLimit(items, opts.concurrency, fn),

    has(slug) {
      if (opts.force) return null;
      const p = oldPages.get(slug);
      if (p && fs.existsSync(store.pagePath(source.id, p.file))) {
        pages.set(slug, p);
        reused++;
        return p;
      }
      return null;
    },

    readStoredHtml(slug) {
      return fs.readFileSync(store.pagePath(source.id, store.fileIdForSlug(slug)), 'utf8');
    },

    fail(url, err) {
      failures.push({ url, error: err.message });
      log(`FALHA ${url}: ${err.message}`);
    },

    setVersion(v) {
      version = v;
    },

    saveShared(name, data) {
      store.writeJson(path.join(store.DOCS_DIR, '_shared', name), data);
    },

    async addPage({ slug, url, title, category, order, html, removeSelectors, baseUrl }) {
      const $ = await prepareWithImages(html, baseUrl || url, removeSelectors);
      const file = store.fileIdForSlug(slug);
      const out = store.pagePath(source.id, file);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, $.html());
      pages.set(slug, { slug, title, category, order: order ?? null, url, file });
      added++;
      if (added % 50 === 0) {
        log(`${added} páginas baixadas...`);
        store.writeManifest(source.id, manifest(false));
      }
    },

    // Versão oficial em português de uma página já registrada (addPage ou has).
    hasTranslation(slug) {
      if (opts.force) return false;
      const p = pages.get(slug);
      return !!(p && p.ptTitle && fs.existsSync(store.officialPtPath(source.id, p.file)));
    },

    async addTranslation(slug, { url, title, html, removeSelectors }) {
      const page = pages.get(slug);
      if (!page) return;
      const $ = await prepareWithImages(html, url, removeSelectors);
      store.writeJson(store.officialPtPath(source.id, page.file), { title, url, html: $.html() });
      page.ptTitle = title;
      page.ptUrl = url;
      ptAdded++;
    },

    // Reordena todas as páginas (inclusive as reaproveitadas) e opcionalmente recalcula a categoria.
    reorder(compare, categoryFn) {
      const sorted = [...pages.values()].sort(compare);
      sorted.forEach((p, i) => {
        p.order = i;
        if (categoryFn) p.category = categoryFn(p.title);
      });
    },
  };

  return {
    ctx,
    finish() {
      store.writeManifest(source.id, manifest(true));
      const ptPages = [...pages.values()].filter((p) => p.ptTitle).length;
      return { pages: pages.size, added, reused, ptAdded, ptPages, failures };
    },
  };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const all = getSources();

  if (opts.list) {
    for (const s of all) console.log(`${s.id.padEnd(16)} ${s.name} — ${s.description}`);
    return;
  }

  const unknown = opts.ids.filter((id) => !all.some((s) => s.id === id));
  if (unknown.length) {
    console.error(`Tecnologia(s) desconhecida(s): ${unknown.join(', ')}. Use --listar para ver as opções.`);
    process.exit(1);
  }
  const selected = opts.ids.length ? all.filter((s) => opts.ids.includes(s.id)) : all;

  const shared = {};
  const summary = [];
  for (const source of selected) {
    const started = Date.now();
    console.log(`\n=== ${source.name} (${source.homepage})`);
    const { ctx, finish } = createContext(source, opts, shared);
    try {
      await source.collect(ctx);
    } catch (err) {
      ctx.fail(source.homepage, err);
    }
    const r = finish();
    const secs = Math.round((Date.now() - started) / 1000);
    ctx.log(`concluído em ${secs}s: ${r.pages} páginas (${r.added} novas, ${r.reused} já existentes), ${r.ptPages} em português oficial (${r.ptAdded} novas), ${r.failures.length} falha(s)`);
    summary.push({ id: source.id, ...r });
  }

  console.log('\nGerando índice de busca...');
  const count = search.buildAndSave();
  console.log(`Índice criado com ${count} trechos.`);

  console.log('\nResumo:');
  for (const s of summary) {
    console.log(`  ${s.id.padEnd(16)} ${String(s.pages).padStart(5)} páginas  ${String(s.ptPages).padStart(5)} em português  ${s.failures.length ? `${s.failures.length} falha(s)` : 'ok'}`);
  }
  const failed = summary.reduce((n, s) => n + s.failures.length, 0);
  if (failed) {
    console.log('\nAlgumas páginas falharam. Rode o mesmo comando de novo: só o que falta será baixado.');
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
