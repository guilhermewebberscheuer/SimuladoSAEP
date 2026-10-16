// Documentação oficial do Express (expressjs.com), em inglês.
// EXPRESS_DOCS_VERSION=5x troca para a documentação do Express 5.

const cheerio = require('cheerio');
const { isPortuguese } = require('../html');

const SITE = 'https://expressjs.com';

const CATEGORIES = [
  [/\/starter\//, 'Getting started'],
  [/\/guide\//, 'Guide'],
  [/\/api/, 'API reference'],
  [/\/advanced\//, 'Advanced topics'],
  [/\/resources\/middleware/, 'Middleware'],
  [/\/resources\//, 'Resources'],
];

const REMOVE = ['nav', '.page-topbar', 'svg', '.copy', 'header.page-header', '.edit-page'];

function extract(fullHtml) {
  const $ = cheerio.load(fullHtml);
  const $article = $('main#main-content article').first();
  const $h1 = $article.find('h1').first();
  const title = $h1.text().trim() || $('title').text().split('|')[0].trim();
  $h1.remove();
  return { title, html: $article.html() || '' };
}

function expressSource() {
  const v = process.env.EXPRESS_DOCS_VERSION || '4x';
  const allowed = [
    new RegExp(`^/en/${v}/(starter|guide|advanced|api)`),
    /^\/en\/advanced\/best-practice/,
    /^\/en\/guide\/(database-integration|migrating-5)/,
    /^\/en\/resources\/(middleware|glossary)/,
  ];

  return {
    id: 'express',
    name: 'Express',
    description: `Documentação do Express ${v.replace('x', '.x')}`,
    sourceLabel: 'Express — expressjs.com',
    homepage: `${SITE}/en/${v}/api`,
    version: v,

    async collect(ctx) {
      const $start = cheerio.load(await ctx.fetchText(`${SITE}/en/${v}/api`));
      const paths = [];
      $start('a[href^="/en/"]').each((_, a) => {
        const p = $start(a).attr('href').split('#')[0].replace(/\/+$/, '');
        if (allowed.some((re) => re.test(p)) && !paths.includes(p)) paths.push(p);
      });
      ctx.log(`${paths.length} páginas encontradas`);

      await ctx.mapLimit(paths, async (p, i) => {
        const slug = p.replace(/^\/en\//, '');
        if (!ctx.has(slug)) {
          const url = SITE + p;
          let page;
          try {
            page = extract(await ctx.fetchText(url));
          } catch (err) {
            return ctx.fail(url, err);
          }
          await ctx.addPage({
            slug,
            url,
            ...page,
            category: (CATEGORIES.find(([re]) => re.test(p)) || [null, 'Other'])[1],
            order: i,
            removeSelectors: REMOVE,
          });
        }

        // O site oficial tem /pt-br/, mas parte das páginas ainda está em inglês.
        if (ctx.hasTranslation(slug)) return;
        const ptUrl = SITE + p.replace(/^\/en\//, '/pt-br/');
        try {
          const pt = extract(await ctx.fetchText(ptUrl));
          if (isPortuguese(pt.html)) await ctx.addTranslation(slug, { url: ptUrl, ...pt, removeSelectors: REMOVE });
        } catch (err) {
          if (err.status !== 404) ctx.log(`Aviso: versão pt-br indisponível para ${ptUrl} (${err.message})`);
        }
      });
    },
  };
}

module.exports = { expressSource };
