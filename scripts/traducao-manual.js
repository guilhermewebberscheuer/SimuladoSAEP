#!/usr/bin/env node
// Tradução feita fora do sistema (à mão ou por uma IA), salva como tradução não oficial.
//
//   node scripts/traducao-manual.js exportar <tech> <slug> <arquivo.html>
//       grava o HTML da página com os blocos de código trocados por marcadores
//       (<pre data-ph="N"></pre>) e o título num <h1> no início.
//   node scripts/traducao-manual.js importar <tech> <slug> <arquivo.html> [--autor=Nome]
//       lê o arquivo traduzido, devolve os blocos de código originais e salva em docs/<tech>/pt/.

const fs = require('fs');
const store = require('../lib/store');
const { protectCode, restoreCode } = require('../lib/translate');

const PLACEHOLDER = /<pre data-ph="\d+"><\/pre>/g;

function findPage(techId, slug) {
  const manifest = store.readManifest(techId);
  const page = manifest && manifest.pages.find((p) => p.slug === slug);
  if (!page) throw new Error(`Página não encontrada: ${techId}/${slug}`);
  return page;
}

function main() {
  const [cmd, techId, slug, file] = process.argv.slice(2);
  const author = (process.argv.find((a) => a.startsWith('--autor=')) || '--autor=tradução manual').split('=')[1];
  if (!['exportar', 'importar'].includes(cmd) || !techId || !slug || !file) {
    console.error('Uso: traducao-manual.js exportar|importar <tech> <slug> <arquivo.html> [--autor=Nome]');
    process.exit(1);
  }
  const page = findPage(techId, slug);
  const original = fs.readFileSync(store.pagePath(techId, page.file), 'utf8');
  const { html, blocks } = protectCode(`<h1>${page.title}</h1>\n${original}`);

  if (cmd === 'exportar') {
    fs.writeFileSync(file, html);
    console.log(`${file}: ${html.length} caracteres, ${blocks.length} blocos de código protegidos`);
    return;
  }

  const translated = fs.readFileSync(file, 'utf8');
  const expected = (html.match(PLACEHOLDER) || []).length;
  const got = (translated.match(PLACEHOLDER) || []).length;
  if (got !== expected) throw new Error(`O arquivo traduzido tem ${got} blocos de código; o original tem ${expected}.`);

  const full = restoreCode(translated, blocks);
  const m = full.match(/^\s*<h1>([\s\S]*?)<\/h1>/i);
  store.writeJson(store.translationPath(techId, page.file), {
    title: m ? m[1].trim() : page.title,
    html: m ? full.slice(m[0].length) : full,
    model: author,
    translatedAt: new Date().toISOString(),
  });
  console.log(`Tradução salva: ${techId}/${slug}`);
}

try {
  main();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
