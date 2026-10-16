// Limpeza do HTML baixado. O texto da documentação oficial NÃO é alterado:
// apenas removemos scripts/menus, tornamos links absolutos e normalizamos
// blocos de código para que sejam exibidos corretamente offline.

const cheerio = require('cheerio');

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Chave usada para casar links entre páginas (ignora caixa, barra final, .html).
function normalizeUrl(href) {
  try {
    const u = new URL(href);
    let p = decodeURIComponent(u.pathname).toLowerCase();
    p = p.replace(/\/index\.(html|json)$/, '').replace(/\.html$/, '').replace(/\/+$/, '');
    return `${u.hostname.toLowerCase()}${p}`;
  } catch {
    return null;
  }
}

function absolutize(href, baseUrl) {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return href;
  }
}

function detectLanguage($el) {
  const cls = `${$el.attr('class') || ''} ${$el.find('code').attr('class') || ''}`;
  const m = cls.match(/language-([\w-]+)/) || cls.match(/brush:\s*([\w-]+)/);
  if (m) return m[1];
  return $el.attr('data-language') || $el.closest('[data-language]').attr('data-language') || '';
}

function flattenTabs($) {
  $('[role=tablist]').each((_, tl) => {
    const $tl = $(tl);
    const labels = $tl
      .find('[role=tab]')
      .map((__, t) => $(t).text().trim())
      .get();
    const $panels = $tl.parent().find('[role=tabpanel], .code-tabs__panel');
    $panels.each((i, panel) => {
      if (labels[i]) $(panel).before(`<p class="tab-label">${escapeHtml(labels[i])}</p>`);
    });
    $tl.remove();
  });
}

function normalizeCodeBlocks($) {
  $('pre').each((_, pre) => {
    const $pre = $(pre);
    const lang = detectLanguage($pre);
    const $lines = $pre.find('.ec-line, .token-line');
    let text;
    if ($lines.length) {
      text = $lines.map((__, l) => $(l).text()).get().join('\n');
    } else {
      $pre.find('br').replaceWith('\n');
      text = $pre.text();
    }
    const cls = lang ? ` class="language-${escapeHtml(lang)}"` : '';
    $pre.replaceWith(`<pre${cls}><code${cls}>${escapeHtml(text.replace(/\n+$/, ''))}</code></pre>`);
  });
}

/**
 * Prepara um fragmento de HTML oficial para armazenamento.
 * Retorna { $, images } — `images` são os <img> com src absoluto, para download.
 */
function prepare(html, baseUrl, { removeSelectors = [] } = {}) {
  const $ = cheerio.load(html, null, false);

  $(['script', 'style', 'noscript', 'link', 'meta', 'template', ...removeSelectors].join(',')).remove();
  $('iframe').replaceWith(
    '<p class="aviso-offline">[Exemplo interativo disponível apenas no site oficial — indisponível offline]</p>'
  );

  flattenTabs($);
  normalizeCodeBlocks($);
  $('button').remove();

  // Elementos customizados (ex.: <interactive-example>) viram apenas o conteúdo interno.
  $('*')
    .filter((_, el) => el.type === 'tag' && el.name.includes('-'))
    .each((_, el) => {
      $(el).replaceWith($(el).contents());
    });

  $('*').each((_, el) => {
    for (const name of Object.keys(el.attribs || {})) {
      if (/^on/i.test(name) || name === 'hidden' || name === 'srcset' || name === 'loading') {
        $(el).removeAttr(name);
      }
    }
  });

  $('a[href]').each((_, a) => {
    const href = $(a).attr('href').trim();
    if (/^javascript:/i.test(href)) return $(a).removeAttr('href');
    if (href.startsWith('#') || /^mailto:/i.test(href)) return;
    $(a).attr('href', absolutize(href, baseUrl));
  });

  const images = [];
  $('img[src]').each((_, img) => {
    const abs = absolutize($(img).attr('src'), baseUrl);
    $(img).attr('src', abs);
    images.push(img);
  });

  return { $, images };
}

// Texto puro de um trecho HTML (para busca).
function toPlainText(html) {
  return cheerio.load(html, null, false).root().text().replace(/\s+/g, ' ').trim();
}

// Alguns sites têm a URL em português, mas a página ainda está em inglês.
// Compara palavras muito comuns de cada idioma (ignorando blocos de código).
const PT_WORDS = new Set(['de', 'que', 'para', 'uma', 'com', 'não', 'é', 'os', 'as', 'do', 'da', 'em', 'um', 'se', 'por', 'são', 'você', 'como']);
const EN_WORDS = new Set(['the', 'and', 'of', 'to', 'is', 'that', 'for', 'with', 'this', 'are', 'you', 'it', 'be', 'by', 'an', 'or', 'can', 'when']);
function isPortuguese(html) {
  const $ = cheerio.load(html, null, false);
  $('pre, code').remove();
  let pt = 0;
  let en = 0;
  for (const w of $.root().text().toLowerCase().split(/[^a-zà-ú]+/)) {
    if (PT_WORDS.has(w)) pt++;
    else if (EN_WORDS.has(w)) en++;
  }
  return pt > en;
}

module.exports = { prepare, normalizeUrl, absolutize, escapeHtml, toPlainText, isPortuguese };
