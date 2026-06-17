// Arquivo responsável por "fabricar" as perguntas do Show do Multiverso (Rick and Morty).
// Ele pega as perguntas que vocês escreveram à mão e busca a imagem verdadeira do personagem na API.

import { getCharactersByNames } from '../services/apis/rickMortyApi';
import { getCuratedQuestionsByMode } from '../data/rickMortyCuratedQuestions';
import { shuffleArray as shuffle } from './shuffleArray';

// Embaralhador centralizado (importado do shuffleArray.js)

// Quando a API do Rick and Morty traz o personagem, ela traz muitos dados inúteis.
// Essa função atua como um filtro: pega só a foto, o nome e de onde ele é.
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

// Essa é a fábrica de UMA pergunta. Ela vai na internet, busca a foto da resposta certa
// e também baixa as fotos das opções erradas (distratores) para colocar nos cartões.
const buildCuratedQuestion = async (curatedQ) => {
  try {
    const allNames = [curatedQ.correctCharacterName, ...curatedQ.distractorNames];
    const characters = await getCharactersByNames(allNames);

    const correctChar = characters[0];
    const distractors = characters.slice(1);

    // Se a internet não achar o personagem, ele cancela a pergunta.
    if (!correctChar || !correctChar.id || !correctChar.image) {
      console.warn(`Personagem correto não encontrado: "${curatedQ.correctCharacterName}"`);
      return null;
    }

    // Filtra para garantir que os personagens falsos (distratores) tenham foto.
    const validDistractors = distractors.filter((d) => d && d.id && d.image);
    if (validDistractors.length < 3) {
      console.warn(
        `Personagens falsos insuficientes para "${curatedQ.id}". Encontrados: ${validDistractors.length}/3`
      );
      return null;
    }

    const correctSimplified = simplify(correctChar);
    const distractorSimplified = validDistractors.slice(0, 3).map(simplify);

    // Mistura a resposta certa com as erradas para o jogador não saber qual é a opção correta.
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
    console.warn(`Erro ao montar pergunta "${curatedQ.id}":`, err);
    return null;
  }
};

// O GERENTE GERAL DO QUIZ
// É ele que define quantas perguntas a rodada vai ter e não deixa repetir a mesma pergunta.
export const generateQuestions = async (mode, count) => {
  // Pega a lista de perguntas do banco e embaralha elas para o jogo nunca ser igual.
  const pool = shuffle(getCuratedQuestionsByMode(mode));
  const usedIds = new Set();
  const questions = [];

  const queue = [...pool];

  // Fica puxando perguntas até atingir a quantidade pedida pela dificuldade.
  for (let q = 0; q < count && queue.length > 0; ) {
    const curatedQ = queue.shift();

    // Se já fez essa pergunta antes, pula ela.
    if (usedIds.has(curatedQ.id)) continue;

    try {
      const question = await buildCuratedQuestion(curatedQ);
      if (question) {
        question.roundNumber = q + 1;
        question.questionType = question.visualType;
        usedIds.add(curatedQ.id);
        questions.push(question);
        q++;
      }
    } catch (err) {
      console.warn(`Falha ao gerar pergunta ${q + 1}:`, err);
    }
  }

  // Aviso de segurança se as perguntas acabarem antes da hora.
  if (questions.length < count && questions.length > 0) {
    console.warn(`Atenção: Criou apenas ${questions.length} de ${count} perguntas.`);
  }

  return questions;
};
