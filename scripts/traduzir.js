#!/usr/bin/env node
// Gera a tradução automática (pt-BR) das páginas já baixadas. Precisa de internet
// e de uma chave da API da Anthropic (ANTHROPIC_API_KEY). A tradução fica salva
// localmente, então depois também funciona offline.
//
// Uso:
//   npm run traduzir -- --estimar             -> só calcula o custo estimado, não traduz
//   npm run traduzir                          -> traduz tudo que ainda não foi traduzido
//   npm run traduzir -- express nodejs        -> só as tecnologias indicadas
// Opções:
//   --modelo=ID     modelo do Claude (padrão claude-opus-5-5)
//   --limite=N      traduz no máximo N páginas nesta execução
//   --paralelo=N    páginas traduzidas ao mesmo tempo (padrão 4)
//   --forcar        traduz de novo páginas que já têm tradução

const fs = require('fs');
const store = require('../lib/store');
const search = require('../lib/search');
const { mapLimit } = require('../lib/fetcher');
const { createTranslator, estimate, DEFAULT_MODEL, PRICES, Anthropic } = require('../lib/translate');

function parseArgs(argv) {
  const opts = { ids: [], model: DEFAULT_MODEL, limit: Infinity, concurrency: 4, force: false, estimateOnly: false };
  for (const a of argv) {
    if (a === '--forcar') opts.force = true;
    else if (a === '--estimar') opts.estimateOnly = true;
    else if (a.startsWith('--modelo=')) opts.model = a.split('=')[1];
    else if (a.startsWith('--limite=')) opts.limit = Number(a.split('=')[1]) || Infinity;
    else if (a.startsWith('--paralelo=')) opts.concurrency = Math.max(1, Number(a.split('=')[1]) || 4);
    else if (!a.startsWith('--')) opts.ids.push(a);
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const downloaded = store.listDownloadedTechs();
  const ids = opts.ids.length ? opts.ids.filter((id) => downloaded.includes(id)) : downloaded;
  if (!ids.length) {
    console.error('Nenhuma documentação baixada para traduzir. Rode antes: npm run baixar-docs');
    process.exit(1);
  }

  const jobs = [];
  for (const techId of ids) {
    for (const page of store.readManifest(techId).pages) {
      if (page.ptTitle) continue; // já tem versão oficial em português
      if (!opts.force && fs.existsSync(store.translationPath(techId, page.file))) continue;
      const file = store.pagePath(techId, page.file);
      if (fs.existsSync(file)) jobs.push({ techId, page, file });
    }
  }
  const selected = jobs.slice(0, opts.limit);

  const totals = { inputTokens: 0, outputTokens: 0, cost: 0 };
  for (const j of selected) {
    const e = estimate(fs.readFileSync(j.file, 'utf8'), opts.model);
    totals.inputTokens += e.inputTokens;
    totals.outputTokens += e.outputTokens;
    totals.cost += e.cost;
  }
  console.log(`${selected.length} página(s) para traduzir com ${opts.model}.`);
  console.log(
    `Estimativa: ~${(totals.inputTokens / 1e6).toFixed(1)}M tokens de entrada, ` +
      `~${(totals.outputTokens / 1e6).toFixed(1)}M de saída` +
      (PRICES[opts.model] ? `, custo aproximado US$ ${totals.cost.toFixed(2)}` : '')
  );
  if (opts.estimateOnly || selected.length === 0) return;

  const translator = createTranslator({ model: opts.model });
  let done = 0;
  let failed = 0;
  const usage = { input: 0, output: 0 };

  await mapLimit(selected, opts.concurrency, async ({ techId, page, file }) => {
    try {
      const result = await translator.translatePage(page.title, fs.readFileSync(file, 'utf8'));
      store.writeJson(store.translationPath(techId, page.file), {
        title: result.title,
        html: result.html,
        model: opts.model,
        translatedAt: new Date().toISOString(),
      });
      usage.input += result.usage.input;
      usage.output += result.usage.output;
      done++;
      console.log(`[${done + failed}/${selected.length}] ${techId}/${page.slug}`);
    } catch (err) {
      failed++;
      if (err instanceof Anthropic.AuthenticationError) {
        console.error('Chave da API inválida ou ausente. Defina ANTHROPIC_API_KEY e rode de novo.');
        process.exit(1);
      }
      console.error(`[${done + failed}/${selected.length}] FALHA ${techId}/${page.slug}: ${err.message}`);
    }
  });

  console.log(`\nTraduzidas: ${done}, falhas: ${failed}. Tokens usados: ${usage.input} entrada, ${usage.output} saída.`);
  console.log('Atualizando índice de busca...');
  search.buildAndSave();
  console.log('Pronto. Reinicie o servidor (ou acesse /recarregar) para ver as traduções.');
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
