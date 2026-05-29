// preloadImages.js
// Utilitário para pré-carregar imagens antes de exibir a UI do jogo.
// Garante que imagens estejam prontas no cache do navegador,
// evitando cartas/sprites aparecendo quebrados ou tabuleiros vazios.

/**
 * Pré-carrega um array de URLs de imagem em paralelo.
 * - Ignora URLs inválidas (null, undefined, string vazia)
 * - Resolve mesmo se imagens individuais falharem (não trava o jogo)
 * - Retorna resumo: { loaded, failed, total }
 *
 * @param {string[]} urls - Array de URLs de imagem para pré-carregar.
 * @returns {Promise<{ loaded: number, failed: number, total: number }>}
 */
export function preloadImages(urls = []) {
  // Filtrar URLs válidas
  const validUrls = urls.filter(
    (url) => url && typeof url === 'string' && url.trim() !== ''
  );

  if (validUrls.length === 0) {
    return Promise.resolve({ loaded: 0, failed: 0, total: 0 });
  }

  let loaded = 0;
  let failed = 0;
  const failedUrls = [];

  const promises = validUrls.map(
    (url) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          loaded++;
          resolve({ url, status: 'loaded' });
        };
        img.onerror = () => {
          failed++;
          failedUrls.push(url);
          resolve({ url, status: 'failed' });
        };
        img.src = url;
      })
  );

  return Promise.all(promises).then(() => ({
    loaded,
    failed,
    total: validUrls.length,
    failedUrls,
  }));
}

/**
 * Wrapper de timeout para Promises.
 * Se a promise não resolver dentro de `timeoutMs`, rejeita com erro de timeout.
 * Útil para chamadas de API externa que podem travar.
 *
 * @param {Promise} promise - Promise original a ser executada.
 * @param {number} timeoutMs - Tempo limite em milissegundos (padrão: 12000ms).
 * @returns {Promise} Resolve com o resultado da promise ou rejeita por timeout.
 */
export function withTimeout(promise, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Tempo limite de ${timeoutMs / 1000}s excedido. Verifique sua conexão.`));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}
