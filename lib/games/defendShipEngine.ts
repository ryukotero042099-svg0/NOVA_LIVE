// Motor de DEFIENDE LA NAVE (Paso 6.8).
// Las posiciones de los asteroides NO se transmiten: cada ventana las calcula a partir de
// waveStartMs + spawnT + travelMs, por eso todas ven los mismos asteroides en el mismo lugar.
// Solo la ventana del anfitrión aplica los reductores (join, disparos, tick) y publica el estado.

import {
  type DefenseAsteroid,
  type DefensePlayer,
  type LiveDefenseState,
  type DefenseScore,
} from "@/lib/types";

export const DEFENSE_MIN_PLAYERS = 2;
export const DEFENSE_MAX_PLAYERS = 8;
export const ZONE_MIN = 0.36; // radio normalizado interior de la zona de tiro
export const ZONE_MAX = 0.64; // radio normalizado exterior de la zona de tiro
export const ZONE_SLACK = 0.06; // tolerancia del anfitrión por latencia
export const SHIP_R = 0.13;
export const DEFENDER_R = 0.27;
export const WAVE_LEAD_MS = 2500;
export const BETWEEN_MS = 5000;

export const DEFENSE_COLORS = [
  { name: "Cian", hex: "#22d3ee" },
  { name: "Violeta", hex: "#a78bfa" },
  { name: "Magenta", hex: "#f472b6" },
  { name: "Esmeralda", hex: "#34d399" },
  { name: "Dorado", hex: "#fbbf24" },
  { name: "Naranja", hex: "#fb923c" },
  { name: "Azul", hex: "#60a5fa" },
  { name: "Lima", hex: "#a3e635" },
];

export function sectorCenterAngle(k: number, sectors: number): number {
  return -Math.PI / 2 + ((k + 0.5) * 2 * Math.PI) / Math.max(1, sectors);
}

export function sectorBoundaryAngle(k: number, sectors: number): number {
  return -Math.PI / 2 + (k * 2 * Math.PI) / Math.max(1, sectors);
}

export function asteroidProgress(
  ast: DefenseAsteroid,
  waveStartMs: number,
  now: number
): number {
  return (now - waveStartMs - ast.spawnT) / ast.travelMs;
}

export function radiusAtProgress(p: number): number {
  return 1 - Math.min(1, Math.max(0, p)) * (1 - SHIP_R);
}

// Posición en % (0..100) dentro del contenedor cuadrado
export function polarToPercent(angle: number, r: number) {
  return { x: 50 + Math.cos(angle) * r * 46, y: 50 + Math.sin(angle) * r * 46 };
}

export function asteroidAngle(ast: DefenseAsteroid, sectors: number): number {
  return (
    sectorCenterAngle(ast.sector, sectors) +
    ast.off * ((2 * Math.PI) / Math.max(1, sectors))
  );
}

export function isInZone(r: number, slack = 0): boolean {
  return r >= ZONE_MIN - slack && r <= ZONE_MAX + slack;
}

function rnd(n: number) {
  return Math.floor(Math.random() * n);
}

export function generateWave(
  wave: number,
  sectors: number
): DefenseAsteroid[] {
  const count = 4 + wave * 2;
  const travel = Math.max(3000, 6200 - wave * 380);
  const gap = Math.max(520, 1700 - wave * 110);
  const list: DefenseAsteroid[] = [];
  let t = WAVE_LEAD_MS;
  for (let i = 0; i < count; i++) {
    list.push({
      id: `w${wave}-a${i}`,
      sector: rnd(sectors),
      off: (Math.random() - 0.5) * 0.5,
      spawnT: t + Math.floor(Math.random() * gap * 0.4),
      travelMs: Math.round(travel * (0.9 + Math.random() * 0.2)),
      kind: "normal",
      hp: 1,
    });
    t += gap;
  }
  // Asteroide dorado: raro y rápido
  if (Math.random() < 0.6 && list.length > 2) {
    const idx = 1 + rnd(list.length - 1);
    list[idx] = {
      ...list[idx],
      kind: "golden",
      travelMs: Math.round(travel * 0.55),
    };
  }
  // Nave enemiga desde la oleada 3: aguanta 3 impactos de cualquier sector
  if (wave >= 3) {
    list.push({
      id: `w${wave}-enemy`,
      sector: rnd(sectors),
      off: 0,
      spawnT: WAVE_LEAD_MS + gap * Math.floor(count / 2),
      travelMs: Math.round(travel * 1.5 + 1500),
      kind: "enemy",
      hp: 3,
    });
  }
  return list;
}

const emptyScore = (): DefenseScore => ({
  destroyed: 0,
  supports: 0,
  shots: 0,
  hits: 0,
});

export function createDefenseLobby(
  host: Omit<DefensePlayer, "colorIdx" | "sector">
): LiveDefenseState {
  return {
    gameId: `def-${Date.now()}`,
    rev: 0,
    status: "lobby",
    players: [{ ...host, colorIdx: 0, sector: 0 }],
    wave: 0,
    waveStartMs: 0,
    asteroids: [],
    resolved: {},
    hits: {},
    hitAt: {},
    energy: 100,
    scores: {},
    supportUsedWave: {},
    fx: {},
    wavesSurvived: 0,
    enemiesDestroyed: 0,
  };
}

export function addDefensePlayer(
  s: LiveDefenseState,
  seat: Omit<DefensePlayer, "colorIdx" | "sector">
): LiveDefenseState {
  if (s.status !== "lobby" && s.status !== "between") return s;
  if (s.players.length >= DEFENSE_MAX_PLAYERS) return s;
  if (s.players.some((p) => p.id === seat.id)) return s;
  const players = [
    ...s.players,
    { ...seat, colorIdx: s.players.length, sector: s.players.length },
  ];
  return { ...s, players };
}

export function startDefenseWave(
  s: LiveDefenseState,
  wave: number,
  now: number
): LiveDefenseState {
  return {
    ...s,
    status: "wave",
    wave,
    waveStartMs: now,
    asteroids: generateWave(wave, s.players.length),
    resolved: {},
    hits: {},
    hitAt: {},
    betweenEndsAtMs: undefined,
    announcement: { text: `🛸 OLEADA ${wave}`, untilMs: now + WAVE_LEAD_MS },
  };
}

export function startDefenseGame(
  s: LiveDefenseState,
  now: number
): LiveDefenseState {
  if (s.status !== "lobby" || s.players.length < DEFENSE_MIN_PLAYERS) return s;
  return startDefenseWave(s, 1, now);
}

export function rematchDefense(
  s: LiveDefenseState,
  now: number
): LiveDefenseState {
  return startDefenseWave(
    {
      ...s,
      energy: 100,
      scores: {},
      supportUsedWave: {},
      fx: {},
      lastImpact: undefined,
      lastGoldenAtMs: undefined,
      wavesSurvived: 0,
      enemiesDestroyed: 0,
    },
    1,
    now
  );
}

// Avanza el tiempo: impactos a la nave, fin de oleada, siguiente oleada. Devuelve el mismo objeto si nada cambió.
export function tickDefense(s: LiveDefenseState, now: number): LiveDefenseState {
  if (s.status === "between") {
    if (s.betweenEndsAtMs && now >= s.betweenEndsAtMs) {
      return startDefenseWave(s, s.wave + 1, now);
    }
    return s;
  }
  if (s.status !== "wave") return s;

  let changed = false;
  let energy = s.energy;
  const resolved = { ...s.resolved };
  const fx = { ...s.fx };
  let lastImpact = s.lastImpact;

  for (const ast of s.asteroids) {
    if (resolved[ast.id]) continue;
    if (asteroidProgress(ast, s.waveStartMs, now) >= 1) {
      const damage = ast.kind === "enemy" ? 25 : 10;
      energy = Math.max(0, energy - damage);
      resolved[ast.id] = { result: "impact", atMs: now };
      lastImpact = { sector: ast.sector, atMs: now, damage };
      const defender = s.players.find((p) => p.sector === ast.sector);
      if (defender) fx[defender.id] = { type: "hit", atMs: now };
      changed = true;
    }
  }

  if (!changed && !s.asteroids.every((a) => resolved[a.id])) return s;

  let next: LiveDefenseState = { ...s, energy, resolved, fx, lastImpact };

  if (energy <= 0) {
    return {
      ...next,
      status: "over",
      energy: 0,
      wavesSurvived: s.wave - 1,
      announcement: {
        text: `💥 LA NAVE CAYÓ EN LA OLEADA ${s.wave}`,
        untilMs: now + 3600000,
      },
    };
  }

  if (s.asteroids.every((a) => resolved[a.id])) {
    next = {
      ...next,
      status: "between",
      wavesSurvived: s.wave,
      betweenEndsAtMs: now + BETWEEN_MS,
      announcement: {
        text: `¡OLEADA ${s.wave} SUPERADA!`,
        untilMs: now + BETWEEN_MS - 500,
      },
    };
    return next;
  }
  return changed ? next : s;
}

export interface DefenseShotInput {
  playerId: string;
  asteroidId: string;
  support: boolean;
  inZone: boolean;
}

export function applyDefenseShot(
  s: LiveDefenseState,
  shot: DefenseShotInput,
  now: number
): LiveDefenseState {
  if (s.status !== "wave") return s;
  const player = s.players.find((p) => p.id === shot.playerId);
  const ast = s.asteroids.find((a) => a.id === shot.asteroidId);
  if (!player || !ast || s.resolved[ast.id]) return s;

  const p = asteroidProgress(ast, s.waveStartMs, now);
  if (p < 0 || p >= 1) return s;
  const hostInZone = isInZone(radiusAtProgress(p), ZONE_SLACK);

  const isEnemy = ast.kind === "enemy";
  const own = ast.sector === player.sector;
  if (!own && !isEnemy && !shot.support) return s; // no es su sector

  const support = shot.support && !own && !isEnemy;
  if (support && s.supportUsedWave[player.id] === s.wave) return s; // sin apoyo disponible

  const score = { ...(s.scores[player.id] || emptyScore()) };
  score.shots += 1;
  const fx = {
    ...s.fx,
    [player.id]: { type: support ? ("support" as const) : ("shoot" as const), atMs: now },
  };

  // Tiro fuera de la zona: falló
  if (!shot.inZone || !hostInZone) {
    return { ...s, scores: { ...s.scores, [player.id]: score }, fx };
  }

  score.hits += 1;
  const hits = { ...s.hits };
  const hitAt = { ...s.hitAt, [ast.id]: now };
  let destroyed = true;
  if (isEnemy) {
    hits[ast.id] = (hits[ast.id] || 0) + 1;
    destroyed = hits[ast.id] >= ast.hp;
  }

  let next: LiveDefenseState = {
    ...s,
    scores: { ...s.scores, [player.id]: score },
    fx,
    hits,
    hitAt,
  };
  if (!destroyed) return next;

  score.destroyed += 1;
  if (support) score.supports += 1;
  next = {
    ...next,
    resolved: {
      ...next.resolved,
      [ast.id]: { result: "destroyed", by: player.id, support, atMs: now },
    },
    supportUsedWave: support
      ? { ...next.supportUsedWave, [player.id]: s.wave }
      : next.supportUsedWave,
  };
  if (ast.kind === "golden") {
    next = {
      ...next,
      energy: Math.min(100, next.energy + 10),
      lastGoldenAtMs: now,
      announcement: { text: "✨ ¡ASTEROIDE DORADO! +10% de energía", untilMs: now + 2000 },
    };
  }
  if (isEnemy) {
    next = {
      ...next,
      enemiesDestroyed: next.enemiesDestroyed + 1,
      announcement: { text: "¡NAVE ENEMIGA DESTRUIDA!", untilMs: now + 2800 },
    };
  }
  return next;
}
