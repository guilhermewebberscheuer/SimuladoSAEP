// Manuais oficiais do MySQL (dev.mysql.com/doc). A Oracle não oferece mais o
// pacote HTML para download, então as páginas são percorridas a partir do
// sumário (div.toc) de cada capítulo escolhido.

const cheerio = require('cheerio');

function sectionNumber(title) {
  const m = title.match(/^(\d+(?:\.\d+)*)\s/);
  return m ? m[1].split('.').map(Number) : null;
}

function compareNumbers(a, b) {
  if (!a) return b ? 1 : 0;
  if (!b) return -1;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const d = (a[i] ?? -1) - (b[i] ?? -1);
    if (d) return d;
  }
  return 0;
}

function childLinks($, $scope) {
  const out = [];
  $scope
    .find('div.toc')
    .first()
    .find('a[href]')
    .each((_, a) => {
      const file = ($(a).attr('href') || '').split('#')[0].split('/').pop();
      if (/^[\w.-]+\.html$/.test(file)) out.push(file);
    });
  return out;
}

/**
 * @param {object} cfg
 * @param {string} cfg.base   URL base do manual, terminando em '/'
 * @param {string[]} cfg.start páginas iniciais (capítulos)
 */
function mysqlSource(cfg) {
  return {
    id: cfg.id,
    name: cfg.name,
    description: cfg.description,
    sourceLabel: cfg.sourceLabel,
    homepage: cfg.base,
    version: cfg.version,

    async collect(ctx) {
      const seen = new Set(cfg.start);
      const titles = new Map(); // "15.2" -> "15.2 Data Manipulation Statements"
      const collected = [];
      let queue = [...cfg.start];

      const visit = async (file) => {
        const slug = file.replace(/\.html$/, '');
        const url = cfg.base + file;
        const cached = ctx.has(slug);
        let $;
        let title;
        let children;
        if (cached) {
          $ = cheerio.load(ctx.readStoredHtml(slug), null, false);
          title = cached.title;
          children = childLinks($, $.root());
        } else {
          try {
            $ = cheerio.load(await ctx.fetchText(url));
          } catch (err) {
            return ctx.fail(url, err);
          }
          const $body = $('#docs-body');
          const $titlePage = $body.find('.titlepage').first();
          title = ($titlePage.find('.title').first().text() || $('title').text().split('::').pop())
            .replace(/\s+/g, ' ')
            .trim();
          $titlePage.remove();
          children = childLinks($, $body);
          collected.push({ slug, url, title, html: $body.html() || '' });
        }
        const num = sectionNumber(title);
        if (num) titles.set(num.join('.'), title);
        for (const c of children) {
          if (!seen.has(c)) {
            seen.add(c);
            queue.push(c);
          }
        }
      };

      while (queue.length) {
        const batch = queue;
        queue = [];
        await ctx.mapLimit(batch, visit);
        ctx.log(`${seen.size} páginas descobertas até agora...`);
      }

      // Agrupa no menu pela seção de 2º nível (ex.: "15.2 Data Manipulation Statements").
      const categoryOf = (title) => {
        const num = sectionNumber(title);
        if (!num) return 'General';
        return titles.get(num.slice(0, 2).join('.')) || titles.get(String(num[0])) || 'General';
      };

      for (const page of collected) {
        await ctx.addPage({ ...page, category: categoryOf(page.title) });
      }
      ctx.reorder((a, b) => compareNumbers(sectionNumber(a.title), sectionNumber(b.title)), categoryOf);
    },
  };
}

module.exports = { mysqlSource };
