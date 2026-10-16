// Armazenamento local da documentação baixada.
//
// docs/<tech>/manifest.json   -> metadados da tecnologia + lista de páginas
// docs/<tech>/pages/<id>.html -> HTML oficial (apenas limpo de menus/scripts)
// docs/<tech>/assets/<arq>    -> imagens usadas nas páginas
// docs/<tech>/pt-oficial/<id>.json -> versão oficial em português, quando existe
// docs/<tech>/pt/<id>.json    -> tradução automática opcional (não oficial)
// docs/search-index.json      -> índice de busca pré-calculado

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DOCS_DIR = path.join(__dirname, '..', 'docs');

function techDir(techId) {
  return path.join(DOCS_DIR, techId);
}

function fileIdForSlug(slug) {
  // Hash evita problemas com caracteres inválidos no Windows (ex.: ":" em ":hover")
  return crypto.createHash('sha1').update(slug).digest('hex').slice(0, 20);
}

function readJson(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data));
  fs.renameSync(tmp, file);
}

function manifestPath(techId) {
  return path.join(techDir(techId), 'manifest.json');
}

function readManifest(techId) {
  return readJson(manifestPath(techId));
}

function writeManifest(techId, manifest) {
  writeJson(manifestPath(techId), manifest);
}

function pagePath(techId, fileId) {
  return path.join(techDir(techId), 'pages', `${fileId}.html`);
}

// Tradução automática (não oficial), gerada por npm run traduzir.
function translationPath(techId, fileId) {
  return path.join(techDir(techId), 'pt', `${fileId}.json`);
}

// Versão em português publicada pela própria fonte oficial (ex.: MDN pt-BR).
function officialPtPath(techId, fileId) {
  return path.join(techDir(techId), 'pt-oficial', `${fileId}.json`);
}

function assetsDir(techId) {
  return path.join(techDir(techId), 'assets');
}

function listDownloadedTechs() {
  if (!fs.existsSync(DOCS_DIR)) return [];
  return fs
    .readdirSync(DOCS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(manifestPath(d.name)))
    .map((d) => d.name);
}

module.exports = {
  DOCS_DIR,
  techDir,
  fileIdForSlug,
  readJson,
  writeJson,
  readManifest,
  writeManifest,
  pagePath,
  translationPath,
  officialPtPath,
  assetsDir,
  listDownloadedTechs,
};
