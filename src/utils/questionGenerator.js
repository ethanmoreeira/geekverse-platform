// questionGenerator.js
// Gerador dinâmico de perguntas para o Show do Multiverso.
// Usa dados reais da Rick and Morty API para gerar perguntas com personagens.
// Todas as perguntas mostram imagem da API (nas respostas ou no enunciado).
// Nenhuma pergunta é puramente textual.

import {
  getRandomCharacters,
  getRandomEpisode,
  getRandomLocation,
  getCharactersByIds,
  extractIdFromUrl,
} from '../services/apis/rickMortyApi';

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
  gender: c.gender,
  origin: c.origin?.name || 'Desconhecida',
  location: c.location?.name || 'Desconhecida',
  image: c.image,
  episodeCount: c.episode?.length || 0,
});

const MAX_RETRIES = 5;

/** Cria o retorno padronizado de uma pergunta com answer-cards. */
const makeAnswerCardsQuestion = (question, chars, correctChar, extras = {}) => {
  const options = shuffle(chars).map(simplify);
  return {
    question,
    visualType: 'answer-cards',
    targetImage: null,
    targetData: null,
    options,
    correctId: correctChar.id,
    apiData: { personagens: options, ...extras },
  };
};

/** Cria o retorno padronizado de uma pergunta com imagem no enunciado. */
const makeQuestionImageQuestion = (question, targetChar, textOptions, correctAnswer, extras = {}) => {
  const simplified = simplify(targetChar);
  return {
    question,
    visualType: 'question-image',
    targetImage: targetChar.image,
    targetData: {
      name: simplified.name,
      subtitle: `${simplified.status} · ${simplified.species}`,
    },
    options: shuffle(textOptions),
    correctId: correctAnswer,
    apiData: { personagem_destaque: simplified, ...extras },
  };
};

// ─── GERADORES: FÁCIL ───────────────────────────────────────────────

const easyGenerators = [
  // Qual está vivo?
  async () => {
    for (let i = 0; i < MAX_RETRIES; i++) {
      const chars = await getRandomCharacters(8);
      const alive = chars.filter((c) => c.status === 'Alive');
      const notAlive = chars.filter((c) => c.status !== 'Alive');
      if (alive.length >= 1 && notAlive.length >= 3) {
        const correct = alive[Math.floor(Math.random() * alive.length)];
        return makeAnswerCardsQuestion(
          'Qual destes personagens está VIVO?',
          [correct, ...shuffle(notAlive).slice(0, 3)],
          correct
        );
      }
    }
    return null;
  },

  // Qual está morto?
  async () => {
    for (let i = 0; i < MAX_RETRIES; i++) {
      const chars = await getRandomCharacters(8);
      const dead = chars.filter((c) => c.status === 'Dead');
      const notDead = chars.filter((c) => c.status !== 'Dead');
      if (dead.length >= 1 && notDead.length >= 3) {
        const correct = dead[Math.floor(Math.random() * dead.length)];
        return makeAnswerCardsQuestion(
          'Qual destes personagens está MORTO?',
          [correct, ...shuffle(notDead).slice(0, 3)],
          correct
        );
      }
    }
    return null;
  },

  // Qual é humano?
  async () => {
    for (let i = 0; i < MAX_RETRIES; i++) {
      const chars = await getRandomCharacters(8);
      const humans = chars.filter((c) => c.species === 'Human');
      const nonHumans = chars.filter((c) => c.species !== 'Human');
      if (humans.length >= 1 && nonHumans.length >= 3) {
        const correct = humans[Math.floor(Math.random() * humans.length)];
        return makeAnswerCardsQuestion(
          'Qual destes personagens é HUMANO?',
          [correct, ...shuffle(nonHumans).slice(0, 3)],
          correct
        );
      }
    }
    return null;
  },

  // Qual NÃO é humano?
  async () => {
    for (let i = 0; i < MAX_RETRIES; i++) {
      const chars = await getRandomCharacters(8);
      const nonHumans = chars.filter((c) => c.species !== 'Human');
      const humans = chars.filter((c) => c.species === 'Human');
      if (nonHumans.length >= 1 && humans.length >= 3) {
        const correct = nonHumans[Math.floor(Math.random() * nonHumans.length)];
        return makeAnswerCardsQuestion(
          'Qual destes personagens NÃO é humano?',
          [correct, ...shuffle(humans).slice(0, 3)],
          correct
        );
      }
    }
    return null;
  },

  // Qual é feminino?
  async () => {
    for (let i = 0; i < MAX_RETRIES; i++) {
      const chars = await getRandomCharacters(8);
      const females = chars.filter((c) => c.gender === 'Female');
      const notFemale = chars.filter((c) => c.gender !== 'Female');
      if (females.length >= 1 && notFemale.length >= 3) {
        const correct = females[Math.floor(Math.random() * females.length)];
        return makeAnswerCardsQuestion(
          'Qual destes personagens tem gênero FEMININO?',
          [correct, ...shuffle(notFemale).slice(0, 3)],
          correct
        );
      }
    }
    return null;
  },

  // Qual é masculino?
  async () => {
    for (let i = 0; i < MAX_RETRIES; i++) {
      const chars = await getRandomCharacters(8);
      const males = chars.filter((c) => c.gender === 'Male');
      const notMale = chars.filter((c) => c.gender !== 'Male');
      if (males.length >= 1 && notMale.length >= 3) {
        const correct = males[Math.floor(Math.random() * males.length)];
        return makeAnswerCardsQuestion(
          'Qual destes personagens tem gênero MASCULINO?',
          [correct, ...shuffle(notMale).slice(0, 3)],
          correct
        );
      }
    }
    return null;
  },

  // Qual é Alien?
  async () => {
    for (let i = 0; i < MAX_RETRIES; i++) {
      const chars = await getRandomCharacters(10);
      const aliens = chars.filter((c) => c.species === 'Alien');
      const notAliens = chars.filter((c) => c.species !== 'Alien');
      if (aliens.length >= 1 && notAliens.length >= 3) {
        const correct = aliens[Math.floor(Math.random() * aliens.length)];
        return makeAnswerCardsQuestion(
          'Qual destes personagens é um ALIEN?',
          [correct, ...shuffle(notAliens).slice(0, 3)],
          correct
        );
      }
    }
    return null;
  },

  // Qual tem origem desconhecida?
  async () => {
    for (let i = 0; i < MAX_RETRIES; i++) {
      const chars = await getRandomCharacters(10);
      const unknown = chars.filter((c) => c.origin?.name === 'unknown');
      const known = chars.filter((c) => c.origin?.name !== 'unknown');
      if (unknown.length >= 1 && known.length >= 3) {
        const correct = unknown[Math.floor(Math.random() * unknown.length)];
        return makeAnswerCardsQuestion(
          'Qual destes personagens tem ORIGEM DESCONHECIDA?',
          [correct, ...shuffle(known).slice(0, 3)],
          correct
        );
      }
    }
    return null;
  },

  // Imagem no enunciado: Qual é a espécie deste personagem?
  async () => {
    for (let i = 0; i < MAX_RETRIES; i++) {
      const chars = await getRandomCharacters(1);
      if (chars.length < 1 || !chars[0].image) continue;
      const target = chars[0];
      const species = target.species || 'Unknown';
      const fakeSpecies = ['Human', 'Alien', 'Robot', 'Humanoid', 'Mythological Creature', 'Poopybutthole', 'Cronenberg', 'Animal'];
      const wrong = shuffle(fakeSpecies.filter((s) => s !== species)).slice(0, 3);
      return makeQuestionImageQuestion(
        'Qual é a ESPÉCIE deste personagem?',
        target,
        [species, ...wrong],
        species
      );
    }
    return null;
  },

  // Imagem no enunciado: Qual é o status deste personagem?
  async () => {
    for (let i = 0; i < MAX_RETRIES; i++) {
      const chars = await getRandomCharacters(1);
      if (chars.length < 1 || !chars[0].image) continue;
      const target = chars[0];
      const status = target.status || 'unknown';
      const allStatuses = ['Alive', 'Dead', 'unknown'];
      const wrong = allStatuses.filter((s) => s !== status);
      // Pad to 3 wrong options
      const wrongOptions = [...wrong];
      if (wrongOptions.length < 3) wrongOptions.push('Desconhecido');
      return makeQuestionImageQuestion(
        'Qual é o STATUS deste personagem?',
        target,
        [status, ...wrongOptions.slice(0, 3)],
        status
      );
    }
    return null;
  },
];

// ─── GERADORES: MÉDIO ───────────────────────────────────────────────

const mediumGenerators = [
  // Mais episódios
  async () => {
    for (let i = 0; i < MAX_RETRIES; i++) {
      const chars = await getRandomCharacters(4);
      if (chars.length < 4) continue;
      const sorted = [...chars].sort((a, b) => (b.episode?.length || 0) - (a.episode?.length || 0));
      if ((sorted[0].episode?.length || 0) === (sorted[1].episode?.length || 0)) continue;
      return makeAnswerCardsQuestion(
        'Qual destes personagens apareceu em MAIS episódios?',
        chars,
        sorted[0]
      );
    }
    return null;
  },

  // Menos episódios
  async () => {
    for (let i = 0; i < MAX_RETRIES; i++) {
      const chars = await getRandomCharacters(4);
      if (chars.length < 4) continue;
      const sorted = [...chars].sort((a, b) => (a.episode?.length || 0) - (b.episode?.length || 0));
      if ((sorted[0].episode?.length || 0) === (sorted[1].episode?.length || 0)) continue;
      return makeAnswerCardsQuestion(
        'Qual destes personagens apareceu em MENOS episódios?',
        chars,
        sorted[0]
      );
    }
    return null;
  },

  // Localização desconhecida
  async () => {
    for (let i = 0; i < MAX_RETRIES; i++) {
      const chars = await getRandomCharacters(8);
      const unknown = chars.filter((c) => c.location?.name === 'unknown');
      const known = chars.filter((c) => c.location?.name !== 'unknown');
      if (unknown.length >= 1 && known.length >= 3) {
        const correct = unknown[Math.floor(Math.random() * unknown.length)];
        return makeAnswerCardsQuestion(
          'Qual destes personagens está em LOCALIZAÇÃO DESCONHECIDA?',
          [correct, ...shuffle(known).slice(0, 3)],
          correct
        );
      }
    }
    return null;
  },

  // Não está vivo
  async () => {
    for (let i = 0; i < MAX_RETRIES; i++) {
      const chars = await getRandomCharacters(8);
      const notAlive = chars.filter((c) => c.status !== 'Alive');
      const alive = chars.filter((c) => c.status === 'Alive');
      if (notAlive.length >= 1 && alive.length >= 3) {
        const correct = notAlive[Math.floor(Math.random() * notAlive.length)];
        return makeAnswerCardsQuestion(
          'Qual destes personagens NÃO está vivo?',
          [correct, ...shuffle(alive).slice(0, 3)],
          correct
        );
      }
    }
    return null;
  },

  // Origem diferente de Earth
  async () => {
    for (let i = 0; i < MAX_RETRIES; i++) {
      const chars = await getRandomCharacters(8);
      const notEarth = chars.filter((c) => c.origin?.name && !c.origin.name.toLowerCase().includes('earth') && c.origin.name !== 'unknown');
      const fromEarth = chars.filter((c) => c.origin?.name && c.origin.name.toLowerCase().includes('earth'));
      if (notEarth.length >= 1 && fromEarth.length >= 3) {
        const correct = notEarth[Math.floor(Math.random() * notEarth.length)];
        return makeAnswerCardsQuestion(
          'Qual destes personagens NÃO tem origem na Terra?',
          [correct, ...shuffle(fromEarth).slice(0, 3)],
          correct
        );
      }
    }
    return null;
  },

  // Imagem no enunciado: Qual é o gênero deste personagem?
  async () => {
    for (let i = 0; i < MAX_RETRIES; i++) {
      const chars = await getRandomCharacters(1);
      if (chars.length < 1 || !chars[0].image) continue;
      const target = chars[0];
      const gender = target.gender || 'unknown';
      const allGenders = ['Male', 'Female', 'Genderless', 'unknown'];
      const wrong = allGenders.filter((g) => g !== gender);
      return makeQuestionImageQuestion(
        'Qual é o GÊNERO deste personagem?',
        target,
        [gender, ...wrong.slice(0, 3)],
        gender
      );
    }
    return null;
  },

  // Imagem no enunciado: Qual é a origem deste personagem?
  async () => {
    for (let i = 0; i < MAX_RETRIES; i++) {
      const chars = await getRandomCharacters(4);
      const withOrigin = chars.filter((c) => c.origin?.name && c.origin.name !== 'unknown');
      if (withOrigin.length < 1) continue;
      const target = withOrigin[0];
      const correctOrigin = target.origin.name;
      // Usar origens dos outros personagens como opções erradas
      const otherOrigins = chars
        .filter((c) => c.id !== target.id && c.origin?.name && c.origin.name !== correctOrigin)
        .map((c) => c.origin.name);
      const uniqueWrong = [...new Set(otherOrigins)];
      // Pad with fallbacks if needed
      const fallbacks = ['Earth (C-137)', 'Citadel of Ricks', 'Bird World', 'Anatomy Park', 'Gazorpazorp'];
      while (uniqueWrong.length < 3) {
        const fb = fallbacks.shift();
        if (fb && fb !== correctOrigin && !uniqueWrong.includes(fb)) uniqueWrong.push(fb);
        if (!fb) break;
      }
      if (uniqueWrong.length < 3) continue;
      return makeQuestionImageQuestion(
        'Qual é a ORIGEM deste personagem?',
        target,
        [correctOrigin, ...uniqueWrong.slice(0, 3)],
        correctOrigin
      );
    }
    return null;
  },
];

// ─── GERADORES: DIFÍCIL ─────────────────────────────────────────────

const hardGenerators = [
  // Qual aparece no episódio X?
  async () => {
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const episode = await getRandomEpisode();
        if (!episode.characters || episode.characters.length < 1) continue;
        const charUrls = shuffle(episode.characters).slice(0, 1);
        const charId = extractIdFromUrl(charUrls[0]);
        if (!charId) continue;
        const [correctChar] = await getCharactersByIds([charId]);
        if (!correctChar || !correctChar.image) continue;
        const episodeCharIds = new Set(
          episode.characters.map((url) => extractIdFromUrl(url)).filter(Boolean)
        );
        const randomChars = await getRandomCharacters(10);
        const wrongChars = randomChars.filter((c) => !episodeCharIds.has(c.id));
        if (wrongChars.length < 3) continue;
        const wrong = shuffle(wrongChars).slice(0, 3);
        const options = shuffle([correctChar, ...wrong]).map(simplify);
        return {
          question: `Qual destes personagens aparece no episódio "${episode.name}" (${episode.episode})?`,
          visualType: 'question-and-answer-cards',
          targetImage: null,
          targetData: {
            name: episode.name,
            subtitle: `${episode.episode} · ${episode.air_date}`,
            meta: 'Episódio',
          },
          options,
          correctId: correctChar.id,
          apiData: {
            episodio: { id: episode.id, name: episode.name, episode: episode.episode, air_date: episode.air_date },
            personagens: options,
          },
        };
      } catch { continue; }
    }
    return null;
  },

  // Qual NÃO aparece no episódio X?
  async () => {
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const episode = await getRandomEpisode();
        if (!episode.characters || episode.characters.length < 3) continue;
        const charUrls = shuffle(episode.characters).slice(0, 3);
        const charIds = charUrls.map((url) => extractIdFromUrl(url)).filter(Boolean);
        if (charIds.length < 3) continue;
        const episodeChars = await getCharactersByIds(charIds);
        const validEpChars = episodeChars.filter((c) => c && c.image);
        if (validEpChars.length < 3) continue;
        const episodeCharIds = new Set(
          episode.characters.map((url) => extractIdFromUrl(url)).filter(Boolean)
        );
        const randomChars = await getRandomCharacters(8);
        const outsiders = randomChars.filter((c) => !episodeCharIds.has(c.id) && c.image);
        if (outsiders.length < 1) continue;
        const correct = outsiders[0];
        const options = shuffle([correct, ...validEpChars.slice(0, 3)]).map(simplify);
        return {
          question: `Qual destes personagens NÃO aparece no episódio "${episode.name}" (${episode.episode})?`,
          visualType: 'question-and-answer-cards',
          targetImage: null,
          targetData: {
            name: episode.name,
            subtitle: `${episode.episode} · ${episode.air_date}`,
            meta: 'Episódio',
          },
          options,
          correctId: correct.id,
          apiData: {
            episodio: { id: episode.id, name: episode.name, episode: episode.episode, air_date: episode.air_date },
            personagens: options,
          },
        };
      } catch { continue; }
    }
    return null;
  },

  // Qual pertence à localização X?
  async () => {
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const location = await getRandomLocation();
        if (!location.residents || location.residents.length < 1) continue;
        if (location.name === 'unknown') continue;
        const residentUrls = shuffle(location.residents).slice(0, 1);
        const residentId = extractIdFromUrl(residentUrls[0]);
        if (!residentId) continue;
        const [correctChar] = await getCharactersByIds([residentId]);
        if (!correctChar || !correctChar.image) continue;
        const residentIds = new Set(
          location.residents.map((url) => extractIdFromUrl(url)).filter(Boolean)
        );
        const randomChars = await getRandomCharacters(8);
        const nonResidents = randomChars.filter((c) => !residentIds.has(c.id) && c.image);
        if (nonResidents.length < 3) continue;
        const wrong = shuffle(nonResidents).slice(0, 3);
        const options = shuffle([correctChar, ...wrong]).map(simplify);
        return {
          question: `Qual destes personagens pertence à localização "${location.name}"?`,
          visualType: 'question-and-answer-cards',
          targetImage: null,
          targetData: {
            name: location.name,
            subtitle: `${location.type || '?'} · ${location.dimension || '?'}`,
            meta: 'Localização',
          },
          options,
          correctId: correctChar.id,
          apiData: {
            localizacao: { id: location.id, name: location.name, type: location.type, dimension: location.dimension },
            personagens: options,
          },
        };
      } catch { continue; }
    }
    return null;
  },

  // Mais aparições (difícil)
  async () => {
    for (let i = 0; i < MAX_RETRIES; i++) {
      const chars = await getRandomCharacters(4);
      if (chars.length < 4) continue;
      const sorted = [...chars].sort((a, b) => (b.episode?.length || 0) - (a.episode?.length || 0));
      if ((sorted[0].episode?.length || 0) === (sorted[1].episode?.length || 0)) continue;
      return makeAnswerCardsQuestion(
        'Qual destes personagens tem MAIS aparições em episódios?',
        chars,
        sorted[0]
      );
    }
    return null;
  },

  // Menos aparições (difícil)
  async () => {
    for (let i = 0; i < MAX_RETRIES; i++) {
      const chars = await getRandomCharacters(4);
      if (chars.length < 4) continue;
      const sorted = [...chars].sort((a, b) => (a.episode?.length || 0) - (b.episode?.length || 0));
      if ((sorted[0].episode?.length || 0) === (sorted[1].episode?.length || 0)) continue;
      return makeAnswerCardsQuestion(
        'Qual destes personagens tem MENOS aparições em episódios?',
        chars,
        sorted[0]
      );
    }
    return null;
  },
];

// ─── GERADOR PRINCIPAL ─────────────────────────────────────────────

/**
 * Gera um conjunto de perguntas para o modo especificado.
 * @param {'easy' | 'medium' | 'hard'} mode
 * @param {number} count
 * @returns {Promise<Object[]>}
 */
export const generateQuestions = async (mode, count) => {
  let generators;
  switch (mode) {
    case 'easy':
      generators = easyGenerators;
      break;
    case 'medium':
      generators = [...easyGenerators, ...mediumGenerators];
      break;
    case 'hard':
      generators = [...mediumGenerators, ...hardGenerators];
      break;
    default:
      generators = easyGenerators;
  }

  const questions = [];
  const usedIndices = new Set();

  for (let q = 0; q < count; q++) {
    let question = null;

    for (let attempt = 0; attempt < MAX_RETRIES * 2; attempt++) {
      // Priorizar geradores não usados
      let available = generators.map((g, idx) => ({ g, idx })).filter(({ idx }) => !usedIndices.has(idx));
      if (available.length === 0) {
        usedIndices.clear();
        available = generators.map((g, idx) => ({ g, idx }));
      }

      const pick = available[Math.floor(Math.random() * available.length)];

      try {
        question = await pick.g();
        if (question) {
          question.id = q + 1;
          question.difficulty = mode;
          question.mode = mode;
          question.questionType = question.visualType;
          usedIndices.add(pick.idx);
          break;
        }
      } catch (err) {
        console.warn(`[questionGenerator] Falha no gerador para pergunta ${q + 1}:`, err);
      }
    }

    if (question) {
      questions.push(question);
    }
  }

  return questions;
};
