// Ferramenta para forçar o navegador a baixar as imagens pesadas antes do jogo começar.
// Isso evita que o jogador comece a partida e fique olhando para uma tela preta ou cartas invisíveis.

// Essa função pega uma lista de links de imagens e baixa todas ao mesmo tempo.
export function preloadImages(urls = []) {
  // Tira da lista qualquer link que esteja vazio ou quebrado
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
        
        // Se a imagem baixar com sucesso, a gente conta +1
        img.onload = () => {
          loaded++;
          resolve({ url, status: 'loaded' });
        };
        
        // Se der erro (ex: link fora do ar), a gente não trava o jogo, só avisa que falhou
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

// Essa função funciona como um cronômetro de segurança (Timeout) para a API.
// Se a gente tentar puxar dados do Pokémon e demorar mais de 12 segundos, ela corta a conexão 
// e dá erro de timeout, para o jogo não ficar carregando infinitamente.
export function withTimeout(promise, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`O tempo limite de ${timeoutMs / 1000} segundos acabou. Verifique sua conexão com a internet.`));
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
