const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const CONTENT_DIR = path.join(__dirname, '..', 'content');

const TECHS = [
  { id: 'javascript', name: 'JavaScript', dirName: 'javascript' },
  { id: 'html', name: 'HTML', dirName: 'html' },
  { id: 'nodejs', name: 'Node.js', dirName: 'nodejs' },
  { id: 'express', name: 'Express', dirName: 'express' },
  { id: 'mysql-workbench', name: 'MySQL Workbench', dirName: 'mysql-workbench' },
  { id: 'mysql2', name: 'mysql2 (driver Node.js)', dirName: 'mysql2' },
  { id: 'jsonwebtoken', name: 'jsonwebtoken (JWT)', dirName: 'jsonwebtoken' },
  { id: 'bcrypt', name: 'bcrypt', dirName: 'bcrypt' },
];

const STOPWORDS = new Set([
  'a','o','as','os','de','do','da','dos','das','e','em','um','uma','uns','umas',
  'para','por','com','sem','que','se','ou','no','na','nos','nas','ao','aos',
  'como','mais','mas','sua','seu','suas','seus','ser','ter','sao','foi','pelo',
  'pela','entre','sobre','the','and','of','to','in','is','a','an','for','on'
]);

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ');
}

function slugFromFilename(filename) {
  return filename.replace(/\.md$/, '');
}

function loadAll() {
  const techs = [];
  const pagesBySlug = new Map();
  const index = new Map(); // word -> Map(pageKey -> score)

  for (const tech of TECHS) {
    const dirPath = path.join(CONTENT_DIR, tech.dirName);
    const pages = [];

    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.md'));

      for (const file of files) {
        const raw = fs.readFileSync(path.join(dirPath, file), 'utf8');
        const parsed = matter(raw);
        const slug = slugFromFilename(file);
        const html = marked.parse(parsed.content);
        const plainText = stripHtml(html);

        const meta = {
          slug,
          techId: tech.id,
          title: parsed.data.title || slug,
          category: parsed.data.category || 'Geral',
          order: typeof parsed.data.order === 'number' ? parsed.data.order : 999,
          source: parsed.data.source || null,
          sourceLabel: parsed.data.sourceLabel || parsed.data.source || null,
          officialTranslation: !!parsed.data.officialTranslation,
        };

        const page = { ...meta, html, plainText };
        pages.push(meta);
        const pageKey = `${tech.id}/${slug}`;
        pagesBySlug.set(pageKey, page);

        const titleTokens = tokenize(meta.title);
        const bodyTokens = tokenize(plainText);

        for (const t of titleTokens) {
          if (!index.has(t)) index.set(t, new Map());
          const m = index.get(t);
          m.set(pageKey, (m.get(pageKey) || 0) + 5);
        }
        for (const t of bodyTokens) {
          if (!index.has(t)) index.set(t, new Map());
          const m = index.get(t);
          m.set(pageKey, (m.get(pageKey) || 0) + 1);
        }
      }
    }

    pages.sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category, 'pt-BR');
      if (a.order !== b.order) return a.order - b.order;
      return a.title.localeCompare(b.title, 'pt-BR');
    });

    techs.push({ ...tech, pages });
  }

  return { techs, pagesBySlug, index };
}

function search(state, query, limit = 20) {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const scores = new Map();
  for (const t of tokens) {
    for (const [word, pageMap] of state.index.entries()) {
      if (word === t || word.startsWith(t)) {
        const weight = word === t ? 1 : 0.5;
        for (const [pageKey, score] of pageMap.entries()) {
          scores.set(pageKey, (scores.get(pageKey) || 0) + score * weight);
        }
      }
    }
  }

  const results = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([pageKey, score]) => {
      const page = state.pagesBySlug.get(pageKey);
      const snippetSource = page.plainText.replace(/\s+/g, ' ').trim();
      const snippet = snippetSource.slice(0, 220) + (snippetSource.length > 220 ? '...' : '');
      return {
        techId: page.techId,
        slug: page.slug,
        title: page.title,
        category: page.category,
        score,
        snippet,
      };
    });

  return results;
}

module.exports = { loadAll, search, TECHS };
