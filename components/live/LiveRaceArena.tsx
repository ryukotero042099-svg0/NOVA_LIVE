"use client";

import React from "react";
import {
  Flag,
  Trophy,
  Zap,
  Play,
  Users,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Volume2,
} from "lucide-react";
import { type ActiveLiveSession, type RaceParticipant } from "@/lib/types";
import { useApp } from "@/context/AppContext";

interface LiveRaceArenaProps {
  session: ActiveLiveSession;
}

export function LiveRaceArena({ session }: LiveRaceArenaProps) {
  const {
    currentUser,
    isHostWindow,
    openLiveRaceLobby,
    joinLiveRace,
    startLiveRaceCountdown,
    boostMyRacer,
    closeLiveRaceToRoom,
  } = useApp();

  const activeRace = session.activeRace;

  // Si aún no se ha abierto el minijuego CARRERAS en esta transmisión,
  // mostramos la barra de lanzamiento integrada en la misma sala en vivo
  if (!activeRace) {
    return (
      <section className="glass-card-cyan rounded-3xl p-4 sm:p-5 border-2 border-neon-cyan/70 shadow-neon-cyan">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-cyan bg-neon-cyan/20 px-3 py-0.5 text-xs font-black text-neon-cyan">
                <Flag className="h-3.5 w-3.5" />
                <span>PASO 6 • MINIJUEGO INTEGRADO EN LA SALA</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-neon-emerald/60 bg-neon-emerald/15 px-2.5 py-0.5 text-[11px] font-black text-neon-emerald">
                <Volume2 className="h-3.5 w-3.5" />
                <span>LA VOZ SIGUE ACTIVA EN CARRERA</span>
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white text-glow-cyan">
              🏁 CARRERAS NOVA — Competencia En Vivo Dentro de La Sala
            </h3>
            <p className="text-xs sm:text-sm text-cyan-100/90">
              {isHostWindow
                ? "Inicia una carrera en vivo sin salir de tu transmisión. Tus espectadores se unen con un toque, ven la cuenta regresiva 3-2-1 y el podio final."
                : `Esperando a que @${session.hostUsername} abra la pista de CARRERAS para unirte con un toque.`}
            </p>
          </div>

          {isHostWindow ? (
            <button
              type="button"
              onClick={openLiveRaceLobby}
              className="btn-neon-gradient rounded-2xl px-5 py-3.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2 shrink-0 shadow-neon-cyan cursor-pointer"
            >
              <Flag className="h-4 w-4" />
              <span>🏁 Iniciar Minijuego: CARRERAS</span>
            </button>
          ) : (
            <div className="rounded-2xl border border-neon-cyan/40 bg-space-950/90 px-4 py-3 text-xs font-black text-cyan-200 shrink-0 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-neon-cyan animate-soft-pulse" />
              <span>Listo para correr cuando el anfitrión inicie</span>
            </div>
          )}
        </div>
      </section>
    );
  }

  const isCurrentUserInRace = activeRace.racers.some(
    (r) => r.id === currentUser.id
  );

  // Ordenar clasificación en vivo por progreso o lugar de llegada
  const sortedStandings = [...activeRace.racers].sort((a, b) => {
    if (a.finishPlace && b.finishPlace) return a.finishPlace - b.finishPlace;
    if (a.finishPlace) return -1;
    if (b.finishPlace) return 1;
    return b.progress - a.progress;
  });

  const getLaneGradient = (color: RaceParticipant["laneColor"]) => {
    switch (color) {
      case "cyan":
        return "from-cyan-400 via-neon-cyan to-blue-500 shadow-neon-cyan";
      case "violet":
        return "from-purple-500 via-neon-violet to-indigo-500 shadow-neon-violet";
      case "magenta":
        return "from-pink-500 via-neon-magenta to-rose-500 shadow-neon-magenta";
      case "emerald":
        return "from-emerald-400 via-neon-emerald to-teal-500 shadow-neon-emerald";
      case "gold":
      default:
        return "from-amber-300 via-yellow-400 to-orange-500";
    }
  };

  const podiumFirst = activeRace.podium[0] || sortedStandings[0];
  const podiumSecond = activeRace.podium[1] || sortedStandings[1];
  const podiumThird = activeRace.podium[2] || sortedStandings[2];

  return (
    <section className="glass-card-cyan rounded-3xl p-5 sm:p-6 border-2 border-neon-cyan shadow-neon-cyan-lg space-y-5">
      {/* =====================================================================
          CABECERA DEL MINIJUEGO CARRERAS DENTRO DE LA SALA
          ===================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neon-cyan/30 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-cyan px-3 py-0.5 text-xs font-black uppercase text-slate-950 shadow-neon-cyan">
              <Flag className="h-3.5 w-3.5" />
              <span>CARRERAS EN VIVO • LA SALA</span>
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-emerald/70 bg-neon-emerald/15 px-3 py-0.5 text-[11px] font-black text-neon-emerald">
              <Volume2 className="h-3.5 w-3.5" />
              <span>VOZ DE LA SALA ACTIVA</span>
            </span>

            <span className="inline-flex items-center gap-1 rounded-full border border-neon-violet bg-neon-violet/20 px-2.5 py-0.5 text-[11px] font-black text-fuchsia-200">
              <Users className="h-3.5 w-3.5 text-neon-cyan" />
              <span>{activeRace.racers.length} Corredores en Pista</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white text-glow-cyan">
            {activeRace.status === "lobby" &&
              "🏁 Pista Abierta: ¡Únete con un toque antes del arranque!"}
            {activeRace.status === "countdown" &&
              "🚦 ¡Preparados en la línea de salida!"}
            {activeRace.status === "racing" &&
              "⚡ ¡CARRERA EN CURSO! Avanzando en vivo hacia la META"}
            {activeRace.status === "finished" &&
              "🏆 ¡CARRERA FINALIZADA! Resultados Oficiales y Podio"}
          </h2>
        </div>

        {/* Botón permanente "Volver a la sala" (regresa al video en vivo sin cerrar transmisión) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={closeLiveRaceToRoom}
            className="rounded-2xl border-2 border-neon-cyan bg-space-950/90 hover:bg-neon-cyan/20 px-4 py-2.5 text-xs font-black text-white flex items-center gap-1.5 transition shadow-neon-cyan cursor-pointer"
            title="Regresa al escenario de video en vivo sin cortar la transmisión ni perder el historial"
          >
            <ArrowLeft className="h-4 w-4 text-neon-cyan" />
            <span>Volver a la sala</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          FASE 1: LOBBY DE INSCRIPCIÓN (UNIRSE CON UN TOQUE + ARRANCAR 3-2-1)
          ===================================================================== */}
      {activeRace.status === "lobby" && (
        <div className="rounded-2xl border border-neon-violet/60 bg-gradient-to-r from-[#0a0624]/95 via-[#160b38]/95 to-[#071f36]/95 p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm sm:text-base font-black text-white">
              {isCurrentUserInRace ? (
                <span className="inline-flex items-center gap-2 text-neon-emerald">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>
                    ¡Estás inscrito en la carrera como {currentUser.avatarUrl}{" "}
                    {currentUser.displayName} (@{currentUser.username})!
                  </span>
                </span>
              ) : (
                <span className="text-neon-cyan">
                  👋 Toca el botón para entrar a la pista con tu cuenta{" "}
                  {currentUser.avatarUrl} @{currentUser.username}
                </span>
              )}
            </p>
            <p className="text-xs text-cyan-100/85">
              Los espectadores se unen con un solo toque. Al arrancar habrá
              cuenta regresiva 3-2-1, avance en vivo hasta la meta y podio con
              los 3 primeros lugares.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {!isCurrentUserInRace && (
              <button
                type="button"
                onClick={joinLiveRace}
                className="btn-neon-cyan rounded-2xl px-5 py-3 text-xs sm:text-sm font-black flex items-center gap-2 shadow-neon-cyan cursor-pointer"
              >
                <Zap className="h-4 w-4" />
                <span>🏁 Unirme a la carrera (1 toque)</span>
              </button>
            )}

            {isHostWindow ? (
              <button
                type="button"
                onClick={startLiveRaceCountdown}
                className="btn-neon-gradient rounded-2xl px-5 py-3 text-xs sm:text-sm font-black flex items-center gap-2 shadow-neon-cyan cursor-pointer"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>🚦 Arrancar Carrera (3 - 2 - 1)</span>
              </button>
            ) : (
              isCurrentUserInRace && (
                <span className="rounded-xl border border-neon-cyan/50 bg-space-950/90 px-4 py-2.5 text-xs font-black text-neon-cyan animate-soft-pulse">
                  Esperando que @{session.hostUsername} inicie el 3-2-1...
                </span>
              )
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          FASE 2: CUENTA REGRESIVA 3 - 2 - 1 EN PANTALLA GRANDE
          ===================================================================== */}
      {activeRace.status === "countdown" && (
        <div className="rounded-3xl border-2 border-neon-cyan bg-gradient-to-b from-cyan-950/80 via-space-950 to-violet-950/80 p-6 text-center space-y-2 shadow-neon-cyan-lg animate-soft-pulse">
          <p className="text-xs font-black uppercase tracking-widest text-neon-cyan">
            ¡ATENCIÓN TODA LA SALA! LA CARRERA COMIENZA EN...
          </p>
          <div className="text-6xl sm:text-7xl font-black text-white text-glow-cyan">
            {activeRace.countdownValue > 0
              ? activeRace.countdownValue
              : "¡ARRANCAN!"}
          </div>
          <p className="text-xs font-bold text-fuchsia-200">
            Todos los corredores avanzan sincronizados en tiempo real hacia la
            META
          </p>
        </div>
      )}

      {/* Botón Gigante Táctil de Aceleración en Móvil y PC */}
      {activeRace.status === "racing" && isCurrentUserInRace && (
        <div className="rounded-3xl border-2 border-neon-cyan bg-gradient-to-r from-[#041d3b] via-[#093259] to-[#041d3b] p-4 text-center space-y-2 shadow-neon-cyan">
          <p className="text-xs font-black uppercase tracking-wider text-cyan-200">
            ⚡ TOCA RÁPIDO PARA AVANZAR — CADA TOQUE CUENTA EN EL SERVIDOR
          </p>
          <button
            type="button"
            onClick={boostMyRacer}
            className="btn-neon-gradient w-full py-4 rounded-2xl text-base sm:text-lg font-black flex items-center justify-center gap-2 shadow-neon-cyan animate-soft-pulse active:scale-95 transition cursor-pointer select-none"
          >
            <Zap className="h-6 w-6 text-amber-300 fill-current" />
            <span>¡PULSAR PARA ACELERAR! 🚀⚡</span>
          </button>
        </div>
      )}

      {/* =====================================================================
          FASE 4 (AL TERMINAR): ANUNCIO DEL GANADOR EN PANTALLA GRANDE + PODIO 1°-2°-3°
          ===================================================================== */}
      {activeRace.status === "finished" && podiumFirst && (
        <div className="rounded-3xl border-2 border-amber-300 bg-gradient-to-b from-amber-500/20 via-[#130933]/95 to-[#06182c]/95 p-5 sm:p-6 space-y-6 shadow-[0_0_40px_rgba(251,191,36,0.35)]">
          {/* Anuncio del ganador en pantalla grande para toda la sala */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-400/20 px-4 py-1 text-xs font-black uppercase tracking-wider text-amber-200 animate-soft-pulse">
              <Trophy className="h-4 w-4 text-amber-300" />
              <span>¡ANUNCIO OFICIAL PARA TODA LA SALA!</span>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 pt-1">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-amber-300 bg-space-950 text-4xl shadow-[0_0_25px_rgba(251,191,36,0.5)]">
                {podiumFirst.avatarUrl}
              </div>
              <h3 className="text-2xl sm:text-4xl font-black text-white text-glow-cyan">
                🏆 ¡GANADOR: {podiumFirst.displayName.toUpperCase()}!
              </h3>
              <p className="text-sm sm:text-base font-black text-amber-300">
                @{podiumFirst.username} cruzó la META en 1° Lugar con su nave{" "}
                {podiumFirst.shipIcon}
              </p>
            </div>
          </div>

          {/* PODIO CON LOS 3 PRIMEROS LUGARES (1°, 2° y 3°) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-2">
            {/* 2° LUGAR */}
            {podiumSecond && (
              <div className="order-2 sm:order-1 rounded-2xl border-2 border-neon-cyan/70 bg-space-950/90 p-4 text-center space-y-2 shadow-neon-cyan">
                <span className="inline-block rounded-full bg-neon-cyan/20 border border-neon-cyan px-3 py-0.5 text-xs font-black text-neon-cyan">
                  🥈 2° LUGAR
                </span>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-neon-cyan/60 bg-space-900 text-3xl">
                  {podiumSecond.avatarUrl}
                </div>
                <div>
                  <p className="text-sm font-black text-white truncate">
                    {podiumSecond.displayName}
                  </p>
                  <p className="text-xs font-bold text-cyan-300 truncate">
                    @{podiumSecond.username} {podiumSecond.shipIcon}
                  </p>
                </div>
              </div>
            )}

            {/* 1° LUGAR (CENTRO ELEVADO) */}
            <div className="order-1 sm:order-2 rounded-3xl border-2 border-amber-300 bg-gradient-to-b from-amber-400/25 to-space-950 p-5 text-center space-y-2.5 shadow-[0_0_30px_rgba(251,191,36,0.4)] sm:-translate-y-2">
              <span className="inline-block rounded-full bg-amber-400 px-3.5 py-1 text-xs font-black text-slate-950">
                🥇 1° LUGAR • CAMPEÓN
              </span>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-amber-300 bg-space-900 text-4xl">
                {podiumFirst.avatarUrl}
              </div>
              <div>
                <p className="text-base font-black text-white truncate">
                  {podiumFirst.displayName}
                </p>
                <p className="text-xs font-black text-amber-300 truncate">
                  @{podiumFirst.username} {podiumFirst.shipIcon}
                </p>
              </div>
            </div>

            {/* 3° LUGAR */}
            {podiumThird && (
              <div className="order-3 rounded-2xl border-2 border-neon-violet/70 bg-space-950/90 p-4 text-center space-y-2 shadow-neon-violet">
                <span className="inline-block rounded-full bg-neon-violet/25 border border-neon-violet px-3 py-0.5 text-xs font-black text-fuchsia-200">
                  🥉 3° LUGAR
                </span>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-neon-violet/60 bg-space-900 text-3xl">
                  {podiumThird.avatarUrl}
                </div>
                <div>
                  <p className="text-sm font-black text-white truncate">
                    {podiumThird.displayName}
                  </p>
                  <p className="text-xs font-bold text-fuchsia-300 truncate">
                    @{podiumThird.username} {podiumThird.shipIcon}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción al finalizar: "Volver a la sala" y "Nueva Carrera" */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={closeLiveRaceToRoom}
              className="btn-neon-cyan rounded-2xl px-6 py-3.5 text-xs sm:text-sm font-black flex items-center gap-2 shadow-neon-cyan cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver a la sala (Seguir en el En Vivo)</span>
            </button>

            {isHostWindow && (
              <button
                type="button"
                onClick={openLiveRaceLobby}
                className="btn-neon-violet rounded-2xl px-5 py-3.5 text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Nueva Carrera</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          BOTÓN GIGANTE DE JUEGO: PEDAL DE ACELERACIÓN PARA TU NAVE
          ===================================================================== */}
      {(activeRace.status === "countdown" || activeRace.status === "racing") &&
        isCurrentUserInRace && (
          <div className="rounded-3xl border-2 border-neon-cyan bg-gradient-to-r from-cyan-950/90 via-violet-950/90 to-fuchsia-950/90 p-4 sm:p-5 text-center space-y-2 shadow-neon-cyan-lg">
            <p className="text-xs sm:text-sm font-black text-cyan-200 uppercase tracking-wider">
              🎮 CONTROL DE TU NAVE ({currentUser.avatarUrl} @
              {currentUser.username}):
            </p>
            <button
              type="button"
              disabled={activeRace.status !== "racing"}
              onClick={boostMyRacer}
              className={`w-full rounded-2xl py-4 sm:py-5 px-6 text-base sm:text-xl font-black uppercase tracking-wide flex items-center justify-center gap-3 transition-transform active:scale-95 cursor-pointer ${
                activeRace.status === "racing"
                  ? "btn-neon-gradient text-white shadow-[0_0_35px_rgba(0,245,255,0.65)]"
                  : "border border-white/20 bg-space-900/80 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Zap className="h-6 w-6 fill-current" />
              <span>
                {activeRace.status === "racing"
                  ? "⚡ ¡TOCA AQUÍ RÁPIDO PARA ACELERAR TU NAVE! 🚀"
                  : `⏳ PREPÁRATE PARA TOCAR AQUÍ EN ${activeRace.countdownValue}...`}
              </span>
            </button>
          </div>
        )}

      {/* =====================================================================
          PISTA DE CARRERAS EN TIEMPO REAL (CARRILES SINCRONIZADOS + META)
          ===================================================================== */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-black text-cyan-200 uppercase tracking-wider">
            🚀 SALIDA (0%)
          </span>

          <span className="font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
            <Flag className="h-3.5 w-3.5" />
            <span>META OFICIAL (100%) 🏁</span>
          </span>
        </div>

        <div className="space-y-3 rounded-2xl border border-neon-cyan/35 bg-[#050417]/95 p-4">
          {activeRace.racers.map((racer) => {
            const rankIndex =
              sortedStandings.findIndex((s) => s.id === racer.id) + 1;
            const isMe = racer.id === currentUser.id;

            return (
              <div
                key={racer.id}
                className={`rounded-2xl border p-3 transition-all ${
                  isMe
                    ? "border-2 border-neon-cyan bg-neon-cyan/15 shadow-neon-cyan"
                    : "border-white/10 bg-space-900/80"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                        rankIndex === 1
                          ? "bg-amber-400 text-slate-950"
                          : rankIndex === 2
                          ? "bg-neon-cyan text-slate-950"
                          : rankIndex === 3
                          ? "bg-neon-violet text-white"
                          : "bg-white/10 text-slate-200"
                      }`}
                    >
                      {rankIndex}°
                    </span>
                    <span className="text-lg">{racer.avatarUrl}</span>
                    <span className="text-xs sm:text-sm font-black text-white truncate">
                      {racer.displayName}
                    </span>
                    <span className="text-[11px] font-bold text-cyan-300 truncate">
                      @{racer.username}
                    </span>
                    {isMe && (
                      <span className="rounded bg-neon-cyan px-2 py-0.5 text-[10px] font-black text-slate-950">
                        👈 TU NAVE
                      </span>
                    )}
                    {racer.isBot && (
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-slate-300">
                        Invitado Sala
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isMe &&
                      activeRace.status === "racing" &&
                      !racer.finishPlace && (
                        <button
                          type="button"
                          onClick={boostMyRacer}
                          className="btn-neon-cyan rounded-lg px-2.5 py-1 text-[11px] font-black flex items-center gap-1 cursor-pointer"
                        >
                          <Zap className="h-3 w-3" />
                          <span>¡Acelerar!</span>
                        </button>
                      )}
                    {racer.finishPlace ? (
                      <span className="rounded-lg bg-neon-emerald/20 border border-neon-emerald px-2 py-0.5 text-[11px] font-black text-neon-emerald">
                        🏁 META ({racer.finishPlace}° Lugar)
                      </span>
                    ) : (
                      <span className="text-xs font-black text-neon-cyan">
                        {Math.round(racer.progress)}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Carril con línea de meta al extremo derecho */}
                <div className="relative h-8 w-full rounded-xl bg-space-950 border border-white/15 overflow-hidden flex items-center">
                  {/* Línea de meta a cuadros en el borde derecho */}
                  <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-b from-amber-300 via-white to-amber-400 opacity-80 z-10" />

                  {/* Barra de avance neón */}
                  <div
                    className={`h-full bg-gradient-to-r ${getLaneGradient(
                      racer.laneColor
                    )} transition-all duration-150 ease-linear`}
                    style={{ width: `${Math.max(4, racer.progress)}%` }}
                  />

                  {/* Nave / Corredor posicionado en la punta del avance */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-150 ease-linear z-20 flex items-center gap-1"
                    style={{
                      left: `calc(${Math.min(92, Math.max(2, racer.progress))}% - 8px)`,
                    }}
                  >
                    <span className="text-xl drop-shadow-[0_0_8px_rgba(0,245,255,0.9)]">
                      {racer.shipIcon}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
