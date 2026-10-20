// Aplica o escopo da prova (lib/escopo-prova.js) à lista de páginas.
// ESCOPO=essencial (padrão) | amplo | completo (sem filtro).

const niveis = require('./escopo-prova');

const NIVEL = (() => {
  const v = String(process.env.ESCOPO || 'essencial').toLowerCase();
  return ['essencial', 'amplo', 'completo'].includes(v) ? v : 'essencial';
})();
const ATIVO = NIVEL !== 'completo';
const regras = ATIVO ? niveis[NIVEL] : {};

function casa(regra, page) {
  if (regra === true) return true;
  if (regra instanceof RegExp) return regra.test(page.slug);
  if (regra && regra.titulo) return regra.titulo.test(page.title);
  if (typeof regra === 'string') {
    if (regra.endsWith('/**')) {
      const base = regra.slice(0, -3);
      return page.slug === base || page.slug.startsWith(`${base}/`);
    }
    return page.slug === regra;
  }
  return false;
}

/** Retorna só as páginas da tecnologia que estão no escopo da prova. */
function filtrar(techId, pages) {
  if (!ATIVO) return pages;
  const lista = regras[techId];
  if (!lista) return []; // tecnologia fora do escopo
  const incluir = lista.filter((r) => !(r && r.excluir));
  const excluir = lista.filter((r) => r && r.excluir).flatMap((r) => r.excluir);
  return pages.filter((p) => incluir.some((r) => casa(r, p)) && !excluir.some((r) => casa(r, p)));
}

module.exports = { filtrar, ATIVO, NIVEL };
