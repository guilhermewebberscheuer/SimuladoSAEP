// Documentação oficial da API do Node.js (nodejs.org/dist/<versão>/docs/api).
// Por padrão usa a mesma versão do Node que está rodando o download;
// defina NODE_DOCS_VERSION (ex.: v22.11.0) para escolher outra.

const cheerio = require('cheerio');

function nodeSource() {
  const version = process.env.NODE_DOCS_VERSION || process.version;
  const base = `https://nodejs.org/dist/${version}/docs/api/`;

  return {
    id: 'nodejs',
    name: 'Node.js',
    description: `Documentação da API do Node.js ${version}`,
    sourceLabel: `Node.js ${version} Documentation — nodejs.org`,
    homepage: `${base}index.html`,
    version,

    async collect(ctx) {
      const $index = cheerio.load(await ctx.fetchText(`${base}index.html`));
      const files = [];
      $index('#apicontent a[href]').each((_, a) => {
        const href = $index(a).attr('href');
        if (/^[\w-]+\.html$/.test(href) && href !== 'all.html' && !files.includes(href)) files.push(href);
      });
      ctx.log(`${files.length} módulos encontrados`);

      await ctx.mapLimit(files, async (file, i) => {
        const slug = file.replace(/\.html$/, '');
        if (ctx.has(slug)) return;
        const url = base + file;
        let $;
        try {
          $ = cheerio.load(await ctx.fetchText(url));
        } catch (err) {
          return ctx.fail(url, err);
        }
        const title = $('title').text().split('|')[0].trim() || slug;
        const $toc = $('#toc');
        $toc.removeAttr('open').attr('class', 'page-toc');
        const toc = $toc.length ? $.html($toc) : '';
        await ctx.addPage({
          slug,
          url,
          title,
          category: 'API',
          order: i,
          html: toc + ($('#apicontent').html() || ''),
        });
      });
    },
  };
}

module.exports = { nodeSource };
