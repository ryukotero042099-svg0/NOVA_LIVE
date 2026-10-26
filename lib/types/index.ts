export type CreatorTier = "cantera" | "titular";

export type GameModuleId =
  | "la-sala-carreras"
  | "historia-terror"
  | "futbol-penales";

export type DonationAnimationTier =
  | "estrella_fugaz" // Desde 5 Novas (5 - 24 Novas) -> Marco Nivel Estrella (Cian)
  | "explosion_nova" // Desde 25 Novas (25 - 99 Novas) -> Marco Nivel Explosión (Violeta)
  | "supernova";     // Desde 100 Novas (100+ Novas) -> Marco Nivel Supernova (Rosa/Dorado)

export type GiftLevelFrame = "estrella" | "explosion" | "supernova";

export type GiftCollectionSet = "cosmico" | "diversion" | "leyendas";

export type GiftSignatureAnimation =
  | "anim-shooting-star"
  | "anim-heart-beat"
  | "anim-rocket-launch"
  | "anim-planet-orbit"
  | "anim-meteor-rain"
  | "anim-vortex-spin"
  | "anim-supernova-rays"
  | "anim-blackhole-gravity"
  | "anim-galaxy-spiral"
  | "anim-teddy-bounce"
  | "anim-soccer-goal"
  | "anim-rose-bloom"
  | "anim-candy-pop"
  | "anim-butterfly-flutter"
  | "anim-icecream-frost"
  | "anim-duck-ripple"
  | "anim-cat-pounce"
  | "anim-unicorn-rainbow"
  | "anim-diamond-prism"
  | "anim-crown-descend"
  | "anim-trophy-champion"
  | "anim-giftbox-pop"
  | "anim-guitar-sonic"
  | "anim-lion-roar"
  | "anim-dragon-flame"
  | "anim-castle-aurora"
  | "anim-phoenix-rise";

export interface NovaGiftItem {
  id: string;
  name: string;
  novas: number;
  collectionSet: GiftCollectionSet;
  collectionLabel: string;
  frameTier: GiftLevelFrame;
  frameTierLabel: "Nivel Estrella" | "Nivel Explosión" | "Nivel Supernova";
  animationTier: DonationAnimationTier;
  signatureAnimation: GiftSignatureAnimation;
  animationDescription: string;
  particleSymbols: string[];
  pngUrl: string;
  svgUrl: string;
  frameSvgUrl: string;
  gameEffectLabel: string;
}

export interface NovaPackage {
  id: string;
  name: "Órbita" | "Nova" | "Estelar" | "Supernova" | "Galaxia Nova";
  novas: number;
  bonusNovas: number;
  priceUsd: number;
  badge?: string;
  glowVariant: "cyan" | "violet" | "magenta" | "gold";
  description: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  avatarUrl: string;
  bio: string;
  createdAt: string;
  accountAgeDays: number;
  followersCount: number;
  novaBalance: number;
  creatorEarningsUsd: number;
  availableWithdrawUsd: number;
  tier: CreatorTier;
  isLive: boolean;
  stripeConnectLinked: boolean;
  justGraduated?: boolean;
  recommendedByTitular?: string;
}

export interface PasaleTuGenteRecommendation {
  id: string;
  fromTitularId: string;
  fromTitularName: string;
  fromTitularUsername: string;
  fromTitularAvatar: string;
  toCanteraId: string;
  toCanteraName: string;
  toCanteraUsername: string;
  toCanteraAvatar: string;
  viewersPassed: number;
  message: string;
  createdAt: string;
}

export interface VoiceParticipant {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  role: "anfitrion" | "espectador_voz";
  hasCamera: boolean;
  isMicOn: boolean;
  isMutedByHost: boolean;
  isSpeaking: boolean;
  joinedAt: string;
}

export interface RaceParticipant {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  shipIcon: string;
  laneColor: "cyan" | "violet" | "magenta" | "emerald" | "gold";
  progress: number; // 0 a 100
  finishedAtMs?: number;
  finishPlace?: 1 | 2 | 3 | number;
  isBot?: boolean;
}

export interface LiveRaceState {
  raceId: string;
  status: "lobby" | "countdown" | "racing" | "finished";
  countdownValue: number; // 3, 2, 1, 0
  startedAtMs?: number;
  racers: RaceParticipant[];
  podium: RaceParticipant[]; // Top 3: 1°, 2°, 3°
  winner?: RaceParticipant | null;
}

// ---- Paso 6.7: Juego de sala EL IMPOSTOR ----
export interface ImpostorPlayer {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  windowId: string; // ventana que ocupa este asiento (la vista privada solo se muestra ahí)
}

export interface ImpostorScoreEntry {
  playerId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  impostorWins: number; // veces que ganó como impostor
  roomWins: number; // veces que ganó la sala
}

export interface LiveImpostorState {
  gameId: string;
  round: number;
  status: "lobby" | "clues" | "voting" | "impostor_last_chance" | "revealed";
  players: ImpostorPlayer[]; // jugadores de la ronda (4–10)
  queue: ImpostorPlayer[]; // llegaron tarde / no cupieron: entran en la siguiente ronda
  categoryName?: string;
  categoryIcon?: string;
  secretWord?: string; // SOLO se muestra a no-impostores; a todos al revelar
  impostorId?: string; // NUNCA se muestra hasta la revelación
  turnIndex: number;
  turnEndsAtMs?: number; // fin del turno de pista (20 s) o de la última oportunidad
  votes: Record<string, string>; // jugador -> sospechoso
  roomVotes: Record<string, string>; // espectador -> sospechoso ("La sala opina")
  mostVotedId?: string | null;
  outcome?: "caught_failed" | "stole" | "escaped";
  guessedWord?: string;
}

// ---- Paso 6.8: Juego cooperativo DEFIENDE LA NAVE ----
export interface DefensePlayer {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  windowId: string;
  colorIdx: number; // color fijo del defensor
  sector: number; // sector de defensa (0..n-1)
}

export interface DefenseAsteroid {
  id: string;
  sector: number;
  off: number; // desvío angular dentro del sector (-0.25..0.25)
  spawnT: number; // ms desde el inicio de la oleada
  travelMs: number; // ms que tarda en llegar a la nave
  kind: "normal" | "golden" | "enemy";
  hp: number;
}

export interface DefenseResolution {
  result: "destroyed" | "impact";
  by?: string;
  support?: boolean;
  atMs: number;
}

export interface DefenseScore {
  destroyed: number;
  supports: number;
  shots: number;
  hits: number;
}

export interface LiveDefenseState {
  gameId: string;
  rev: number; // versión: solo la ventana del anfitrión escribe este estado
  status: "lobby" | "wave" | "between" | "over";
  players: DefensePlayer[];
  wave: number;
  waveStartMs: number;
  asteroids: DefenseAsteroid[];
  resolved: Record<string, DefenseResolution>;
  hits: Record<string, number>; // golpes recibidos por la nave enemiga
  hitAt: Record<string, number>;
  energy: number; // 0..100
  scores: Record<string, DefenseScore>;
  supportUsedWave: Record<string, number>; // jugador -> oleada en la que gastó su apoyo
  fx: Record<string, { type: "shoot" | "support" | "hit"; atMs: number }>;
  lastImpact?: { sector: number; atMs: number; damage: number };
  lastGoldenAtMs?: number;
  announcement?: { text: string; untilMs: number };
  betweenEndsAtMs?: number;
  wavesSurvived: number;
  enemiesDestroyed: number;
}

// ---- Minijuego de Sala Masivo: TRIVIA GALÁCTICA (Supervivencia) ----
export interface TriviaPlayer {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  windowId: string;
  lives: number; // 3 vidas iniciales
  score: number; // puntos acumulados
  streak: number; // racha de aciertos seguidos
  isEliminated: boolean;
  selectedOption?: 0 | 1 | 2 | 3 | null;
  lastAnswerCorrect?: boolean | null;
}

export interface LiveTriviaQuestionState {
  id: string;
  category: string;
  categoryIcon: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  curiosity: string;
}

export interface LiveTriviaState {
  gameId: string;
  status: "lobby" | "question" | "reveal" | "finished";
  currentQuestionIndex: number;
  totalQuestions: number;
  questions: LiveTriviaQuestionState[];
  players: TriviaPlayer[];
  questionEndsAtMs?: number;
  revealEndsAtMs?: number;
  tallies: [number, number, number, number]; // votos por opción
  podium: TriviaPlayer[];
}

export interface ActiveLiveSession {
  roomId: string;
  roomCode: string;
  title: string;
  hostId: string;
  hostWindowId?: string;
  hostUsername: string;
  hostDisplayName: string;
  hostAvatar: string;
  hostTier: CreatorTier;
  startedAt: string;
  viewersCount: number;
  peakViewers: number;
  providerMode: "livekit_cloud" | "demo_webrtc";
  hostCameraEnabled: boolean;
  voiceParticipants: VoiceParticipant[];
  activeRace?: LiveRaceState | null;
  activeImpostor?: LiveImpostorState | null;
  impostorScoreboard?: ImpostorScoreEntry[];
  activeDefense?: LiveDefenseState | null;
  activeTrivia?: LiveTriviaState | null;
}

export interface BroadcastHistoryLog {
  id: string;
  hostId: string;
  hostUsername: string;
  hostDisplayName: string;
  title: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  peakViewers: number;
  providerMode: "livekit_cloud" | "demo_webrtc";
}

export interface LiveRoom {
  id: string;
  code: string;
  title: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  hostTier: CreatorTier;
  hostAccountAgeDays: number;
  hostFollowers: number;
  gameId: GameModuleId;
  gameTitle: string;
  viewersCount: number;
  playersInMatch: number;
  maxPlayers: number;
  voiceActiveCount: number;
  isOpenToJoin: boolean;
  tags: string[];
}

export interface DonationAlertEvent {
  id: string;
  donorName: string;
  amountNovas: number;
  tier: DonationAnimationTier;
  giftId: string;
  giftName: string;
  giftIconUrl: string;
  signatureAnimation: GiftSignatureAnimation;
  animationDescription: string;
  particleSymbols: string[];
  eventTitle: string;
  timestamp: string;
}

export interface NovaTransaction {
  id: string;
  userId: string;
  type: "package_purchase" | "gift_sent" | "creator_earning" | "creator_withdrawal";
  title: string;
  amountNovas?: number;
  amountUsd: number;
  creatorShareUsd?: number;
  platformShareUsd?: number;
  processorShareUsd?: number;
  createdAt: string;
  status: "completado" | "en_proceso";
}

export interface ModerationReport {
  id: string;
  reporterId: string;
  targetUserId: string;
  targetUsername: string;
  reason: "acoso" | "trampa_juego" | "spam" | "contenido_inapropiado";
  details: string;
  createdAt: string;
}

export function getDonationAnimationTier(novas: number): DonationAnimationTier {
  if (novas >= 100) return "supernova";
  if (novas >= 25) return "explosion_nova";
  return "estrella_fugaz";
}

export const NOVA_ECONOMY_RULES = {
  CREATOR_SHARE_PERCENT: 77,
  PLATFORM_SHARE_PERCENT: 20,
  PROCESSOR_SHARE_PERCENT: 3,
  SUBSCRIPTION_CREATOR_PERCENT: 95,
  SUBSCRIPTION_PLATFORM_PERCENT: 5,
  MIN_WITHDRAWAL_USD: 20,
  CANTERA_MAX_FOLLOWERS: 100,
  CANTERA_MAX_EARNINGS_USD: 100,
  CANTERA_MAX_ACCOUNT_DAYS: 45,
  USD_PER_NOVA: 0.01, // 100 Novas = $1.00 USD -> Al donar: 77% Creador, 20% Plataforma, 3% Stripe
} as const;

/**
 * Regla Anti-Trampa de La Cantera:
 * Un creador permanece en 'cantera' únicamente si su cuenta es nueva (< 45 días),
 * tiene menos de 100 seguidores y ha ganado menos de $100 USD.
 * Al llegar a 100 seguidores o $100 USD se gradúa a 'titular'.
 */
export function evaluateCreatorTier(
  followersCount: number,
  creatorEarningsUsd: number,
  accountAgeDays: number = 1
): CreatorTier {
  if (
    followersCount >= NOVA_ECONOMY_RULES.CANTERA_MAX_FOLLOWERS ||
    creatorEarningsUsd >= NOVA_ECONOMY_RULES.CANTERA_MAX_EARNINGS_USD ||
    accountAgeDays > NOVA_ECONOMY_RULES.CANTERA_MAX_ACCOUNT_DAYS
  ) {
    return "titular";
  }
  return "cantera";
}

/**
 * CATÁLOGO COMPLETO DE LOS 27 REGALOS OFICIALES NOVA (3 Láminas × 9 Íconos)
 * CORRECCIÓN APLICADA: Galaxia unificada en 250 Novas en todo el sistema.
 */
export const NOVA_GIFT_CATALOG: NovaGiftItem[] = [
  // ==========================================================================
  // LÁMINA 1: SET CÓSMICO NOVA (9 Regalos)
  // ==========================================================================
  {
    id: "01-estrella-fugaz",
    name: "Estrella Fugaz",
    novas: 5,
    collectionSet: "cosmico",
    collectionLabel: "Set Cósmico",
    frameTier: "estrella",
    frameTierLabel: "Nivel Estrella",
    animationTier: "estrella_fugaz",
    signatureAnimation: "anim-shooting-star",
    animationDescription: "Cruce diagonal ultrarrápido con estela cometa cian",
    particleSymbols: ["✨", "☄️", "⭐"],
    pngUrl: "/gifts/png-512/01-estrella-fugaz.png",
    svgUrl: "/gifts/svg/01-estrella-fugaz.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-estrella.svg",
    gameEffectLabel: "Destello Rápido en Pista",
  },
  {
    id: "02-corazon-nova",
    name: "Corazón Nova",
    novas: 10,
    collectionSet: "cosmico",
    collectionLabel: "Set Cósmico",
    frameTier: "estrella",
    frameTierLabel: "Nivel Estrella",
    animationTier: "estrella_fugaz",
    signatureAnimation: "anim-heart-beat",
    animationDescription: "Latido neón rosa-violeta con lluvia de corazones luminosos",
    particleSymbols: ["💖", "💜", "✨"],
    pngUrl: "/gifts/png-512/02-corazon-nova.png",
    svgUrl: "/gifts/svg/02-corazon-nova.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-estrella.svg",
    gameEffectLabel: "Escudo de Energía al Anfitrión",
  },
  {
    id: "03-cohete",
    name: "Cohete",
    novas: 20,
    collectionSet: "cosmico",
    collectionLabel: "Set Cósmico",
    frameTier: "estrella",
    frameTierLabel: "Nivel Estrella",
    animationTier: "estrella_fugaz",
    signatureAnimation: "anim-rocket-launch",
    animationDescription: "Despegue propulsado con turbinas de luz cian",
    particleSymbols: ["🚀", "💠", "⚡"],
    pngUrl: "/gifts/png-512/03-cohete.png",
    svgUrl: "/gifts/svg/03-cohete.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-estrella.svg",
    gameEffectLabel: "Turbo Propulsor en Carrera",
  },
  {
    id: "04-planeta",
    name: "Planeta",
    novas: 25,
    collectionSet: "cosmico",
    collectionLabel: "Set Cósmico",
    frameTier: "explosion",
    frameTierLabel: "Nivel Explosión",
    animationTier: "explosion_nova",
    signatureAnimation: "anim-planet-orbit",
    animationDescription: "Órbita gravitacional con anillos de Saturno girando",
    particleSymbols: ["🪐", "💫", "🌌"],
    pngUrl: "/gifts/png-512/04-planeta.png",
    svgUrl: "/gifts/svg/04-planeta.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-explosion.svg",
    gameEffectLabel: "Gravedad Planetaria en Curvas",
  },
  {
    id: "05-lluvia-meteoritos",
    name: "Lluvia de Meteoritos",
    novas: 50,
    collectionSet: "cosmico",
    collectionLabel: "Set Cósmico",
    frameTier: "explosion",
    frameTierLabel: "Nivel Explosión",
    animationTier: "explosion_nova",
    signatureAnimation: "anim-meteor-rain",
    animationDescription: "Bombardeo diagonal de meteoritos con impacto vibratorio",
    particleSymbols: ["☄️", "💥", "⚡"],
    pngUrl: "/gifts/png-512/05-lluvia-meteoritos.png",
    svgUrl: "/gifts/svg/05-lluvia-meteoritos.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-explosion.svg",
    gameEffectLabel: "Obstáculos de Meteoritos en Pista",
  },
  {
    id: "06-anillo-galactico",
    name: "Anillo Galáctico",
    novas: 75,
    collectionSet: "cosmico",
    collectionLabel: "Set Cósmico",
    frameTier: "explosion",
    frameTierLabel: "Nivel Explosión",
    animationTier: "explosion_nova",
    signatureAnimation: "anim-vortex-spin",
    animationDescription: "Remolino galáctico 360° con espiral de estrellas",
    particleSymbols: ["🌀", "✨", "🌟"],
    pngUrl: "/gifts/png-512/06-anillo-galactico.png",
    svgUrl: "/gifts/svg/06-anillo-galactico.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-explosion.svg",
    gameEffectLabel: "Remolino de Pista Resbaladiza",
  },
  {
    id: "07-supernova",
    name: "Supernova",
    novas: 100,
    collectionSet: "cosmico",
    collectionLabel: "Set Cósmico",
    frameTier: "supernova",
    frameTierLabel: "Nivel Supernova",
    animationTier: "supernova",
    signatureAnimation: "anim-supernova-rays",
    animationDescription: "Estallido estelar de rayos rosa y violeta a pantalla completa",
    particleSymbols: ["💥", "🌟", "✨"],
    pngUrl: "/gifts/png-512/07-supernova.png",
    svgUrl: "/gifts/svg/07-supernova.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-supernova.svg",
    gameEffectLabel: "Onda Supernova + Turbo Total",
  },
  {
    id: "08-agujero-negro",
    name: "Agujero Negro",
    novas: 250,
    collectionSet: "cosmico",
    collectionLabel: "Set Cósmico",
    frameTier: "supernova",
    frameTierLabel: "Nivel Supernova",
    animationTier: "supernova",
    signatureAnimation: "anim-blackhole-gravity",
    animationDescription: "Distorsión gravitacional con disco de acreción dorado giratorio",
    particleSymbols: ["🕳️", "🪐", "⚡"],
    pngUrl: "/gifts/png-512/08-agujero-negro.png",
    svgUrl: "/gifts/svg/08-agujero-negro.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-supernova.svg",
    gameEffectLabel: "Vórtice Gravitacional de Caos",
  },
  {
    id: "09-galaxia",
    name: "Galaxia",
    novas: 250, // UNIFICADO EN 250 NOVAS EN TODO EL SISTEMA
    collectionSet: "cosmico",
    collectionLabel: "Set Cósmico",
    frameTier: "supernova",
    frameTierLabel: "Nivel Supernova",
    animationTier: "supernova",
    signatureAnimation: "anim-galaxy-spiral",
    animationDescription: "Expansión cósmica suprema con rotación galáctica y lluvia de astros",
    particleSymbols: ["🌌", "✨", "👑"],
    pngUrl: "/gifts/png-512/09-galaxia.png",
    svgUrl: "/gifts/svg/09-galaxia.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-supernova.svg",
    gameEffectLabel: "Evento Cósmico Supremo en Toda la Sala",
  },

  // ==========================================================================
  // LÁMINA 2: SET DIVERSIÓN NEÓN (9 Regalos)
  // ==========================================================================
  {
    id: "10-osito-neon",
    name: "Osito Neón",
    novas: 5,
    collectionSet: "diversion",
    collectionLabel: "Diversión Neón",
    frameTier: "estrella",
    frameTierLabel: "Nivel Estrella",
    animationTier: "estrella_fugaz",
    signatureAnimation: "anim-teddy-bounce",
    animationDescription: "Salto tierno con destellos de moño rosa y corazones neón",
    particleSymbols: ["🧸", "🎀", "💖"],
    pngUrl: "/gifts/png-512/10-osito-neon.png",
    svgUrl: "/gifts/svg/10-osito-neon.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-estrella.svg",
    gameEffectLabel: "Saludo Amigable en Pantalla",
  },
  {
    id: "11-balon-futbol",
    name: "Balón de Fútbol",
    novas: 10,
    collectionSet: "diversion",
    collectionLabel: "Diversión Neón",
    frameTier: "estrella",
    frameTierLabel: "Nivel Estrella",
    animationTier: "estrella_fugaz",
    signatureAnimation: "anim-soccer-goal",
    animationDescription: "Disparo al ángulo con giro rápido y grito de ¡GOL NEÓN!",
    particleSymbols: ["⚽", "🥅", "⚡"],
    pngUrl: "/gifts/png-512/11-balon-futbol.png",
    svgUrl: "/gifts/svg/11-balon-futbol.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-estrella.svg",
    gameEffectLabel: "Curva de Efecto en Penales / Pista",
  },
  {
    id: "12-rosa-neon",
    name: "Rosa Neón",
    novas: 15,
    collectionSet: "diversion",
    collectionLabel: "Diversión Neón",
    frameTier: "estrella",
    frameTierLabel: "Nivel Estrella",
    animationTier: "estrella_fugaz",
    signatureAnimation: "anim-rose-bloom",
    animationDescription: "Florecimiento luminoso con lluvia de pétalos rosa y cian",
    particleSymbols: ["🌹", "🌸", "✨"],
    pngUrl: "/gifts/png-512/12-rosa-neon.png",
    svgUrl: "/gifts/svg/12-rosa-neon.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-estrella.svg",
    gameEffectLabel: "Estela de Pétalos Neón",
  },
  {
    id: "13-dulce-cosmico",
    name: "Dulce Cósmico",
    novas: 20,
    collectionSet: "diversion",
    collectionLabel: "Diversión Neón",
    frameTier: "estrella",
    frameTierLabel: "Nivel Estrella",
    animationTier: "estrella_fugaz",
    signatureAnimation: "anim-candy-pop",
    animationDescription: "Explosión dulce de azúcar estelar con giro festivo",
    particleSymbols: ["🍬", "🍭", "✨"],
    pngUrl: "/gifts/png-512/13-dulce-cosmico.png",
    svgUrl: "/gifts/svg/13-dulce-cosmico.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-estrella.svg",
    gameEffectLabel: "Recarga Rápida de Azúcar Turbo",
  },
  {
    id: "14-mariposa-neon",
    name: "Mariposa Neón",
    novas: 30,
    collectionSet: "diversion",
    collectionLabel: "Diversión Neón",
    frameTier: "explosion",
    frameTierLabel: "Nivel Explosión",
    animationTier: "explosion_nova",
    signatureAnimation: "anim-butterfly-flutter",
    animationDescription: "Aleteo mágico en zigzag soltando polvo de hadas cian-violeta",
    particleSymbols: ["🦋", "✨", "💜"],
    pngUrl: "/gifts/png-512/14-mariposa-neon.png",
    svgUrl: "/gifts/svg/14-mariposa-neon.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-explosion.svg",
    gameEffectLabel: "Efecto Mariposa en la Partida",
  },
  {
    id: "15-helado-neon",
    name: "Helado Neón",
    novas: 40,
    collectionSet: "diversion",
    collectionLabel: "Diversión Neón",
    frameTier: "explosion",
    frameTierLabel: "Nivel Explosión",
    animationTier: "explosion_nova",
    signatureAnimation: "anim-icecream-frost",
    animationDescription: "Onda helada refrescante con cristales de hielo luminosos",
    particleSymbols: ["🍦", "❄️", "💎"],
    pngUrl: "/gifts/png-512/15-helado-neon.png",
    svgUrl: "/gifts/svg/15-helado-neon.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-explosion.svg",
    gameEffectLabel: "Pista Congelada Resbaladiza",
  },
  {
    id: "16-patito-dorado",
    name: "Patito Dorado",
    novas: 50,
    collectionSet: "diversion",
    collectionLabel: "Diversión Neón",
    frameTier: "explosion",
    frameTierLabel: "Nivel Explosión",
    animationTier: "explosion_nova",
    signatureAnimation: "anim-duck-ripple",
    animationDescription: "Chapuzón dorado sobre olas de neón cian y rosa",
    particleSymbols: ["🦆", "🌊", "⭐"],
    pngUrl: "/gifts/png-512/16-patito-dorado.png",
    svgUrl: "/gifts/svg/16-patito-dorado.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-explosion.svg",
    gameEffectLabel: "Charcos Dorados de Caos en Pista",
  },
  {
    id: "17-gatito-cosmico",
    name: "Gatito Cósmico",
    novas: 75,
    collectionSet: "diversion",
    collectionLabel: "Diversión Neón",
    frameTier: "explosion",
    frameTierLabel: "Nivel Explosión",
    animationTier: "explosion_nova",
    signatureAnimation: "anim-cat-pounce",
    animationDescription: "Salto felino ágil dejando huellas luminosas en la pantalla",
    particleSymbols: ["🐱", "🐾", "💜"],
    pngUrl: "/gifts/png-512/17-gatito-cosmico.png",
    svgUrl: "/gifts/svg/17-gatito-cosmico.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-explosion.svg",
    gameEffectLabel: "Reflejos Felinos / Susto Sorpresa",
  },
  {
    id: "18-unicornio-estelar",
    name: "Unicornio Estelar",
    novas: 120,
    collectionSet: "diversion",
    collectionLabel: "Diversión Neón",
    frameTier: "supernova",
    frameTierLabel: "Nivel Supernova",
    animationTier: "supernova",
    signatureAnimation: "anim-unicorn-rainbow",
    animationDescription: "Galope mágico con puente arcoíris neón a pantalla completa",
    particleSymbols: ["🦄", "🌈", "✨"],
    pngUrl: "/gifts/png-512/18-unicornio-estelar.png",
    svgUrl: "/gifts/svg/18-unicornio-estelar.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-supernova.svg",
    gameEffectLabel: "Pista Arcoíris de Alta Velocidad",
  },

  // ==========================================================================
  // LÁMINA 3: SET LEYENDAS Y ÉPICOS (9 Regalos)
  // ==========================================================================
  {
    id: "22-caja-sorpresa",
    name: "Caja Sorpresa Neón",
    novas: 15,
    collectionSet: "leyendas",
    collectionLabel: "Leyendas y Épicos",
    frameTier: "estrella",
    frameTierLabel: "Nivel Estrella",
    animationTier: "estrella_fugaz",
    signatureAnimation: "anim-giftbox-pop",
    animationDescription: "Vibración misteriosa y apertura explosiva de luces cian-rosa",
    particleSymbols: ["🎁", "🎀", "✨"],
    pngUrl: "/gifts/png-512/22-caja-sorpresa.png",
    svgUrl: "/gifts/svg/22-caja-sorpresa.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-estrella.svg",
    gameEffectLabel: "Ítem Sorpresa Aleatorio en Partida",
  },
  {
    id: "19-diamante-cristal",
    name: "Diamante Cristal",
    novas: 35,
    collectionSet: "leyendas",
    collectionLabel: "Leyendas y Épicos",
    frameTier: "explosion",
    frameTierLabel: "Nivel Explosión",
    animationTier: "explosion_nova",
    signatureAnimation: "anim-diamond-prism",
    animationDescription: "Refracción prismática 3D con destellos de cristal puro",
    particleSymbols: ["💎", "💠", "✨"],
    pngUrl: "/gifts/png-512/19-diamante-cristal.png",
    svgUrl: "/gifts/svg/19-diamante-cristal.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-explosion.svg",
    gameEffectLabel: "Blindaje de Diamante al Corredor",
  },
  {
    id: "23-guitarra-electrica",
    name: "Guitarra Eléctrica",
    novas: 45,
    collectionSet: "leyendas",
    collectionLabel: "Leyendas y Épicos",
    frameTier: "explosion",
    frameTierLabel: "Nivel Explosión",
    animationTier: "explosion_nova",
    signatureAnimation: "anim-guitar-sonic",
    animationDescription: "Riff eléctrico con ondas sónicas y relámpagos neón",
    particleSymbols: ["🎸", "⚡", "🎵"],
    pngUrl: "/gifts/png-512/23-guitarra-electrica.png",
    svgUrl: "/gifts/svg/23-guitarra-electrica.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-explosion.svg",
    gameEffectLabel: "Onda Sónica que Empuja Rivales",
  },
  {
    id: "20-corona-real",
    name: "Corona Real",
    novas: 60,
    collectionSet: "leyendas",
    collectionLabel: "Leyendas y Épicos",
    frameTier: "explosion",
    frameTierLabel: "Nivel Explosión",
    animationTier: "explosion_nova",
    signatureAnimation: "anim-crown-descend",
    animationDescription: "Descenso imperial dorado coronando el nombre del donador",
    particleSymbols: ["👑", "✨", "💜"],
    pngUrl: "/gifts/png-512/20-corona-real.png",
    svgUrl: "/gifts/svg/20-corona-real.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-explosion.svg",
    gameEffectLabel: "Corona de Líder en la Carrera",
  },
  {
    id: "21-trofeo-campeon",
    name: "Trofeo Campeón",
    novas: 90,
    collectionSet: "leyendas",
    collectionLabel: "Leyendas y Épicos",
    frameTier: "explosion",
    frameTierLabel: "Nivel Explosión",
    animationTier: "explosion_nova",
    signatureAnimation: "anim-trophy-champion",
    animationDescription: "Alzada de copa dorada con lluvia de confeti de campeón",
    particleSymbols: ["🏆", "🥇", "🌟"],
    pngUrl: "/gifts/png-512/21-trofeo-campeon.png",
    svgUrl: "/gifts/svg/21-trofeo-campeon.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-explosion.svg",
    gameEffectLabel: "Bonificación de Victoria en Sala",
  },
  {
    id: "24-leon-cosmico",
    name: "León Cósmico",
    novas: 150,
    collectionSet: "leyendas",
    collectionLabel: "Leyendas y Épicos",
    frameTier: "supernova",
    frameTierLabel: "Nivel Supernova",
    animationTier: "supernova",
    signatureAnimation: "anim-lion-roar",
    animationDescription: "Rugido sísmico con melena de fuego cian-violeta que sacude el en vivo",
    particleSymbols: ["🦁", "⚡", "🔥"],
    pngUrl: "/gifts/png-512/24-leon-cosmico.png",
    svgUrl: "/gifts/svg/24-leon-cosmico.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-supernova.svg",
    gameEffectLabel: "Rugido del León: Estremece Toda la Pista",
  },
  {
    id: "25-dragon-neon",
    name: "Dragón Neón",
    novas: 250,
    collectionSet: "leyendas",
    collectionLabel: "Leyendas y Épicos",
    frameTier: "supernova",
    frameTierLabel: "Nivel Supernova",
    animationTier: "supernova",
    signatureAnimation: "anim-dragon-flame",
    animationDescription: "Vuelo rasante de dragón lanzando aliento de plasma cian y magenta",
    particleSymbols: ["🐉", "🔥", "⚡"],
    pngUrl: "/gifts/png-512/25-dragon-neon.png",
    svgUrl: "/gifts/svg/25-dragon-neon.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-supernova.svg",
    gameEffectLabel: "Vuelo del Dragón sobre la Partida",
  },
  {
    id: "26-castillo-cristal",
    name: "Castillo de Cristal",
    novas: 350,
    collectionSet: "leyendas",
    collectionLabel: "Leyendas y Épicos",
    frameTier: "supernova",
    frameTierLabel: "Nivel Supernova",
    animationTier: "supernova",
    signatureAnimation: "anim-castle-aurora",
    animationDescription: "Ascenso majestuoso del castillo de cristal con auroras boreales",
    particleSymbols: ["🏰", "💎", "🌌"],
    pngUrl: "/gifts/png-512/26-castillo-cristal.png",
    svgUrl: "/gifts/svg/26-castillo-cristal.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-supernova.svg",
    gameEffectLabel: "Fortaleza de Cristal en toda la Sala",
  },
  {
    id: "27-ave-fenix",
    name: "Ave Fénix Imperial",
    novas: 500,
    collectionSet: "leyendas",
    collectionLabel: "Leyendas y Épicos",
    frameTier: "supernova",
    frameTierLabel: "Nivel Supernova",
    animationTier: "supernova",
    signatureAnimation: "anim-phoenix-rise",
    animationDescription: "Ascenso inmortal con alas desplegadas en fuego dorado y rosa a pantalla completa",
    particleSymbols: ["🦅", "🔥", "👑"],
    pngUrl: "/gifts/png-512/27-ave-fenix.png",
    svgUrl: "/gifts/svg/27-ave-fenix.svg",
    frameSvgUrl: "/gifts/marcos/marco-nivel-supernova.svg",
    gameEffectLabel: "Renacimiento Fénix: Caos y Velocidad Máxima",
  },
];

/**
 * LOS CINCO PAQUETES OFICIALES DEL MONEDERO NOVA:
 * 1) 500 Novas / $4.99
 * 2) 1,050 Novas / $9.99
 * 3) 2,200 Novas / $19.99
 * 4) 5,750 Novas / $49.99
 * 5) 12,000 Novas / $99.99
 */
export const NOVA_PACKAGES: NovaPackage[] = [
  {
    id: "pkg-500",
    name: "Órbita",
    novas: 500,
    bonusNovas: 0,
    priceUsd: 4.99,
    glowVariant: "cyan",
    description: "500 Novas para activar Estrellas Fugaces, Corazón Nova, Cohetes y eventos rápidos.",
  },
  {
    id: "pkg-1050",
    name: "Nova",
    novas: 1050,
    bonusNovas: 0,
    priceUsd: 9.99,
    badge: "POPULAR",
    glowVariant: "violet",
    description: "1,050 Novas para desatar Explosiones Nova y dominar los eventos en vivo.",
  },
  {
    id: "pkg-2200",
    name: "Estelar",
    novas: 2200,
    bonusNovas: 0,
    priceUsd: 19.99,
    badge: "MEJOR VALOR",
    glowVariant: "cyan",
    description: "2,200 Novas para lanzar Supernovas, Galaxias y alterar partidas completas.",
  },
  {
    id: "pkg-5750",
    name: "Supernova",
    novas: 5750,
    bonusNovas: 0,
    priceUsd: 49.99,
    badge: "GRAN BRILLO",
    glowVariant: "magenta",
    description: "5,750 Novas para iluminar salas enteras con Galaxias, Dragones y Castillos.",
  },
  {
    id: "pkg-12000",
    name: "Galaxia Nova",
    novas: 12000,
    bonusNovas: 0,
    priceUsd: 99.99,
    badge: "MÁXIMO NIVEL",
    glowVariant: "gold",
    description: "12,000 Novas: el paquete supremo para leyendas de la comunidad NOVA.",
  },
];
