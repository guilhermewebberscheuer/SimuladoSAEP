// Pacotes cuja documentação oficial é o próprio README publicado no npm
// (o mesmo texto exibido em npmjs.com e no repositório do autor).

const { marked } = require('marked');

function npmReadmeSource({ id, name, pkg }) {
  return {
    id,
    name,
    description: `README oficial do pacote ${pkg}`,
    sourceLabel: `npm — ${pkg} (README oficial do pacote)`,
    homepage: `https://www.npmjs.com/package/${pkg}`,

    async collect(ctx) {
      const meta = await ctx.fetchJson(`https://registry.npmjs.org/${encodeURIComponent(pkg)}`);
      const version = meta['dist-tags'] && meta['dist-tags'].latest;
      ctx.setVersion(version);
      const repo = ((meta.repository && meta.repository.url) || '').match(/github\.com[/:]([^/]+\/[^/.]+)/);
      const base = repo ? `https://github.com/${repo[1]}/blob/HEAD/` : `https://www.npmjs.com/package/${pkg}`;

      await ctx.addPage({
        slug: 'readme',
        url: `https://www.npmjs.com/package/${pkg}`,
        title: `${pkg} ${version || ''}`.trim(),
        category: 'README',
        order: 0,
        html: marked.parse(meta.readme || ''),
        baseUrl: base,
      });
    },
  };
}

module.exports = { npmReadmeSource };
