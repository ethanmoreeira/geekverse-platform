
// Serviço de integração com a SWAPI (swapi.tech).
// Busca naves, personagens, planetas e veículos para Fuga do Hiperespaço.
// URL base: https://www.swapi.tech/api
//
// LISTA CURADA: UIDs fixos para garantir sempre os mesmos 6 itens por categoria.
// Isso evita instabilidade de paginação da SWAPI (cards que aparecem e somem).

const SWAPI_BASE = 'https://www.swapi.tech/api';
const CACHE_PREFIX = 'geekverse_swapi_';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos

// Lista de VIPs (Para o jogo não quebrar caso a API mude a ordem das páginas)
// UIDs baseados no endpoint /starships/:uid, /people/:uid, etc.
// Escolhidos por relevância ao universo Star Wars canônico.

export const CURATED_STARSHIP_IDS = [2, 9, 12, 3, 11, 22];
// 2 = CR90 corvette | 9 = Death Star | 12 = X-wing
// 3 = Star Destroyer | 11 = Y-wing | 22 = Millennium Falcon

export const CURATED_PEOPLE_IDS = [1, 4, 5, 3, 2, 10];
// 1 = Luke Skywalker | 4 = Darth Vader | 5 = Leia Organa
// 3 = R2-D2 | 2 = C-3PO | 10 = Obi-Wan Kenobi

export const CURATED_PLANET_IDS = [1, 2, 3, 4, 5, 6];
// 1 = Tatooine | 2 = Alderaan | 3 = Yavin IV
// 4 = Hoth | 5 = Dagobah | 6 = Bespin

export const CURATED_VEHICLE_IDS = [14, 18, 19, 4, 6, 38];
// 14 = Snowspeeder | 18 = AT-AT | 19 = AT-ST
// 4 = Sand Crawler | 6 = X-34 landspeeder | 38 = Sail barge

// Funções de Ajuda (Helpers)

// Helper de segurança: avisa se a internet cair ou a SWAPI ficar fora do ar em vez de bugar o jogo
const safeFetch = async (url, label = 'recurso') => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Não foi possível carregar ${label} (status ${response.status}).`
    );
  }
  return response.json();
};

// Transformação de Dados: Arrumando a bagunça da API

// Passo 1: Limpa números bagunçados da API
// Trata casos tipo "unknown", "10 MGLT", tira vírgulas e pega só o número real.
export const normalizeNumber = (value, fallback = 0) => {
  if (value === null || value === undefined) return fallback;

  const str = String(value).trim().toLowerCase();

  if (!str || str === 'unknown' || str === 'n/a' || str === 'none' || str === 'indefinite') {
    return fallback;
  }

  // Remove vírgulas de milhar
  let cleaned = str.replace(/,/g, '');

  // Extrai apenas a parte numérica (suporta decimais com ponto)
  const match = cleaned.match(/[-+]?[0-9]*\.?[0-9]+/);
  if (!match) return fallback;

  const num = parseFloat(match[0]);
  return isNaN(num) ? fallback : num;
};

// Conversão das Naves (Cria Status de Jogo baseado no peso/tamanho real)

export const normalizeStarship = (raw) => {
  const props = raw.properties || raw;
  const id = raw.uid || raw._id || String(Math.random()).slice(2, 8);

  const length = normalizeNumber(props.length);
  const crew = normalizeNumber(props.crew);
  const passengers = normalizeNumber(props.passengers);
  const maxSpeed = normalizeNumber(props.max_atmosphering_speed);
  const cargoCapacity = normalizeNumber(props.cargo_capacity);
  const hyperdriveRating = normalizeNumber(props.hyperdrive_rating);
  const mglt = normalizeNumber(props.MGLT);

  const gameSpeed = Math.min(Math.max(maxSpeed > 0 ? Math.round(maxSpeed / 100) : mglt > 0 ? mglt : 5, 1), 20);
  const baseShield = Math.min(
    Math.max(
      Math.round((cargoCapacity > 0 ? Math.log10(cargoCapacity + 1) * 3 : 0) + (length > 0 ? length / 50 : 0)),
      1
    ),
    20
  );
  const handling = Math.max(
    Math.round(15 - (crew > 10 ? crew / 20 : 0) - (length > 100 ? length / 200 : 0)),
    1
  );

  let shipSize = 'medium';
  if (length <= 20) shipSize = 'small';
  else if (length <= 100) shipSize = 'medium';
  else if (length <= 1000) shipSize = 'large';
  else shipSize = 'colossal';

  const starshipClass = (props.starship_class || '').toLowerCase();
  let shipRole = 'unknown';
  if (/fighter|interceptor|bomber|assault|patrol/.test(starshipClass)) shipRole = 'fighter';
  else if (/transport|freighter|shuttle|yacht|barge/.test(starshipClass)) shipRole = 'transport';
  else if (/cruiser|corvette|destroyer|frigate|dreadnought|capital/.test(starshipClass)) shipRole = 'cruiser';
  else if (/station|battle station/.test(starshipClass)) shipRole = 'station';
  else if (starshipClass) shipRole = 'transport';

  return {
    id,
    name: props.name || 'Nave desconhecida',
    model: props.model || 'Modelo desconhecido',
    manufacturer: props.manufacturer || 'Fabricante desconhecido',
    starshipClass: props.starship_class || 'Desconhecida',
    length,
    crew,
    passengers,
    maxSpeed,
    cargoCapacity,
    hyperdriveRating,
    mglt,
    imageSlot: 'starship-placeholder',
    gameSpeed,
    baseShield,
    handling,
    shipSize,
    shipRole,
    raw: props,
  };
};

// Conversão dos Pilotos (Cria Bônus baseados no peso/altura)

export const normalizePilot = (raw) => {
  const props = raw.properties || raw;
  const id = raw.uid || raw._id || String(Math.random()).slice(2, 8);

  const height = normalizeNumber(props.height);
  const mass = normalizeNumber(props.mass);

  let speedBonus = 0;
  let shieldBonus = 0;
  let handlingBonus = 0;
  let pilotType = 'balanced';

  if (mass > 0 && mass < 60) {
    handlingBonus = 3;
    speedBonus = 1;
    pilotType = 'agile';
  } else if (mass >= 60 && mass <= 90) {
    handlingBonus = 1;
    speedBonus = 2;
    pilotType = 'balanced';
  } else if (mass > 90) {
    shieldBonus = 3;
    handlingBonus = -1;
    pilotType = 'tank';
  }

  if (height > 190) {
    shieldBonus += 1;
  }

  return {
    id,
    name: props.name || 'Piloto desconhecido',
    height,
    mass,
    gender: props.gender || 'unknown',
    birthYear: props.birth_year || 'unknown',
    homeworld: props.homeworld || 'unknown',
    species: Array.isArray(props.species) ? props.species : [],
    imageSlot: 'pilot-placeholder',
    speedBonus,
    shieldBonus,
    handlingBonus,
    pilotType,
    raw: props,
  };
};

// Conversão dos Planetas (Cria Nível de Perigo baseado na gravidade e clima)

export const normalizePlanet = (raw) => {
  const props = raw.properties || raw;
  const id = raw.uid || raw._id || String(Math.random()).slice(2, 8);

  const diameter = normalizeNumber(props.diameter);
  const rotationPeriod = normalizeNumber(props.rotation_period);
  const orbitalPeriod = normalizeNumber(props.orbital_period);
  const population = normalizeNumber(props.population);

  const gravityStr = (props.gravity || '').toLowerCase();
  let gravity = 1;
  if (gravityStr && gravityStr !== 'unknown' && gravityStr !== 'n/a') {
    const gMatch = gravityStr.match(/[-+]?[0-9]*\.?[0-9]+/);
    if (gMatch) gravity = parseFloat(gMatch[0]);
  }

  const climate = (props.climate || 'unknown').toLowerCase();
  const terrain = (props.terrain || 'unknown').toLowerCase();

  let planetDanger = 1;
  let asteroidSpeedModifier = 1;
  let spawnRateModifier = 1;
  let handlingPenalty = 0;
  let environmentType = 'neutral';

  if (gravity > 1.5) {
    planetDanger += 2;
    asteroidSpeedModifier += 0.4;
    handlingPenalty += 2;
  } else if (gravity > 1) {
    planetDanger += 1;
    asteroidSpeedModifier += 0.2;
    handlingPenalty += 1;
  }

  if (/mountain|rocky|volcano/.test(terrain)) {
    planetDanger += 1;
    spawnRateModifier += 0.3;
    environmentType = 'rocky';
  } else if (/desert|barren/.test(terrain)) {
    planetDanger += 0.5;
    spawnRateModifier += 0.1;
    environmentType = 'desert';
  } else if (/jungle|forest|swamp/.test(terrain)) {
    handlingPenalty += 1;
    environmentType = 'organic';
  } else if (/ice|frozen|tundra/.test(terrain)) {
    handlingPenalty += 2;
    environmentType = 'frozen';
  } else if (/ocean|water|lake/.test(terrain)) {
    environmentType = 'aquatic';
  } else if (/city|urban|cityscape/.test(terrain)) {
    environmentType = 'urban';
  } else if (/gas/.test(terrain)) {
    planetDanger += 1;
    environmentType = 'gas';
  }

  if (/frozen|frigid/.test(climate)) {
    planetDanger += 0.5;
    handlingPenalty += 1;
  } else if (/arid|hot|superheated/.test(climate)) {
    planetDanger += 0.5;
    asteroidSpeedModifier += 0.1;
  } else if (/toxic|polluted/.test(climate)) {
    planetDanger += 1;
    spawnRateModifier += 0.2;
  }

  planetDanger = Math.min(Math.round(planetDanger), 5);

  return {
    id,
    name: props.name || 'Planeta desconhecido',
    climate: props.climate || 'unknown',
    terrain: props.terrain || 'unknown',
    gravity,
    population,
    diameter,
    rotationPeriod,
    orbitalPeriod,
    imageSlot: 'planet-placeholder',
    planetDanger,
    asteroidSpeedModifier: Math.round(asteroidSpeedModifier * 100) / 100,
    spawnRateModifier: Math.round(spawnRateModifier * 100) / 100,
    handlingPenalty,
    environmentType,
    raw: props,
  };
};

// Conversão dos Veículos (Cria Status extras)

export const normalizeVehicle = (raw) => {
  const props = raw.properties || raw;
  const id = raw.uid || raw._id || String(Math.random()).slice(2, 8);

  const length = normalizeNumber(props.length);
  const crew = normalizeNumber(props.crew);
  const passengers = normalizeNumber(props.passengers);
  const maxSpeed = normalizeNumber(props.max_atmosphering_speed);
  const cargoCapacity = normalizeNumber(props.cargo_capacity);

  let equipmentSpeedBonus = 0;
  let equipmentShieldBonus = 0;
  let equipmentHandlingBonus = 0;
  let equipmentType = 'utility';

  if (maxSpeed > 300) {
    equipmentSpeedBonus = 3;
    equipmentType = 'speed';
  } else if (maxSpeed > 100) {
    equipmentSpeedBonus = 1;
  }

  if (cargoCapacity > 50000) {
    equipmentShieldBonus = 3;
    equipmentType = 'heavy';
  } else if (cargoCapacity > 5000) {
    equipmentShieldBonus = 1;
  }

  if (length > 0 && length < 10) {
    equipmentHandlingBonus = 3;
    if (equipmentType === 'utility') equipmentType = 'light';
  } else if (length >= 10 && length < 30) {
    equipmentHandlingBonus = 1;
  }

  return {
    id,
    name: props.name || 'Veículo desconhecido',
    model: props.model || 'Modelo desconhecido',
    manufacturer: props.manufacturer || 'Fabricante desconhecido',
    vehicleClass: props.vehicle_class || 'Desconhecida',
    length,
    crew,
    passengers,
    maxSpeed,
    cargoCapacity,
    imageSlot: 'equipment-placeholder',
    equipmentSpeedBonus,
    equipmentShieldBonus,
    equipmentHandlingBonus,
    equipmentType,
    raw: props,
  };
};

// Funções que vão lá na API buscar as coisas

// Passo 2: Busca UM item na API (ex: 1 Nave) e salva na memória pra não travar depois
const fetchByUid = async (endpoint, uid) => {
  // Tentar cache primeiro
  const cacheKey = `${CACHE_PREFIX}${endpoint}_${uid}`;
  try {
    const raw = sessionStorage.getItem(cacheKey);
    if (raw) {
      const cached = JSON.parse(raw);
      if (cached && cached._ts && Date.now() - cached._ts < CACHE_TTL_MS) {
        return cached.data;
      }
    }
  } catch {
    // Cache corrompido — ignorar e buscar normalmente
  }

  try {
    const data = await safeFetch(`${SWAPI_BASE}/${endpoint}/${uid}`, `${endpoint} #${uid}`);
    const result = data?.result || null;

    // Salvar no cache
    if (result) {
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({ data: result, _ts: Date.now() }));
      } catch {
        // Quota excedida — ignorar
      }
    }

    return result;
  } catch {
    console.warn(`[starWarsApi] Falha ao buscar ${endpoint}/${uid}. Ignorando.`);
    return null;
  }
};

// Passo 3: Busca VÁRIOS itens da API ao mesmo tempo (em paralelo) pra tela carregar mais rápido
const fetchCuratedList = async (endpoint, ids, normalizer) => {
  const results = await Promise.all(ids.map((uid) => fetchByUid(endpoint, uid)));
  return results.filter(Boolean).map(normalizer);
};

// Exportando as funções para o React poder usar

// Puxa só as 6 naves escolhidas a dedo (lista VIP)
export const fetchStarships = async () => {
  try {
    return await fetchCuratedList('starships', CURATED_STARSHIP_IDS, normalizeStarship);
  } catch (err) {
    console.error('[starWarsApi] Erro ao buscar naves:', err.message);
    return [];
  }
};

// Puxa só os 6 pilotos escolhidos a dedo
export const fetchPeople = async () => {
  try {
    return await fetchCuratedList('people', CURATED_PEOPLE_IDS, normalizePilot);
  } catch (err) {
    console.error('[starWarsApi] Erro ao buscar personagens:', err.message);
    return [];
  }
};

// Puxa só os 6 planetas escolhidos a dedo
export const fetchPlanets = async () => {
  try {
    return await fetchCuratedList('planets', CURATED_PLANET_IDS, normalizePlanet);
  } catch (err) {
    console.error('[starWarsApi] Erro ao buscar planetas:', err.message);
    return [];
  }
};

// Puxa só os 6 veículos escolhidos a dedo
export const fetchVehicles = async () => {
  try {
    return await fetchCuratedList('vehicles', CURATED_VEHICLE_IDS, normalizeVehicle);
  } catch (err) {
    console.error('[starWarsApi] Erro ao buscar veículos:', err.message);
    return [];
  }
};

// Função Principal: Essa é a que a tela do jogo (StarWarsGame) chama.
// Ela manda baixar todas as naves, pilotos, planetas e veículos de uma vez só!
export const fetchStarWarsMissionData = async () => {
  const [starships, pilots, planets, vehicles] = await Promise.all([
    fetchStarships(),
    fetchPeople(),
    fetchPlanets(),
    fetchVehicles(),
  ]);

  return {
    starships: starships.slice(0, 6),
    pilots: pilots.slice(0, 6),
    planets: planets.slice(0, 6),
    vehicles: vehicles.slice(0, 6),
  };
};
