// Banco de palabras oficial EN ESPAÑOL para el juego de sala "EL IMPOSTOR" (Paso 6.7)
// Incluye 8 categorías con 12 palabras cada una (96 palabras en total).
// Sin marcas registradas, sin personajes con derechos de autor y sin palabras ofensivas.

export interface ImpostorCategoryBank {
  id: string;
  categoryName: string;
  icon: string;
  words: string[];
}

export const IMPOSTOR_WORD_BANK: ImpostorCategoryBank[] = [
  {
    id: "lugares",
    categoryName: "Lugares",
    icon: "🏖️",
    words: [
      "PLAYA",
      "BIBLIOTECA",
      "HOSPITAL",
      "AEROPUERTO",
      "ESTADIO",
      "MUSEO",
      "SUPERMERCADO",
      "GIMNASIO",
      "CINE",
      "PARQUE",
      "RESTAURANTE",
      "ESTACIÓN DE TREN",
    ],
  },
  {
    id: "comida",
    categoryName: "Comida",
    icon: "🌮",
    words: [
      "TACOS",
      "PAELLA",
      "PIZZA",
      "HAMBURGUESA",
      "CEVICHE",
      "TAMALES",
      "LASAÑA",
      "ENSALADA",
      "CHURROS",
      "HELADO",
      "SOPA CALIENTE",
      "EMPANADAS",
    ],
  },
  {
    id: "profesiones",
    categoryName: "Profesiones",
    icon: "👨‍🚒",
    words: [
      "BOMBERO",
      "ASTRONAUTA",
      "ARQUITECTO",
      "VETERINARIO",
      "CARPINTERO",
      "PILOTO DE AVIÓN",
      "PANADERO",
      "FOTÓGRAFO",
      "ELECTRICISTA",
      "JARDINERO",
      "DENTISTA",
      "MÚSICO",
    ],
  },
  {
    id: "objetos_casa",
    categoryName: "Objetos de la casa",
    icon: "🛋️",
    words: [
      "ESPEJO",
      "ALMOHADA",
      "LÁMPARA",
      "REFRIGERADOR",
      "LICUADORA",
      "PARAGUAS",
      "RELOJ DE PARED",
      "CAFETERA",
      "ESCOBA",
      "VENTILADOR",
      "SILLÓN",
      "TOALLA",
    ],
  },
  {
    id: "animales",
    categoryName: "Animales",
    icon: "🐬",
    words: [
      "DELFÍN",
      "ÁGUILA",
      "CAMALEÓN",
      "ELEFANTE",
      "PINGÜINO",
      "LOBO",
      "TORTUGA",
      "CANGURO",
      "BÚHO",
      "TIBURÓN",
      "CABALLO",
      "KOALA",
    ],
  },
  {
    id: "deportes",
    categoryName: "Deportes",
    icon: "⚽",
    words: [
      "FÚTBOL",
      "NATACIÓN",
      "BOXEO",
      "CICLISMO",
      "ATLETISMO",
      "VOLEIBOL",
      "TENIS",
      "BALONCESTO",
      "SURF",
      "PATINAJE",
      "ESCALADA",
      "REMO",
    ],
  },
  {
    id: "peliculas_series",
    categoryName: "Películas y series en general",
    icon: "🎬",
    words: [
      "VIAJE EN EL TIEMPO",
      "ISLA DESIERTA",
      "MANSIÓN EMBRUJADA",
      "ROBO AL BANCO",
      "INVASIÓN EXTRATERRESTRE",
      "NÁUFRAGO EN EL MAR",
      "ESCUELA DE MAGIA",
      "DETECTIVE PRIVADO",
      "TORNEO DE ARTES MARCIALES",
      "SUBMARINO PERDIDO",
      "EXPEDICIÓN ESPACIAL",
      "BÚSQUEDA DEL TESORO",
    ],
  },
  {
    id: "lugares_famosos",
    categoryName: "Lugares famosos del mundo",
    icon: "🗽",
    words: [
      "GRAN MURALLA CHINA",
      "TORRE EIFFEL",
      "MACHU PICCHU",
      "PIRÁMIDES DE EGIPTO",
      "COLISEO ROMANO",
      "CATARATAS DEL NIÁGARA",
      "TAJ MAHAL",
      "SELVA DEL AMAZONAS",
      "MONTE EVEREST",
      "GRAN CAÑÓN",
      "ISLA DE PASCUA",
      "AURORA BOREAL",
    ],
  },
];

export function pickRandomImpostorWord(excludeWord?: string): {
  categoryName: string;
  categoryIcon: string;
  secretWord: string;
} {
  const category =
    IMPOSTOR_WORD_BANK[Math.floor(Math.random() * IMPOSTOR_WORD_BANK.length)];
  const candidates = category.words.filter((w) => w !== excludeWord);
  const secretWord =
    candidates[Math.floor(Math.random() * candidates.length)] ||
    category.words[0];

  return {
    categoryName: category.categoryName,
    categoryIcon: category.icon,
    secretWord,
  };
}

export function normalizeWordForComparison(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9\s]/g, "")
    .replace(/\s+/g, " ");
}
