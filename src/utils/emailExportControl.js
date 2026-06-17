// Controle do botão de enviar e-mail.
// A gente usa o sessionStorage (memória temporária do navegador) pra evitar que o usuário 
// fique clicando 50 vezes no botão de exportar o placar e acabe travando nosso e-mail.
// Importante: Não usamos localStorage porque queremos que o bloqueio limpe se ele fechar e abrir o navegador.

const PREFIX = 'geekverse_email_sent_';

// Essa função checa se o e-mail daquela partida já foi enviado hoje
export function hasEmailExportBeenSent(key) {
  try {
    return sessionStorage.getItem(PREFIX + key) === 'true';
  } catch {
    return false;
  }
}

// Se o envio der certo, a gente chama essa função pra "carimbar" que já foi enviado
export function markEmailExportAsSent(key) {
  try {
    sessionStorage.setItem(PREFIX + key, 'true');
  } catch {
    // Se der erro no navegador, a gente ignora pra não quebrar a tela
  }
}

// Monta o nome do "carimbo" para o resultado de um jogo específico (ex: resultado do pokemon partida 3)
export function buildResultKey(gameId, matchKey) {
  return `result_${gameId}_${matchKey}`;
}

// Monta o nome do "carimbo" para a tela de Ranking geral
export function buildRankingKey(gameId, difficulty) {
  return `ranking_${gameId}_${difficulty}`;
}

// Chave fixa pra gente auditar a sessão
export const AUDIT_SESSION_KEY = 'audit_session';
