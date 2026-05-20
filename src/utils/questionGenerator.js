// questionGenerator.js
// Gerador de perguntas curadas para o Show do Multiverso.
// Usa perguntas manuais de rickMortyCuratedQuestions.js
// e busca personagens reais na Rick and Morty API.
// Todas as perguntas são de identificação de personagem.

import { getCharactersByNames } from '../services/apis/rickMortyApi';
import { getCuratedQuestionsByMode } from '../data/rickMortyCuratedQuestions';

// ─── Helpers ────────────────────────────────────────────────────────

/** Embaralha um array (Fisher-Yates). */
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Simplifica um personagem para uso nos cards e no JSON. */
const simplify = (c) => ({
  id: c.id,
  name: c.name,
  status: c.status,
  species: c.species,
  origin: c.origin?.name || 'Desconhecida',
  location: c.location?.name || 'Desconhecida',
  image: c.image,
  episodeCount: c.episode?.length || 0,
});

// ─── Construtor de pergunta curada ──────────────────────────────────

/**
 * Monta uma pergunta curada buscando dados reais da API.
 * @param {Object} curatedQ - Pergunta curada do banco.
 * @returns {Promise<Object|null>} Pergunta pronta ou null se falhar.
 */
const buildCuratedQuestion = async (curatedQ) => {
  try {
    // Buscar todos os personagens (correto + distratores) na API
    const allNames = [curatedQ.correctCharacterName, ...curatedQ.distractorNames];
    const characters = await getCharactersByNames(allNames);

    // Validar: todos precisam ter sido encontrados
    const correctChar = characters[0];
    const distractors = characters.slice(1);

    if (!correctChar || !correctChar.id || !correctChar.image) {
      console.warn(`[questionGenerator] Personagem correto não encontrado: "${curatedQ.correctCharacterName}"`);
      return null;
    }

    // Filtrar distratores válidos (com id e imagem)
    const validDistractors = distractors.filter((d) => d && d.id && d.image);
    if (validDistractors.length < 3) {
      console.warn(
        `[questionGenerator] Distratores insuficientes para "${curatedQ.id}". ` +
        `Encontrados: ${validDistractors.length}/3`
      );
      return null;
    }

    // Simplificar dados para os cards
    const correctSimplified = simplify(correctChar);
    const distractorSimplified = validDistractors.slice(0, 3).map(simplify);

    // Montar options embaralhadas (4 cards de personagem)
    const options = shuffle([correctSimplified, ...distractorSimplified]);

    return {
      id: curatedQ.id,
      mode: curatedQ.mode,
      difficulty: curatedQ.difficulty,
      question: curatedQ.question,
      questionFocus: curatedQ.questionFocus,
      explanation: curatedQ.explanation,
      visualType: 'answer-cards',
      targetImage: null,
      targetData: null,
      options,
      correctId: correctChar.id,
      apiData: {
        pergunta: curatedQ.question,
        explicacao: curatedQ.explanation,
        personagem_correto: correctSimplified,
        distratores: distractorSimplified,
        personagens: options,
      },
    };
  } catch (err) {
    console.warn(`[questionGenerator] Erro ao montar pergunta "${curatedQ.id}":`, err);
    return null;
  }
};

// ─── GERADOR PRINCIPAL ─────────────────────────────────────────────

/**
 * Gera um conjunto de perguntas curadas para o modo especificado.
 * Sorteia perguntas do banco, sem repetir na mesma partida.
 * Se uma pergunta falhar (API), tenta outra do mesmo modo.
 *
 * @param {'easy' | 'medium' | 'hard'} mode
 * @param {number} count
 * @returns {Promise<Object[]>}
 */
export const generateQuestions = async (mode, count) => {
  // Obter pool de perguntas curadas para o modo
  const pool = shuffle(getCuratedQuestionsByMode(mode));
  const usedIds = new Set();
  const questions = [];

  // Fila de perguntas para tentar
  const queue = [...pool];

  for (let q = 0; q < count && queue.length > 0; ) {
    const curatedQ = queue.shift();

    // Evitar repetir pergunta na mesma partida
    if (usedIds.has(curatedQ.id)) continue;

    try {
      const question = await buildCuratedQuestion(curatedQ);
      if (question) {
        // Sobrescrever id com número sequencial da rodada
        question.roundNumber = q + 1;
        question.questionType = question.visualType;
        usedIds.add(curatedQ.id);
        questions.push(question);
        q++;
      }
    } catch (err) {
      console.warn(`[questionGenerator] Falha ao gerar pergunta ${q + 1}:`, err);
    }
  }

  // Se o pool se esgotou mas ainda faltam perguntas, reusar embaralhando
  if (questions.length < count && questions.length > 0) {
    console.warn(
      `[questionGenerator] Pool esgotado. Geradas ${questions.length}/${count} perguntas.`
    );
  }

  return questions;
};
