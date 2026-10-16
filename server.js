const path = require('path');
const express = require('express');
const content = require('./lib/content');

const app = express();
const PORT = process.env.PORT || 3000;

let state = content.loadAll();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/static', express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.techs = state.techs;
  res.locals.currentTechId = null;
  res.locals.currentSlug = null;
  next();
});

app.get('/', (req, res) => {
  res.render('index', { title: 'Documentacao Offline' });
});

app.get('/recarregar', (req, res) => {
  state = content.loadAll();
  res.redirect('/');
});

app.get('/buscar', (req, res) => {
  const q = (req.query.q || '').trim();
  const results = q ? content.search(state, q) : [];
  res.render('search', { title: `Busca: ${q}`, query: q, results });
});

app.get('/:techId', (req, res, next) => {
  const tech = state.techs.find((t) => t.id === req.params.techId);
  if (!tech) return next();
  res.locals.currentTechId = tech.id;
  res.render('tech', { title: tech.name, tech });
});

app.get('/:techId/:slug', (req, res, next) => {
  const tech = state.techs.find((t) => t.id === req.params.techId);
  if (!tech) return next();
  const pageKey = `${tech.id}/${req.params.slug}`;
  const page = state.pagesBySlug.get(pageKey);
  if (!page) return next();
  res.locals.currentTechId = tech.id;
  res.locals.currentSlug = page.slug;
  res.render('page', { title: page.title, tech, page });
});

app.use((req, res) => {
  res.status(404).render('404', { title: 'Pagina nao encontrada' });
});

app.listen(PORT, () => {
  console.log(`Sistema de documentacao offline rodando em http://localhost:${PORT}`);
  console.log('Acesse pelo navegador. Nenhuma conexao com a internet e necessaria.');
});
