"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Shield,
  Zap,
  RotateCcw,
  ArrowLeft,
  Volume2,
  Users,
  Trophy,
  Crosshair,
  AlertTriangle,
  Sparkles,
  Heart,
  Skull,
  Radio,
} from "lucide-react";
import { type ActiveLiveSession, type DefenseAsteroid } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import {
  DEFENSE_COLORS,
  DEFENSE_MIN_PLAYERS,
  DEFENSE_MAX_PLAYERS,
  ZONE_MIN,
  ZONE_MAX,
  SHIP_R,
  DEFENDER_R,
  sectorCenterAngle,
  sectorBoundaryAngle,
  asteroidProgress,
  radiusAtProgress,
  polarToPercent,
  asteroidAngle,
  isInZone,
} from "@/lib/games/defendShipEngine";

interface LiveDefenseArenaProps {
  session: ActiveLiveSession;
}

export function LiveDefenseArena({ session }: LiveDefenseArenaProps) {
  const {
    currentUser,
    isHostWindow,
    windowInstanceId,
    openDefenseLobby,
    joinDefenseGame,
    startDefenseMatch,
    sendDefenseShot,
    defenseRematchAction,
    closeDefenseToRoom,
    getMyDefenseSeat,
  } = useApp();

  const g = session.activeDefense;

  // Reloj de animación local para derivar la posición suave de los asteroides
  const [animNow, setAnimNow] = useState<number>(() => Date.now());
  const [supportMode, setSupportMode] = useState<boolean>(false);
  const [missEffect, setMissEffect] = useState<{ x: number; y: number; id: number } | null>(null);

  useEffect(() => {
    if (!g || (g.status !== "wave" && g.status !== "between")) return;
    let animId: number;
    const loop = () => {
      setAnimNow(Date.now());
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [g?.status, g?.waveStartMs]);

  // Restablecer el modo apoyo al cambiar de oleada
  useEffect(() => {
    setSupportMode(false);
  }, [g?.wave, g?.status]);

  if (!g) {
    if (session.activeRace || session.activeImpostor) return null;
    return (
      <section className="glass-card-cyan rounded-3xl p-4 sm:p-5 border-2 border-neon-cyan/70 shadow-neon-cyan space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-cyan bg-neon-cyan/20 px-3 py-0.5 text-xs font-black text-neon-cyan">
                <Shield className="h-3.5 w-3.5" />
                <span>PASO 6.8 • JUEGO COOPERATIVO DE LA SALA</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-neon-emerald/60 bg-neon-emerald/15 px-2.5 py-0.5 text-[11px] font-black text-neon-emerald">
                <Volume2 className="h-3.5 w-3.5" />
                <span>VOZ EN VIVO ACTIVA</span>
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white text-glow-cyan">
              🛸 DEFIENDE LA NAVE — Cooperativo Multijugador
            </h3>
            <p className="text-xs sm:text-sm text-cyan-100/90">
              {isHostWindow
                ? "Como Capitán, abre el juego para que la sala defienda la nave madre en equipo contra oleadas de asteroides con sus astronautas en vivo."
                : `Esperando a que @${session.hostUsername} abra DEFIENDE LA NAVE para unirte con un toque.`}
            </p>
          </div>

          {isHostWindow ? (
            <button
              type="button"
              onClick={openDefenseLobby}
              className="btn-neon-gradient rounded-2xl px-5 py-3.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2 shrink-0 shadow-neon-cyan cursor-pointer"
            >
              <Shield className="h-4 w-4" />
              <span>🛸 Jugar: DEFIENDE LA NAVE</span>
            </button>
          ) : (
            <div className="rounded-2xl border border-neon-cyan/40 bg-space-950/90 px-4 py-3 text-xs font-black text-cyan-200 shrink-0 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-neon-cyan animate-soft-pulse" />
              <span>Listo para defender cuando el capitán inicie</span>
            </div>
          )}
        </div>
      </section>
    );
  }

  const mySeat = getMyDefenseSeat();
  const isPlayer = Boolean(mySeat);
  const mySector = mySeat?.sector ?? -1;
  const numSectors = Math.max(1, g.players.length);
  const myScore = mySeat ? g.scores[mySeat.id] : undefined;
  const supportAlreadyUsed = mySeat ? g.supportUsedWave[mySeat.id] === g.wave : false;

  const isRecentImpact = Boolean(
    g.lastImpact && animNow - g.lastImpact.atMs < 900
  );

  const handleShoot = (ast: DefenseAsteroid, inZone: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!mySeat || g.status !== "wave") return;

    const isOwnSector = ast.sector === mySector;
    const isEnemy = ast.kind === "enemy";
    const wantsSupport = supportMode && !isOwnSector && !isEnemy;

    if (!isOwnSector && !isEnemy && !wantsSupport) {
      // Disparo no permitido en sector ajeno sin apoyo
      return;
    }

    if (!inZone) {
      // Efecto visual de fallo
      const rect = e.currentTarget.getBoundingClientRect();
      setMissEffect({ x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() });
      setTimeout(() => setMissEffect(null), 600);
    }

    sendDefenseShot({
      gameId: g.gameId,
      playerId: mySeat.id,
      asteroidId: ast.id,
      support: wantsSupport,
      inZone,
    });

    if (wantsSupport) {
      setSupportMode(false);
    }
  };

  // Cálculo del podio para pantalla de Game Over
  const allScores = g.players.map((p) => ({
    player: p,
    score: g.scores[p.id] || { destroyed: 0, supports: 0, shots: 0, hits: 0 },
  }));
  const mvp = [...allScores].sort((a, b) => b.score.destroyed - a.score.destroyed)[0];
  const bestSupport = [...allScores].sort((a, b) => b.score.supports - a.score.supports)[0];

  return (
    <section className="glass-card-cyan rounded-3xl p-4 sm:p-6 border-2 border-neon-cyan shadow-neon-cyan-lg space-y-4">
      {/* =====================================================================
          CABECERA DEL JUEGO COOPERATIVO
          ===================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neon-cyan/30 pb-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-cyan px-3 py-0.5 text-xs font-black uppercase text-slate-950 shadow-neon-cyan">
              <Shield className="h-3.5 w-3.5" />
              <span>DEFIENDE LA NAVE • {g.status === "lobby" ? "SALA DE ESPERA" : `OLEADA ${g.wave}`}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-emerald/70 bg-neon-emerald/15 px-3 py-0.5 text-[11px] font-black text-neon-emerald">
              <Volume2 className="h-3.5 w-3.5" />
              <span>VOZ DE LA SALA ACTIVA</span>
            </span>

            <span className="inline-flex items-center gap-1 rounded-full border border-neon-violet bg-neon-violet/20 px-2.5 py-0.5 text-[11px] font-black text-fuchsia-200">
              <Users className="h-3.5 w-3.5 text-neon-cyan" />
              <span>{g.players.length} Defensores</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white text-glow-cyan">
            {g.status === "lobby" && "🛸 La Nave Madre se prepara para el despegue"}
            {g.status === "wave" && `⚡ ¡OLEADA ${g.wave} EN CURSO! Defiende tu sector`}
            {g.status === "between" && `✨ ¡OLEADA ${g.wave} SUPERADA! Reparando escudos...`}
            {g.status === "over" && `💥 LA NAVE CAYÓ EN LA OLEADA ${g.wave}`}
          </h2>
        </div>

        {/* Botón permanente Volver a la sala */}
        <div className="flex flex-wrap items-center gap-2">
          {isHostWindow && (
            <button
              type="button"
              onClick={closeDefenseToRoom}
              className="rounded-2xl border-2 border-neon-cyan bg-space-950/90 hover:bg-neon-cyan/20 px-4 py-2 text-xs font-black text-white flex items-center gap-1.5 transition shadow-neon-cyan cursor-pointer"
              title="Regresa a la sala sin cerrar el directo"
            >
              <ArrowLeft className="h-4 w-4 text-neon-cyan" />
              <span>Volver a la sala</span>
            </button>
          )}
        </div>
      </div>

      {/* =====================================================================
          BARRA DE ENERGÍA DE LA NAVE MADRE
          ===================================================================== */}
      <div className="space-y-1.5 bg-space-950/80 rounded-2xl p-3 border border-neon-cyan/40">
        <div className="flex items-center justify-between text-xs font-black">
          <span className="text-cyan-100 flex items-center gap-1.5">
            <Zap className={`h-4 w-4 ${g.energy > 40 ? "text-neon-cyan" : "text-rose-400"}`} />
            ENERGÍA DE LA NAVE MADRE
          </span>
          <span
            className={`text-sm font-black tabular-nums ${
              g.energy > 50
                ? "text-neon-emerald"
                : g.energy > 20
                ? "text-amber-300"
                : "text-rose-400 animate-pulse"
            }`}
          >
            {g.energy}%
          </span>
        </div>
        <div className="h-3.5 w-full bg-space-900 rounded-full overflow-hidden p-0.5 border border-neon-cyan/30">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              g.energy > 50
                ? "bg-gradient-to-r from-neon-cyan via-teal-400 to-neon-emerald shadow-neon-cyan"
                : g.energy > 20
                ? "bg-gradient-to-r from-amber-400 to-orange-500"
                : "bg-gradient-to-r from-rose-500 to-red-600"
            }`}
            style={{ width: `${g.energy}%` }}
          />
        </div>
      </div>

      {/* =====================================================================
          ESCENARIO ESPACIAL PRINCIPAL (CANVAS RADIAL DEFENSA)
          ===================================================================== */}
      <div className="relative mx-auto w-full max-w-xl aspect-square rounded-3xl overflow-hidden border-2 border-neon-cyan/60 bg-[#020412] shadow-neon-cyan-lg select-none">
        {/* Fondo espacial con estrellas y cuadrícula de radar */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#0b1633_0%,_#030712_100%)]" />

        {/* Círculos concéntricos de radar */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          {/* Anillo exterior */}
          <circle cx="50%" cy="50%" r="46%" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="4 4" />
          {/* Anillo exterior de la zona de tiro */}
          <circle cx="50%" cy="50%" r={`${ZONE_MAX * 46}%`} fill="none" stroke="#a78bfa" strokeWidth="1.5" />
          {/* Anillo interior de la zona de tiro */}
          <circle cx="50%" cy="50%" r={`${ZONE_MIN * 46}%`} fill="none" stroke="#a78bfa" strokeWidth="1.5" />
          {/* Zona de tiro sombreada */}
          <circle
            cx="50%" cy="50%"
            r={`${((ZONE_MAX + ZONE_MIN) / 2) * 46}%`}
            fill="none"
            stroke="#a78bfa"
            strokeWidth={`${(ZONE_MAX - ZONE_MIN) * 46 * 2}%`}
            opacity="0.08"
          />

          {/* Líneas divisorias de sectores */}
          {Array.from({ length: numSectors }).map((_, k) => {
            const angle = sectorBoundaryAngle(k, numSectors);
            const x2 = 50 + Math.cos(angle) * 46;
            const y2 = 50 + Math.sin(angle) * 46;
            return (
              <line
                key={`bound-${k}`}
                x1="50%"
                y1="50%"
                x2={`${x2}%`}
                y2={`${y2}%`}
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="2 4"
                opacity="0.5"
              />
            );
          })}
        </svg>

        {/* Etiquetas de Sector y Colores */}
        {g.players.map((p, k) => {
          const centerAngle = sectorCenterAngle(k, numSectors);
          const pos = polarToPercent(centerAngle, 0.90);
          const color = DEFENSE_COLORS[p.colorIdx % DEFENSE_COLORS.length];
          const isMySector = k === mySector;

          return (
            <div
              key={`label-${p.id}`}
              className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full border shadow-sm ${
                  isMySector
                    ? "bg-neon-cyan/30 text-white border-neon-cyan font-extrabold"
                    : "bg-space-950/80 text-cyan-200 border-white/20"
                }`}
                style={{ borderColor: color.hex }}
              >
                S{k + 1}
              </span>
            </div>
          );
        })}

        {/* NAVE MADRE AL CENTRO */}
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center transition-transform ${
            isRecentImpact ? "scale-95 animate-gentle-shake" : "hover:scale-105"
          }`}
        >
          <div className="relative flex items-center justify-center">
            {/* Resplandor de energía suave */}
            <div
              className={`absolute -inset-4 rounded-full blur-md opacity-60 transition-colors ${
                isRecentImpact
                  ? "bg-rose-500/80"
                  : g.energy > 40
                  ? "bg-neon-cyan/40"
                  : "bg-amber-400/50"
              }`}
            />
            {/* Núcleo de la Nave Madre */}
            <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full border-2 border-neon-cyan bg-gradient-to-br from-[#0c2340] via-[#09152b] to-[#040914] shadow-neon-cyan flex items-center justify-center text-2xl sm:text-3xl">
              🛸
            </div>
          </div>
          <span className="text-[10px] font-black text-cyan-200 tracking-wider uppercase mt-1 bg-space-950/80 px-2 py-0.2 rounded-full border border-neon-cyan/40">
            Nave Madre
          </span>
        </div>

        {/* ASTRONAUTITAS / DEFENSORES EN SUS SECTORES */}
        {g.players.map((p, k) => {
          const centerAngle = sectorCenterAngle(k, numSectors);
          const pos = polarToPercent(centerAngle, DEFENDER_R);
          const color = DEFENSE_COLORS[p.colorIdx % DEFENSE_COLORS.length];
          const isMe = p.id === currentUser.id && p.windowId === windowInstanceId;
          const fx = g.fx[p.id];
          const isFxActive = fx && animNow - fx.atMs < 700;

          return (
            <div
              key={`def-${p.id}`}
              className={`absolute z-20 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all ${
                isFxActive && fx?.type === "shoot" ? "scale-125" : ""
              } ${isFxActive && fx?.type === "hit" ? "animate-pulse" : ""}`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              {/* Personaje Astronautita */}
              <div
                className={`relative flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full border-2 shadow-md transition-transform ${
                  isMe ? "ring-2 ring-white scale-110" : ""
                }`}
                style={{
                  backgroundColor: `${color.hex}25`,
                  borderColor: color.hex,
                }}
              >
                <span className="text-sm sm:text-base select-none">
                  {isFxActive && fx?.type === "hit"
                    ? "💥"
                    : isFxActive && fx?.type === "support"
                    ? "🆘"
                    : p.avatarUrl || "🧑‍🚀"}
                </span>

                {/* Arma/Torreta apuntando al sector */}
                <div
                  className="absolute h-1.5 w-3 rounded-full bg-white shadow-sm"
                  style={{
                    transform: `rotate(${centerAngle}rad) translate(14px)`,
                  }}
                />
              </div>

              {/* Nombre e indicador */}
              <span
                className="mt-1 text-[9px] font-black text-white px-1.5 py-0.2 rounded-md bg-space-950/90 border border-white/20 whitespace-nowrap max-w-[68px] truncate"
                style={{ borderColor: color.hex }}
              >
                {isMe ? "TÚ" : p.displayName}
              </span>
            </div>
          );
        })}

        {/* ASTEROIDES EN VIVO (SINCRONIZADOS POR TIEMPO) */}
        {g.status === "wave" &&
          g.asteroids.map((ast) => {
            const res = g.resolved[ast.id];
            const p = asteroidProgress(ast, g.waveStartMs, animNow);

            // Si ya impactó o aún no aparece, no renderizar
            if (p < 0 || (res?.result === "impact" && animNow - res.atMs > 600)) {
              return null;
            }

            const currentR = radiusAtProgress(p);
            const inZone = isInZone(currentR);
            const angle = asteroidAngle(ast, numSectors);
            const pos = polarToPercent(angle, currentR);

            // Explosión de destrucción
            if (res?.result === "destroyed") {
              const destroyedAgo = animNow - res.atMs;
              if (destroyedAgo > 700) return null;
              return (
                <div
                  key={`boom-${ast.id}`}
                  className="absolute z-30 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-ping text-xl"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  💥
                </div>
              );
            }

            const isOwnSector = ast.sector === mySector;
            const isEnemy = ast.kind === "enemy";
            const canTarget = isPlayer && (isOwnSector || isEnemy || supportMode);

            return (
              <div
                key={`ast-${ast.id}`}
                onClick={(e) => canTarget && handleShoot(ast, inZone, e)}
                className={`absolute z-25 transform -translate-x-1/2 -translate-y-1/2 transition-transform ${
                  canTarget ? "cursor-crosshair active:scale-90" : "cursor-default"
                }`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                {/* Visual según el tipo de amenaza */}
                {ast.kind === "golden" ? (
                  <div
                    className={`relative flex items-center justify-center h-8 w-8 rounded-full border-2 border-amber-300 bg-amber-400/30 text-amber-200 text-sm font-black shadow-lg shadow-amber-400/50 ${
                      inZone ? "ring-4 ring-amber-300 animate-pulse scale-110" : ""
                    }`}
                  >
                    ✨
                  </div>
                ) : ast.kind === "enemy" ? (
                  <div
                    className={`relative flex flex-col items-center justify-center h-11 w-11 rounded-2xl border-2 border-rose-500 bg-rose-950/80 text-rose-300 text-lg shadow-lg shadow-rose-600/50 ${
                      inZone ? "ring-4 ring-rose-400 animate-pulse scale-110" : ""
                    }`}
                  >
                    <span>👾</span>
                    {/* Barra de vida de la nave enemiga */}
                    <div className="absolute -bottom-2 w-9 h-1.5 bg-black rounded-full overflow-hidden border border-rose-400">
                      <div
                        className="h-full bg-rose-500"
                        style={{
                          width: `${Math.max(
                            0,
                            ((ast.hp - (g.hits[ast.id] || 0)) / ast.hp) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    className={`relative flex items-center justify-center h-7 w-7 rounded-full border-2 border-cyan-400 bg-cyan-950/70 text-cyan-200 text-xs shadow-md ${
                      inZone
                        ? "border-neon-emerald ring-2 ring-neon-emerald scale-110 shadow-neon-emerald"
                        : "border-slate-500 opacity-90"
                    }`}
                  >
                    🪨
                  </div>
                )}
              </div>
            );
          })}

        {/* Efecto de tiro fallido (fuera de zona) */}
        {missEffect && (
          <div
            className="absolute z-40 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-rose-400 text-xs font-black animate-fade-out"
            style={{ left: missEffect.x, top: missEffect.y }}
          >
            ❌ ¡FUERA DE ZONA!
          </div>
        )}

        {/* ANUNCIOS EN PANTALLA GRANDE DENTRO DEL RADAR */}
        {g.announcement && animNow < g.announcement.untilMs && (
          <div className="absolute inset-x-4 top-1/3 -translate-y-1/2 z-40 flex items-center justify-center pointer-events-none">
            <div className="rounded-2xl border-2 border-neon-cyan bg-space-950/95 px-5 py-3 text-center shadow-neon-cyan-lg animate-soft-pulse">
              <h3 className="text-lg sm:text-2xl font-black text-white text-glow-cyan">
                {g.announcement.text}
              </h3>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          CONTROLES DE TIRO Y MODO APOYO PARA CADA DEFENSOR
          ===================================================================== */}
      {isPlayer && g.status === "wave" && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-space-950/80 rounded-2xl p-3 sm:p-4 border border-neon-violet/50 shadow-neon-violet">
          <div className="space-y-0.5 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-xs font-black text-cyan-200 uppercase">
                🛡️ Defendiendo Sector {mySector + 1}
              </span>
              <span className="text-[11px] font-bold text-cyan-100/70">
                (Toca asteroides dentro del anillo marcado)
              </span>
            </div>
            {supportMode ? (
              <p className="text-xs font-black text-fuchsia-300 animate-pulse">
                🆘 MODO APOYO ACTIVO: Toca un asteroide del sector de tu compañero cuando esté en la zona
              </p>
            ) : (
              <p className="text-[11px] text-cyan-100/80">
                Destruye asteroides en tu sector o activa ¡Apoyo! para salvar a un aliado
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={supportAlreadyUsed}
              onClick={() => setSupportMode((prev) => !prev)}
              className={`rounded-2xl px-4 py-2.5 text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                supportMode
                  ? "border-2 border-fuchsia-400 bg-fuchsia-600 text-white shadow-neon-magenta animate-soft-pulse"
                  : supportAlreadyUsed
                  ? "border border-white/10 bg-space-900/60 text-white/40 cursor-not-allowed"
                  : "border-2 border-neon-violet bg-neon-violet/20 text-white hover:bg-neon-violet/40 shadow-neon-violet"
              }`}
            >
              <Heart className="h-4 w-4 text-fuchsia-300" />
              <span>
                {supportAlreadyUsed
                  ? "🆘 Apoyo Usado en esta oleada"
                  : supportMode
                  ? "❌ Cancelar Apoyo"
                  : "🆘 ¡Dar Apoyo! (1/oleada)"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          FASE: LOBBY DE INSCRIPCIÓN (2 a 8 Defensores)
          ===================================================================== */}
      {g.status === "lobby" && (
        <div className="rounded-2xl border border-neon-cyan/50 bg-space-950/90 p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h4 className="text-sm font-black text-white">
                Defensores alistados en la nave ({g.players.length}/{DEFENSE_MAX_PLAYERS})
              </h4>
              <p className="text-xs text-cyan-200">
                Mínimo {DEFENSE_MIN_PLAYERS} defensores para iniciar la primera oleada.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!isPlayer && (
                <button
                  type="button"
                  onClick={joinDefenseGame}
                  className="btn-neon-gradient rounded-xl px-5 py-2.5 text-xs font-black flex items-center gap-1.5 shadow-neon-cyan cursor-pointer"
                >
                  <Users className="h-4 w-4" />
                  <span>🛸 Unirme a la Tripulación (1 toque)</span>
                </button>
              )}

              {isHostWindow && (
                <button
                  type="button"
                  disabled={g.players.length < DEFENSE_MIN_PLAYERS}
                  onClick={startDefenseMatch}
                  className="rounded-xl border-2 border-neon-cyan bg-neon-cyan/20 hover:bg-neon-cyan/40 px-5 py-2.5 text-xs font-black text-white transition shadow-neon-cyan cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Crosshair className="h-4 w-4 text-neon-cyan inline mr-1" />
                  <span>Iniciar Oleada 1</span>
                </button>
              )}
            </div>
          </div>

          {/* Fichas de defensores con su color de sector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {g.players.map((p, k) => {
              const color = DEFENSE_COLORS[p.colorIdx % DEFENSE_COLORS.length];
              return (
                <div
                  key={`lobby-${p.id}`}
                  className="rounded-xl border px-3 py-2 text-xs font-black flex items-center gap-2 bg-space-900/80"
                  style={{ borderColor: color.hex }}
                >
                  <span>{p.avatarUrl || "🧑‍🚀"}</span>
                  <span className="truncate text-white">{p.displayName}</span>
                  <span className="ml-auto text-[10px] text-cyan-200">Sec {k + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          FASE: ENTRE OLEADAS (5 segundos de respiro / Nuevos defensores)
          ===================================================================== */}
      {g.status === "between" && (
        <div className="rounded-2xl border-2 border-neon-emerald/60 bg-gradient-to-r from-[#04271f]/95 via-[#071f36]/95 to-[#0a0624]/95 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <h4 className="text-sm font-black text-neon-emerald flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              <span>¡Oleada {g.wave} Superada con éxito!</span>
            </h4>
            <p className="text-xs text-cyan-100">
              Siguiente oleada en breve. Quien no esté jugando puede unirse con 1 toque.
            </p>
          </div>

          {!isPlayer && g.players.length < DEFENSE_MAX_PLAYERS && (
            <button
              type="button"
              onClick={joinDefenseGame}
              className="btn-neon-gradient rounded-xl px-4 py-2 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-neon-cyan"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Unirme para la siguiente oleada</span>
            </button>
          )}
        </div>
      )}

      {/* =====================================================================
          FASE: GAME OVER / PODIO DE LA TRIPULACIÓN
          ===================================================================== */}
      {g.status === "over" && (
        <div className="rounded-3xl border-4 border-rose-500/80 bg-gradient-to-br from-[#2a0614]/95 via-[#1a082b]/95 to-[#061428]/95 p-5 sm:p-6 space-y-4 shadow-lg text-center">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400 bg-rose-500/20 px-3 py-0.5 text-xs font-black text-rose-300">
              <Skull className="h-3.5 w-3.5" />
              <span>FIN DE LA MISIÓN COOPERATIVA</span>
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white text-glow-cyan">
              💥 La Nave Madre cayó en la Oleada {g.wave}
            </h3>
            <p className="text-xs sm:text-sm text-cyan-200">
              Sobrevivieron {g.wavesSurvived} oleada(s) completa(s) y destruyeron {g.enemiesDestroyed} nave(s) enemiga(s).
            </p>
          </div>

          {/* Podio de la tripulación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left">
            {mvp && (
              <div className="rounded-2xl border-2 border-amber-300 bg-space-950/80 p-3 space-y-1">
                <span className="text-[11px] font-black text-amber-300 flex items-center gap-1">
                  <Trophy className="h-3.5 w-3.5" /> MVP DE LA SALA (Más Destrucciones)
                </span>
                <p className="text-sm font-black text-white">
                  {mvp.player.avatarUrl} {mvp.player.displayName}
                </p>
                <p className="text-xs text-amber-100">
                  {mvp.score.destroyed} asteroides destruidos
                </p>
              </div>
            )}

            {bestSupport && (
              <div className="rounded-2xl border-2 border-fuchsia-400 bg-space-950/80 p-3 space-y-1">
                <span className="text-[11px] font-black text-fuchsia-300 flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" /> MEJOR APOYO (Más Vidas Salvadas)
                </span>
                <p className="text-sm font-black text-white">
                  {bestSupport.player.avatarUrl} {bestSupport.player.displayName}
                </p>
                <p className="text-xs text-fuchsia-100">
                  {bestSupport.score.supports} apoyos dados a compañeros
                </p>
              </div>
            )}
          </div>

          {/* Botones de acción final */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {isHostWindow && (
              <button
                type="button"
                onClick={defenseRematchAction}
                className="btn-neon-gradient rounded-2xl px-6 py-3 text-xs sm:text-sm font-black flex items-center gap-2 shadow-neon-cyan cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>⚔️ ¡Revancha! (Nueva Partida)</span>
              </button>
            )}

            <button
              type="button"
              onClick={closeDefenseToRoom}
              className="rounded-2xl border-2 border-neon-cyan bg-space-950 px-5 py-3 text-xs sm:text-sm font-black text-white flex items-center gap-2 transition hover:bg-neon-cyan/20 cursor-pointer shadow-neon-cyan"
            >
              <ArrowLeft className="h-4 w-4 text-neon-cyan" />
              <span>Volver a la sala</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          MARCADOR PERSONAL VISIBLE PARA EL DEFENSOR
          ===================================================================== */}
      {isPlayer && myScore && (
        <div className="rounded-2xl border border-neon-cyan/30 bg-space-950/70 p-3 flex flex-wrap items-center justify-between gap-2 text-xs font-black text-cyan-200">
          <div className="flex items-center gap-2">
            <span>🎯 Tu Rendimiento:</span>
            <span className="text-white">💥 {myScore.destroyed} destruidos</span>
            <span className="text-fuchsia-300">🆘 {myScore.supports} apoyos</span>
          </div>
          <div>
            <span>Precisión: </span>
            <span className="text-neon-emerald">
              {myScore.shots > 0 ? Math.round((myScore.hits / myScore.shots) * 100) : 100}%
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
