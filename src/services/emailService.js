// Serviço do Carteiro (EmailJS): Responsável por enviar todos os e-mails do jogo.
// O envio nunca é automático! O usuário sempre tem que clicar no botão "Enviar por E-mail".

import emailjs from '@emailjs/browser';

// Chaves via .env (NUNCA colocar chaves reais no código):
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const TEMPLATE_CONTACT_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_CONTATO;
const TEMPLATE_GAME_RESULT_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_GAME_RESULT;

// 1. Envia a mensagem do Formulário de Contato (Página Sobre) para o dono do jogo
export const sendContactEmail = async (formData) => {
  // Validar variáveis de ambiente
  if (!SERVICE_ID || !TEMPLATE_CONTACT_ID || !PUBLIC_KEY) {
    throw new Error(
      'EmailJS não configurado. Verifique as variáveis VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_CONTATO e VITE_EMAILJS_PUBLIC_KEY no arquivo .env.'
    );
  }

  // Mapear campos do formulário para o template do EmailJS
  const templateParams = {
    from_name: formData.name,
    from_email: formData.email,
    subject: formData.subject,
    message: formData.message,
    sent_at: new Date().toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'medium',
    }),
  };

  try {
    const response = await emailjs.send(SERVICE_ID, TEMPLATE_CONTACT_ID, templateParams, PUBLIC_KEY);
    return { success: true, message: 'Mensagem enviada com sucesso!', response };
  } catch (error) {
    throw new Error(error?.text || 'Erro ao enviar mensagem. Tente novamente mais tarde.');
  }
};

// 2. Envia o Boletim/Resultado da partida direto para o e-mail de quem jogou.
// Exige que o jogador tenha digitado o e-mail corretamente na tela de Login!
export const sendGameResultEmail = async (resultData) => {
  // Validar variáveis de ambiente
  if (!SERVICE_ID || !TEMPLATE_GAME_RESULT_ID || !PUBLIC_KEY) {
    throw new Error(
      'EmailJS de resultado não configurado. Verifique VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_GAME_RESULT e VITE_EMAILJS_PUBLIC_KEY no .env.'
    );
  }

  // Validar e-mail do jogador
  if (!resultData.player_email) {
    throw new Error('E-mail do jogador não encontrado.');
  }

  const templateParams = {
    game_name: resultData.game_name,
    player_name: resultData.player_name,
    player_email: resultData.player_email,
    difficulty: resultData.difficulty,
    status: resultData.status,
    result_title: resultData.result_title,
    result_message: resultData.result_message,
    main_metric_label: resultData.main_metric_label,
    main_metric_value: resultData.main_metric_value,
    secondary_metrics: resultData.secondary_metrics,
    generated_at: resultData.generated_at,
  };

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_GAME_RESULT_ID, templateParams, PUBLIC_KEY);
    return { success: true, message: 'Resultado enviado por e-mail com sucesso.' };
  } catch (error) {
    throw new Error(error?.text || 'Erro ao enviar resultado por e-mail.');
  }
};


// 3. Envia a Tabela de Liderança (Ranking) de um jogo específico.
// IMPORTANTE: Usa as chaves da Conta 2 do EmailJS para não estourar o limite da Conta Principal.
export const sendRankingEmail = async (rankingData) => {
  const serviceId = import.meta.env.VITE_EMAILJS_RANKING_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_RANKING;
  const publicKey = import.meta.env.VITE_EMAILJS_RANKING_PUBLIC_KEY;

  // Validar variáveis de ambiente
  if (!serviceId || !templateId || !publicKey) {
    throw new Error(
      'EmailJS de ranking não configurado. Verifique VITE_EMAILJS_RANKING_SERVICE_ID, VITE_EMAILJS_TEMPLATE_RANKING e VITE_EMAILJS_RANKING_PUBLIC_KEY no .env.'
    );
  }

  // Validar e-mail do jogador
  if (!rankingData.player_email) {
    throw new Error(
      'E-mail do jogador não encontrado. Faça login novamente para enviar o ranking.'
    );
  }

  const templateParams = {
    ranking_title: rankingData.ranking_title,
    game_name: rankingData.game_name,
    difficulty: rankingData.difficulty,
    player_name: rankingData.player_name,
    player_email: rankingData.player_email,
    ranking_list: rankingData.ranking_list,
    generated_at: rankingData.generated_at,
  };

  try {
    await emailjs.send(serviceId, templateId, templateParams, publicKey);
    return { success: true, message: 'Ranking enviado com sucesso para o e-mail cadastrado.' };
  } catch (error) {
    throw new Error(
      error?.text || 'Não foi possível enviar o ranking por e-mail. Tente novamente.'
    );
  }
};

// 4. Envia o Dossiê de Auditoria (o relatório de tudo que o cara clicou no jogo).
// Também usa a Conta 2 do EmailJS (as mesmas chaves do Ranking).
export const sendAuditEmail = async (auditData) => {
  const serviceId = import.meta.env.VITE_EMAILJS_RANKING_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_AUDIT;
  const publicKey = import.meta.env.VITE_EMAILJS_RANKING_PUBLIC_KEY;

  // Validar variáveis de ambiente
  if (!serviceId || !templateId || !publicKey) {
    throw new Error(
      'EmailJS de auditoria não configurado. Verifique VITE_EMAILJS_RANKING_SERVICE_ID, VITE_EMAILJS_TEMPLATE_AUDIT e VITE_EMAILJS_RANKING_PUBLIC_KEY no .env.'
    );
  }

  const templateParams = {
    audit_title: auditData.audit_title,
    user_name: auditData.user_name,
    user_email: auditData.user_email,
    total_events: auditData.total_events,
    game_enters: auditData.game_enters,
    game_starts: auditData.game_starts,
    game_finishes: auditData.game_finishes,
    result_exports: auditData.result_exports,
    summary: auditData.summary,
    audit_details: auditData.audit_details || '',
    generated_at: auditData.generated_at,
  };

  try {
    await emailjs.send(serviceId, templateId, templateParams, publicKey);
    return { success: true, message: 'Auditoria da sessão enviada com sucesso para o e-mail do projeto.' };
  } catch (error) {
    throw new Error(
      error?.text || 'Não foi possível enviar a auditoria da sessão. Tente novamente.'
    );
  }
};
