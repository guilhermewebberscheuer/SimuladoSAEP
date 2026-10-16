// Tradução automática (opcional) das páginas para português usando a API do Claude.
// O resultado é salvo em docs/<tech>/pt/ e exibido com aviso de "não oficial";
// o original em inglês nunca é alterado.

const Anthropic = require('@anthropic-ai/sdk');

const DEFAULT_MODEL = 'claude-opus-5-5';
const CHUNK_CHARS = 24000;

// US$ por milhão de tokens (entrada, saída) — usado apenas na estimativa de custo.
const PRICES = {
  'claude-opus-5-5': [4, 20],
  'claude-sonnet-5-5': [2, 10],
  'claude-haiku-5-5': [0.1, 0.5],
};
// Modelos que aceitam o fallback automático do servidor em caso de recusa.
const FALLBACK_MODELS = new Set(['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-fable-5-1']);

const SYSTEM_PROMPT = `You translate official software documentation from English into Brazilian Portuguese (pt-BR).

The input is an HTML fragment. Return the same HTML fragment with only the human-readable text translated.

Rules:
- Keep every tag, attribute and attribute value exactly as in the input (ids, classes, href, src). Only translate text nodes, plus the alt and title attributes.
- Do not translate anything inside <code>, <kbd> or <var>, nor identifiers, API names, CLI commands, file names, SQL keywords or URLs.
- Elements like <pre data-ph="N"></pre> are placeholders for code blocks: copy them unchanged, in the same position.
- Keep the technical meaning precise. Use the terminology common in Brazilian developer documentation; keep well-known English terms (e.g. "middleware", "callback", "array") when that is what Brazilian developers use.
- Output only the translated HTML, with no explanations and no Markdown code fences.`;

function protectCode(html) {
  const blocks = [];
  const out = html.replace(/<pre\b[\s\S]*?<\/pre>/gi, (m) => {
    blocks.push(m);
    return `<pre data-ph="${blocks.length - 1}"></pre>`;
  });
  return { html: out, blocks };
}

function restoreCode(html, blocks) {
  return html.replace(/<pre data-ph="(\d+)"><\/pre>/g, (m, i) => blocks[Number(i)] ?? m);
}

function splitChunks(html) {
  const sections = html.split(/(?=<h[2-6][\s>])/i);
  const chunks = [];
  let current = '';
  for (const s of sections) {
    if (current && current.length + s.length > CHUNK_CHARS) {
      chunks.push(current);
      current = '';
    }
    current += s;
  }
  if (current) chunks.push(current);
  return chunks;
}

// Estimativa grosseira: ~3,5 caracteres por token; a saída em português fica ~15% maior.
function estimate(html, model) {
  const { html: prose } = protectCode(html);
  const inputTokens = Math.ceil(prose.length / 3.5) + 400 * splitChunks(prose).length;
  const outputTokens = Math.ceil((prose.length / 3.5) * 1.15);
  const [pin, pout] = PRICES[model] || PRICES[DEFAULT_MODEL];
  return { inputTokens, outputTokens, cost: (inputTokens * pin + outputTokens * pout) / 1e6 };
}

function createTranslator({ model = DEFAULT_MODEL } = {}) {
  const client = new Anthropic();

  async function translateChunk(chunk) {
    const params = {
      model,
      max_tokens: 128000, // poucas seções do manual do MySQL passam de 100 mil caracteres
      output_config: { effort: 'low' },
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: chunk }],
    };
    if (FALLBACK_MODELS.has(model)) {
      params.betas = ['server-side-fallback-2026-07-01'];
      params.fallbacks = 'default';
    }
    const message = await client.beta.messages.stream(params).finalMessage();

    if (message.stop_reason === 'refusal') throw new Error('o modelo recusou traduzir este trecho');
    if (message.stop_reason === 'max_tokens') throw new Error('resposta cortada (max_tokens)');
    const text = message.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim()
      .replace(/^```(?:html)?\s*/i, '')
      .replace(/\s*```$/, '');
    return { text, usage: message.usage };
  }

  /** Traduz o título e o HTML de uma página. */
  async function translatePage(title, html) {
    const { html: prose, blocks } = protectCode(`<h1>${title}</h1>${html}`);
    const chunks = splitChunks(prose);
    const parts = [];
    const usage = { input: 0, output: 0 };
    for (const chunk of chunks) {
      const expected = (chunk.match(/<pre data-ph="\d+"><\/pre>/g) || []).length;
      let result;
      for (let attempt = 0; attempt < 2; attempt++) {
        result = await translateChunk(chunk);
        const got = (result.text.match(/<pre data-ph="\d+"><\/pre>/g) || []).length;
        if (got === expected) break;
        if (attempt === 1) throw new Error('a tradução perdeu blocos de código; página ignorada');
      }
      usage.input += result.usage.input_tokens || 0;
      usage.output += result.usage.output_tokens || 0;
      parts.push(result.text);
    }
    const full = restoreCode(parts.join('\n'), blocks);
    const m = full.match(/^\s*<h1>([\s\S]*?)<\/h1>/i);
    return {
      title: m ? m[1].trim() : title,
      html: m ? full.slice(m[0].length) : full,
      usage,
    };
  }

  return { translatePage, model };
}

module.exports = { createTranslator, estimate, protectCode, restoreCode, DEFAULT_MODEL, PRICES, Anthropic };
