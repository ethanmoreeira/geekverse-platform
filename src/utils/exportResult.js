// exportResult.js
// Utilitário reutilizável para exportar resultado de jogos como JSON.
// Usado nos cards finais de cada jogo do GeekVerse G8.

/**
 * Exporta um objeto JavaScript como arquivo .json para download.
 * @param {Object} data - Dados a serem exportados.
 * @param {string} filename - Nome do arquivo (sem extensão).
 */
export const exportJsonFile = (data, filename) => {
  try {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('[exportJsonFile] Erro ao exportar resultado:', err);
  }
};
