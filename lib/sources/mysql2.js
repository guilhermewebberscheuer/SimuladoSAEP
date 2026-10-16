// Site oficial de documentação do pacote mysql2 (sidorares.github.io/node-mysql2).
// As páginas são descobertas pelo sitemap.xml do próprio site.

const cheerio = require('cheerio');
const { isPortuguese } = require('../html');

const SITE = 'https://sidorares.github.io/node-mysql2';

function categoryFor(slug) {
  const parts = slug.split('/');
  if (parts[0] === 'documentation') return 'Documentation';
  if (parts[0] === 'examples') return parts.length > 2 ? `Examples › ${parts[1]}` : 'Examples';
  return 'Overview';
}

const REMOVE = ['.hash-link', 'nav', 'footer'];

function extract(fullHtml) {
  const $ = cheerio.load(fullHtml);
  const $content = $('.theme-doc-markdown').first();
  const $h1 = $content.find('h1').first();
  const title = $h1.text().trim() || $('title').text().split('|')[0].trim();
  $h1.closest('header').remove();
  $h1.remove();
  return { title, html: $content.html() || '' };
}

function mysql2Source() {
  return {
    id: 'mysql2',
    name: 'mysql2 (driver Node.js)',
    description: 'Documentação oficial do pacote mysql2',
    sourceLabel: 'MySQL2 Documentation — sidorares.github.io/node-mysql2',
    homepage: `${SITE}/docs`,

    async collect(ctx) {
      const sitemap = await ctx.fetchText(`${SITE}/sitemap.xml`);
      const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
        .map((m) => m[1].replace(/\/+$/, ''))
        .filter((u) => u.startsWith(`${SITE}/docs`) && !/\/docs\/(tags|contributing)/.test(u));
      ctx.log(`${urls.length} páginas encontradas`);

      await ctx.mapLimit(urls, async (url, i) => {
        const rest = url.slice(`${SITE}/docs`.length).replace(/^\//, '');
        const slug = rest || 'index';
        if (!ctx.has(slug)) {
          let page;
          try {
            page = extract(await ctx.fetchText(url));
          } catch (err) {
            return ctx.fail(url, err);
          }
          await ctx.addPage({ slug, url, ...page, category: categoryFor(rest), order: i, removeSelectors: REMOVE });
        }

        // O site tem versão /pt-BR/, traduzida só em parte.
        if (ctx.hasTranslation(slug)) return;
        const ptUrl = `${SITE}/pt-BR/docs${rest ? `/${rest}` : ''}`;
        try {
          const pt = extract(await ctx.fetchText(ptUrl));
          if (isPortuguese(pt.html)) await ctx.addTranslation(slug, { url: ptUrl, ...pt, removeSelectors: REMOVE });
        } catch (err) {
          if (err.status !== 404) ctx.log(`Aviso: versão pt-BR indisponível para ${ptUrl} (${err.message})`);
        }
      });
    },
  };
}

module.exports = { mysql2Source };
