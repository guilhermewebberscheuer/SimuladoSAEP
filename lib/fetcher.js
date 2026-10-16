// Download com tentativas automáticas e limite de requisições simultâneas,
// para não sobrecarregar os sites oficiais.

const USER_AGENT =
  'sistema-documentacao-offline/1.0 (copia local da documentacao oficial para uso sem internet)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, { retries = 4, as = 'text', timeoutMs = 60000 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        redirect: 'follow',
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.status === 404) {
        const err = new Error(`404 em ${url}`);
        err.status = 404;
        throw err;
      }
      if (res.status === 429 || res.status >= 500) {
        throw new Error(`HTTP ${res.status} em ${url}`);
      }
      if (!res.ok) {
        const err = new Error(`HTTP ${res.status} em ${url}`);
        err.status = res.status;
        throw err;
      }
      if (as === 'json') return { data: await res.json(), finalUrl: res.url };
      if (as === 'buffer') {
        return {
          data: Buffer.from(await res.arrayBuffer()),
          finalUrl: res.url,
          contentType: res.headers.get('content-type') || '',
        };
      }
      return { data: await res.text(), finalUrl: res.url };
    } catch (err) {
      lastError = err;
      if (err.status && err.status < 500 && err.status !== 429) break; // erro definitivo
      await sleep(1000 * 2 ** attempt);
    }
  }
  throw lastError;
}

const fetchText = async (url) => (await fetchWithRetry(url)).data;
const fetchJson = async (url) => (await fetchWithRetry(url, { as: 'json' })).data;
// Imagens: poucas tentativas, para um badge fora do ar não travar o download.
const fetchBuffer = (url) => fetchWithRetry(url, { as: 'buffer', retries: 1, timeoutMs: 20000 });

// Executa `worker` para cada item com no máximo `limit` em paralelo.
async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

module.exports = { fetchText, fetchJson, fetchBuffer, fetchWithRetry, mapLimit, sleep };
