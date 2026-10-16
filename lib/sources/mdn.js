// MDN Web Docs (developer.mozilla.org) — JavaScript, HTML, CSS, APIs Web e HTTP.
// Cada página é obtida pelo endpoint oficial <url>/index.json, que traz o
// conteúdo já renderizado pelo próprio MDN.

const { escapeHtml } = require('../html');

const MDN = 'https://developer.mozilla.org';
const REDIRECTS_URL = 'https://raw.githubusercontent.com/mdn/content/main/files/en-us/_redirects.txt';

async function getSearchIndex(ctx) {
  if (!ctx.shared.mdnIndex) {
    ctx.log('Baixando índice de páginas do MDN...');
    ctx.shared.mdnIndex = ctx.fetchJson(`${MDN}/en-US/search-index.json`);
  }
  return ctx.shared.mdnIndex;
}

// Páginas que têm versão oficial em português (pt-BR), pelo caminho em minúsculas.
async function getPtIndex(ctx) {
  if (!ctx.shared.mdnPtIndex) {
    ctx.shared.mdnPtIndex = ctx
      .fetchJson(`${MDN}/pt-BR/search-index.json`)
      .then((list) => new Map(list.map((p) => [p.url.toLowerCase(), p.url])))
      .catch((err) => {
        ctx.log(`Aviso: índice pt-BR do MDN indisponível (${err.message})`);
        return new Map();
      });
  }
  return ctx.shared.mdnPtIndex;
}

// Lista oficial de redirecionamentos do MDN: permite que links antigos
// dentro das páginas continuem apontando para a cópia local.
async function saveRedirects(ctx) {
  if (ctx.shared.mdnRedirects) return;
  ctx.shared.mdnRedirects = true;
  try {
    const txt = await ctx.fetchText(REDIRECTS_URL);
    const map = {};
    for (const line of txt.split('\n')) {
      if (!line || line.startsWith('#')) continue;
      const [from, to] = line.split('\t');
      if (from && to) map[from.trim().toLowerCase()] = to.trim();
    }
    ctx.saveShared('mdn-redirects.json', map);
  } catch (err) {
    ctx.log(`Aviso: não foi possível baixar os redirecionamentos do MDN (${err.message})`);
  }
}

function renderBody(doc) {
  const parts = [];
  for (const section of doc.body || []) {
    const v = section.value || {};
    const tag = v.isH3 ? 'h3' : 'h2';
    const heading = v.title ? `<${tag}${v.id ? ` id="${escapeHtml(v.id)}"` : ''}>${escapeHtml(v.title)}</${tag}>` : '';

    if (section.type === 'prose') {
      parts.push(heading + (v.content || ''));
    } else if (section.type === 'specifications') {
      const items = (v.specifications || [])
        .map((s) => `<li><a href="${escapeHtml(s.bcdSpecificationURL)}">${escapeHtml(s.title)}</a></li>`)
        .join('');
      parts.push(heading + (items ? `<ul>${items}</ul>` : ''));
    } else if (section.type === 'browser_compatibility') {
      parts.push(
        heading +
          '<p class="aviso-offline">[A tabela de compatibilidade entre navegadores é interativa e só está disponível no site oficial.]</p>'
      );
    }
  }
  return parts.join('\n');
}

function categoryFor(doc, rootPath) {
  const parents = (doc.parents || []).filter((p) => p.uri.length > rootPath.length);
  const trail = parents.slice(0, -1).map((p) => p.title);
  return trail.slice(0, 3).join(' › ') || 'Visão geral';
}

/**
 * @param {object} cfg
 * @param {string} cfg.rootPath   ex.: '/en-US/docs/Web/JavaScript'
 * @param {(url: string) => boolean} [cfg.include] filtro adicional de URLs
 */
function mdnSource(cfg) {
  const { rootPath } = cfg;
  const include = cfg.include || ((url) => url === rootPath || url.startsWith(`${rootPath}/`));

  return {
    id: cfg.id,
    name: cfg.name,
    description: cfg.description,
    sourceLabel: 'MDN Web Docs (Mozilla) — developer.mozilla.org',
    homepage: `${MDN}${rootPath}`,

    async collect(ctx) {
      await saveRedirects(ctx);
      const index = await getSearchIndex(ctx);
      const ptIndex = await getPtIndex(ctx);
      const entries = index.filter((p) => include(p.url));
      ctx.log(`${entries.length} páginas encontradas`);

      await ctx.mapLimit(entries, async (entry) => {
        const slug = entry.url === rootPath ? 'index' : entry.url.slice(rootPath.length + 1);
        if (!ctx.has(slug)) {
          const url = `${MDN}${entry.url}`;
          let doc;
          try {
            doc = (await ctx.fetchJson(`${url}/index.json`)).doc;
          } catch (err) {
            return ctx.fail(url, err);
          }
          await ctx.addPage({
            slug,
            url,
            title: doc.title || entry.title,
            category: categoryFor(doc, rootPath),
            html: renderBody(doc),
          });
        }

        // Versão oficial em português, quando a comunidade do MDN já traduziu a página.
        const ptPath = ptIndex.get(entry.url.replace(/^\/en-US\//, '/pt-BR/').toLowerCase());
        if (!ptPath || ctx.hasTranslation(slug)) return;
        try {
          const ptDoc = (await ctx.fetchJson(`${MDN}${ptPath}/index.json`)).doc;
          if (ptDoc.locale === 'pt-BR') {
            await ctx.addTranslation(slug, { url: `${MDN}${ptPath}`, title: ptDoc.title, html: renderBody(ptDoc) });
          }
        } catch (err) {
          ctx.log(`Aviso: versão pt-BR indisponível para ${ptPath} (${err.message})`);
        }
      });
    },
  };
}

module.exports = { mdnSource };
