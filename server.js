const path = require('path');
const express = require('express');
const library = require('./lib/library');
const search = require('./lib/search');
const store = require('./lib/store');
const escopo = require('./lib/escopo');

const app = express();
const PORT = process.env.PORT || 3322;

// MODO_PROVA=1 esconde as traduções automáticas: só aparece texto oficial
// (o original em inglês e as versões em português publicadas pelas próprias fontes).
const EXAM_MODE = ['1', 'true', 'sim'].includes(String(process.env.MODO_PROVA || '').toLowerCase());

let lib = library.load();
let index = search.load();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/docs-files', express.static(store.DOCS_DIR, { index: false }));

function langFrom(req) {
  const m = (req.headers.cookie || '').match(/(?:^|;\s*)lang=(en|pt)/);
  return m ? m[1] : 'en';
}

app.use((req, res, next) => {
  res.locals.techs = lib.techs;
  res.locals.currentTechId = null;
  res.locals.currentSlug = null;
  res.locals.lang = langFrom(req);
  res.locals.examMode = EXAM_MODE;
  res.locals.allowAuto = !EXAM_MODE;
  res.locals.escopoProva = escopo.ATIVO;
  res.locals.currentUrl = req.originalUrl;
  res.locals.query = '';
  next();
});

app.get('/', (req, res) => {
  res.render('index', { title: 'Documentação Offline' });
});

app.get('/idioma/:lang', (req, res) => {
  const lang = req.params.lang === 'pt' ? 'pt' : 'en';
  const back = String(req.query.volta || '/');
  res.setHeader('Set-Cookie', `lang=${lang}; Path=/; Max-Age=31536000; SameSite=Lax`);
  res.redirect(back.startsWith('/') && !back.startsWith('//') ? back : '/');
});

app.get('/recarregar', (req, res) => {
  lib = library.load();
  index = search.load();
  res.redirect('/');
});

app.get('/buscar', (req, res) => {
  const q = String(req.query.q || '').trim();
  const tech = lib.techs.some((t) => t.id === req.query.tech) ? req.query.tech : null;
  const results = q ? search.query(index, q, { lang: res.locals.lang, tech, allowAuto: !EXAM_MODE, allowed: lib.pages }) : [];
  for (const r of results) r.href = library.localPath(r.tech, r.slug);
  res.render('search', { title: `Busca: ${q}`, query: q, tech, results });
});

// Tópicos de uma linguagem para o menu lateral (carregado ao expandir).
app.get('/menu/:techId', (req, res, next) => {
  const tech = lib.techs.find((t) => t.id === req.params.techId);
  if (!tech) return next();
  res.render('partials/sidebar-tech', { tech });
});

app.get('/docs/:techId', (req, res, next) => {
  const tech = lib.techs.find((t) => t.id === req.params.techId);
  if (!tech) return next();
  res.locals.currentTechId = tech.id;
  res.render('tech', { title: tech.name, tech });
});

app.get('/docs/:techId/*', (req, res, next) => {
  const tech = lib.techs.find((t) => t.id === req.params.techId);
  if (!tech) return next();
  const page = lib.pages.get(`${tech.id}/${req.params[0]}`);
  if (!page) return next();
  res.locals.currentTechId = tech.id;
  res.locals.currentSlug = page.slug;
  const content = library.render(lib, page, res.locals.lang, { allowAuto: !EXAM_MODE });
  res.render('page', { title: content.title, tech, page, content });
});

app.use((req, res) => {
  res.status(404).render('404', { title: 'Página não encontrada' });
});

app.listen(PORT, () => {
  const total = lib.techs.reduce((n, t) => n + t.pages.length, 0);
  console.log(`Sistema de documentação offline rodando em http://localhost:${PORT}`);
  console.log(`${lib.techs.length} tecnologia(s), ${total} páginas. Nenhuma conexão com a internet é necessária.`);
  if (escopo.ATIVO) console.log(`Escopo da prova: nível "${escopo.NIVEL}" (ESCOPO=essencial | amplo | completo).`);
  if (EXAM_MODE) console.log('MODO_PROVA ativo: só conteúdo oficial (traduções automáticas ocultas).');
  if (total === 0) console.log('Nenhuma documentação baixada ainda. Rode: npm run baixar-docs');
});
