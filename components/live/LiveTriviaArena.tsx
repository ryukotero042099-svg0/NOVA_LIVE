"use client";

import React, { useEffect, useState } from "react";
import {
  Brain,
  Zap,
  Volume2,
  Users,
  Trophy,
  Heart,
  RotateCcw,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Award,
} from "lucide-react";
import { type ActiveLiveSession, type TriviaPlayer } from "@/lib/types";
import { useApp } from "@/context/AppContext";

interface LiveTriviaArenaProps {
  session: ActiveLiveSession;
}

export function LiveTriviaArena({ session }: LiveTriviaArenaProps) {
  const {
    currentUser,
    isHostWindow,
    windowInstanceId,
    openTriviaLobby,
    joinTriviaGame,
    startTriviaMatch,
    submitTriviaAnswer,
    triviaRematchAction,
    closeTriviaToRoom,
    getMyTriviaSeat,
    pingTriviaTimerSync,
  } = useApp();

  const g = session.activeTrivia;

  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!g || g.status === "lobby" || g.status === "finished") return;
    const interval = setInterval(() => {
      const currentNow = Date.now();
      setNow(currentNow);
      if (
        (g.status === "question" && g.questionEndsAtMs && currentNow >= g.questionEndsAtMs) ||
        (g.status === "reveal" && g.revealEndsAtMs && currentNow >= g.revealEndsAtMs)
      ) {
        pingTriviaTimerSync();
      }
    }, 80);
    return () => clearInterval(interval);
  }, [g?.status, g?.questionEndsAtMs, g?.revealEndsAtMs, pingTriviaTimerSync]);

  if (!g) {
    if (session.activeRace || session.activeImpostor || session.activeDefense) return null;
    return (
      <section className="glass-card-cyan rounded-3xl p-4 sm:p-5 border-2 border-neon-violet/70 shadow-neon-violet space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-violet bg-neon-violet/20 px-3 py-0.5 text-xs font-black text-fuchsia-200">
                <Brain className="h-3.5 w-3.5 text-neon-cyan" />
                <span>MINIJUEGO MASIVO • TODA LA SALA JUEGA EN VIVO</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-neon-emerald/60 bg-neon-emerald/15 px-2.5 py-0.5 text-[11px] font-black text-neon-emerald">
                <Volume2 className="h-3.5 w-3.5" />
                <span>VOZ EN DIRECTO ACTIVA</span>
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white text-glow-cyan">
              🧠 TRIVIA GALÁCTICA — Supervivencia y Preguntas Rápidas
            </h3>
            <p className="text-xs sm:text-sm text-cyan-100/90">
              {isHostWindow
                ? "Inicia la trivia: entran todos los presentes con 3 vidas, preguntas rápidas de 12 segundos y podio en pantalla grande."
                : `Esperando a que @${session.hostUsername} inicie la TRIVIA GALÁCTICA para unirte con un toque.`}
            </p>
          </div>

          {isHostWindow ? (
            <button
              type="button"
              onClick={openTriviaLobby}
              className="btn-neon-gradient rounded-2xl px-5 py-3.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2 shrink-0 shadow-neon-cyan cursor-pointer"
            >
              <Brain className="h-4 w-4" />
              <span>🧠 Iniciar Trivia Galáctica</span>
            </button>
          ) : (
            <div className="rounded-2xl border border-neon-cyan/40 bg-space-950/90 px-4 py-3 text-xs font-black text-cyan-200 shrink-0 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-neon-cyan animate-soft-pulse" />
              <span>Listo para jugar cuando el anfitrión abra la sala</span>
            </div>
          )}
        </div>
      </section>
    );
  }

  const mySeat = getMyTriviaSeat();
  const isPlayer = Boolean(mySeat);
  const isEliminated = mySeat?.isEliminated ?? false;
  const currentQ = g.questions[g.currentQuestionIndex];

  // Cálculo de tiempo restante en segundos
  const secondsLeft =
    g.status === "question" && g.questionEndsAtMs
      ? Math.max(0, Math.ceil((g.questionEndsAtMs - now) / 1000))
      : g.status === "reveal" && g.revealEndsAtMs
      ? Math.max(0, Math.ceil((g.revealEndsAtMs - now) / 1000))
      : 0;

  const totalVotes = g.tallies.reduce((a, b) => a + b, 0);

  // Paleta de colores para las 4 opciones
  const optionThemes = [
    {
      label: "A",
      border: "border-cyan-400",
      bg: "bg-cyan-950/60 hover:bg-cyan-900/60",
      activeBg: "bg-cyan-500/30 border-cyan-300 ring-2 ring-cyan-400 text-white shadow-neon-cyan",
      badge: "bg-cyan-400 text-slate-950",
    },
    {
      label: "B",
      border: "border-purple-400",
      bg: "bg-purple-950/60 hover:bg-purple-900/60",
      activeBg: "bg-purple-500/30 border-purple-300 ring-2 ring-purple-400 text-white shadow-neon-violet",
      badge: "bg-purple-400 text-slate-950",
    },
    {
      label: "C",
      border: "border-emerald-400",
      bg: "bg-emerald-950/60 hover:bg-emerald-900/60",
      activeBg: "bg-emerald-500/30 border-emerald-300 ring-2 ring-emerald-400 text-white shadow-neon-emerald",
      badge: "bg-emerald-400 text-slate-950",
    },
    {
      label: "D",
      border: "border-pink-400",
      bg: "bg-pink-950/60 hover:bg-pink-900/60",
      activeBg: "bg-pink-500/30 border-pink-300 ring-2 ring-pink-400 text-white shadow-neon-magenta",
      badge: "bg-pink-400 text-slate-950",
    },
  ];

  return (
    <section className="glass-card-cyan rounded-3xl p-4 sm:p-6 border-2 border-neon-violet shadow-neon-violet-lg space-y-4">
      {/* =====================================================================
          CABECERA DE LA TRIVIA GALÁCTICA
          ===================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neon-violet/30 pb-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-violet px-3 py-0.5 text-xs font-black uppercase text-white shadow-neon-violet">
              <Brain className="h-3.5 w-3.5 text-neon-cyan" />
              <span>
                TRIVIA •{" "}
                {g.status === "lobby"
                  ? "SALA DE ESPERA"
                  : g.status === "finished"
                  ? "PODIO FINAL"
                  : `PREGUNTA ${g.currentQuestionIndex + 1} DE ${g.totalQuestions}`}
              </span>
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-emerald/70 bg-neon-emerald/15 px-3 py-0.5 text-[11px] font-black text-neon-emerald">
              <Volume2 className="h-3.5 w-3.5" />
              <span>VOZ DE LA SALA ACTIVA</span>
            </span>

            <span className="inline-flex items-center gap-1 rounded-full border border-neon-cyan bg-neon-cyan/15 px-2.5 py-0.5 text-[11px] font-black text-cyan-100">
              <Users className="h-3.5 w-3.5 text-neon-cyan" />
              <span>{g.players.length} participantes</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white text-glow-cyan">
            {g.status === "lobby" && "🛸 ¡Únete con un toque antes del despegue!"}
            {g.status === "question" && `⏱️ ¡Responde antes de que se agote el tiempo!`}
            {g.status === "reveal" && "✨ ¡Resultados de la pregunta!"}
            {g.status === "finished" && "🏆 ¡Sobrevivientes y Campeón de la Sala!"}
          </h2>
        </div>

        {/* Botón permanente Volver a la sala */}
        <div className="flex flex-wrap items-center gap-2">
          {isHostWindow && (
            <button
              type="button"
              onClick={closeTriviaToRoom}
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
          FASE 1: LOBBY DE INSCRIPCIÓN (CUALQUIERA SE UNE CON 1 TOQUE)
          ===================================================================== */}
      {g.status === "lobby" && (
        <div className="rounded-3xl border border-neon-cyan/50 bg-space-950/90 p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-white text-glow-cyan">
                🎮 Batalla de Trivia: Todos contra Todos
              </h3>
              <p className="text-xs sm:text-sm text-cyan-200">
                Cada jugador empieza con 3 vidas (❤️❤️❤️). Si fallas una pregunta, pierdes una vida.
                ¡El último astronauta en pie o con más puntos se corona campeón!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {!isPlayer && (
                <button
                  type="button"
                  onClick={joinTriviaGame}
                  className="btn-neon-gradient rounded-2xl px-6 py-3 text-xs sm:text-sm font-black flex items-center gap-2 shadow-neon-cyan cursor-pointer"
                >
                  <Users className="h-4 w-4" />
                  <span>🚀 Unirme a la Trivia (1 toque)</span>
                </button>
              )}

              {isHostWindow && (
                <button
                  type="button"
                  onClick={startTriviaMatch}
                  className="rounded-2xl border-2 border-neon-emerald bg-neon-emerald/20 hover:bg-neon-emerald/40 px-6 py-3 text-xs sm:text-sm font-black text-white transition shadow-neon-emerald cursor-pointer"
                >
                  <Zap className="h-4 w-4 text-neon-emerald inline mr-1.5" />
                  <span>¡Empezar la Batalla!</span>
                </button>
              )}
            </div>
          </div>

          {/* Lista de defensores inscritos con sus 3 vidas */}
          <div className="space-y-2">
            <span className="text-xs font-black uppercase text-cyan-200 tracking-wider">
              Participantes en la cabina ({g.players.length}):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {g.players.map((p) => {
                const isMe = p.id === currentUser.id && p.windowId === windowInstanceId;
                return (
                  <div
                    key={`trivia-lobby-${p.id}`}
                    className={`rounded-2xl border p-2.5 flex items-center gap-2 bg-space-900/80 ${
                      isMe ? "border-neon-cyan shadow-neon-cyan" : "border-white/15"
                    }`}
                  >
                    <span className="text-xl">{p.avatarUrl || "🧑‍🚀"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-white truncate">
                        {isMe ? "TÚ" : p.displayName}
                      </p>
                      <div className="flex text-xs text-rose-400">
                        {"❤️".repeat(p.lives)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          FASE 2 & 3: PREGUNTA ACTIVA Y REVELACIÓN
          ===================================================================== */}
      {(g.status === "question" || g.status === "reveal") && currentQ && (
        <div className="space-y-5">
          {/* Barra de progreso de tiempo y categoría */}
          <div className="flex items-center justify-between gap-3 bg-space-950/80 px-4 py-2.5 rounded-2xl border border-neon-cyan/40">
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentQ.categoryIcon}</span>
              <span className="text-xs font-black uppercase tracking-wider text-cyan-200">
                {currentQ.category}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-neon-cyan animate-spin" style={{ animationDuration: "3s" }} />
              <span
                className={`text-lg sm:text-xl font-black tabular-nums ${
                  secondsLeft <= 3 ? "text-rose-400 animate-pulse" : "text-neon-cyan text-glow-cyan"
                }`}
              >
                {secondsLeft}s
              </span>
            </div>
          </div>

          {/* Tarjeta de la Pregunta Central */}
          <div className="rounded-3xl border-2 border-neon-cyan bg-gradient-to-br from-[#0c1f38]/95 via-[#081528]/95 to-[#040817]/95 p-5 sm:p-7 text-center space-y-2 shadow-neon-cyan">
            <span className="text-[11px] font-black uppercase tracking-widest text-cyan-300/80">
              Pregunta {g.currentQuestionIndex + 1} de {g.totalQuestions}
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-white text-glow-cyan leading-snug">
              {currentQ.question}
            </h3>
          </div>

          {/* 4 Opciones de Respuesta en Cuadrícula 2x2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((optText, idx) => {
              const theme = optionThemes[idx];
              const isSelectedByMe = mySeat?.selectedOption === idx;
              const isCorrect = currentQ.correctIndex === idx;
              const votesCount = g.tallies[idx] || 0;
              const votePercentage = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;

              let buttonStyle = `rounded-2xl border-2 p-4 text-left transition-all cursor-pointer relative overflow-hidden `;

              if (g.status === "reveal") {
                if (isCorrect) {
                  buttonStyle += "border-neon-emerald bg-neon-emerald/25 text-white ring-4 ring-neon-emerald shadow-neon-emerald";
                } else if (isSelectedByMe) {
                  buttonStyle += "border-rose-500 bg-rose-950/70 text-rose-200 opacity-80";
                } else {
                  buttonStyle += "border-white/10 bg-space-950/60 text-white/50 opacity-50";
                }
              } else {
                if (isSelectedByMe) {
                  buttonStyle += theme.activeBg;
                } else if (!isPlayer || isEliminated || mySeat?.selectedOption !== null && mySeat?.selectedOption !== undefined) {
                  buttonStyle += `${theme.border} ${theme.bg} opacity-80 cursor-default`;
                } else {
                  buttonStyle += `${theme.border} ${theme.bg} hover:scale-[1.01] active:scale-95`;
                }
              }

              return (
                <button
                  key={`opt-${idx}`}
                  type="button"
                  disabled={
                    g.status !== "question" ||
                    !isPlayer ||
                    isEliminated ||
                    (mySeat?.selectedOption !== null && mySeat?.selectedOption !== undefined)
                  }
                  onClick={() => submitTriviaAnswer(idx as 0 | 1 | 2 | 3)}
                  className={buttonStyle}
                >
                  <div className="flex items-center justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3">
                      <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${theme.badge}`}>
                        {theme.label}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-white leading-tight">
                        {optText}
                      </span>
                    </div>

                    {g.status === "reveal" && isCorrect && (
                      <CheckCircle2 className="h-6 w-6 text-neon-emerald shrink-0 animate-soft-pulse" />
                    )}
                    {g.status === "reveal" && isSelectedByMe && !isCorrect && (
                      <XCircle className="h-6 w-6 text-rose-400 shrink-0" />
                    )}
                  </div>

                  {/* Barra de votación en tiempo real */}
                  <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-cyan-200/80">
                    <span>{votesCount} votos</span>
                    <span>{votePercentage}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full bg-space-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-neon-cyan to-neon-violet transition-all duration-300"
                      style={{ width: `${votePercentage}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dato curioso durante la revelación */}
          {g.status === "reveal" && (
            <div className="rounded-2xl border-2 border-neon-emerald/60 bg-space-950/90 p-4 flex items-start gap-3 shadow-neon-emerald animate-soft-pulse">
              <Sparkles className="h-5 w-5 text-neon-emerald shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-black uppercase text-neon-emerald">
                  ¿Sabías que...?
                </span>
                <p className="text-xs sm:text-sm text-cyan-100 font-medium">
                  {currentQ.curiosity}
                </p>
              </div>
            </div>
          )}

          {/* Estado de los jugadores / Vidas restantes */}
          <div className="rounded-2xl border border-neon-violet/40 bg-space-950/80 p-3 space-y-2">
            <span className="text-[11px] font-black uppercase text-cyan-200">
              Tripulación y Vidas:
            </span>
            <div className="flex flex-wrap gap-2">
              {g.players.map((p) => {
                const isMe = p.id === currentUser.id && p.windowId === windowInstanceId;
                return (
                  <div
                    key={`strip-${p.id}`}
                    className={`rounded-xl border px-2.5 py-1 text-xs flex items-center gap-1.5 ${
                      p.isEliminated
                        ? "border-rose-900 bg-rose-950/30 text-rose-400 opacity-60"
                        : isMe
                        ? "border-neon-cyan bg-neon-cyan/20 text-white font-black"
                        : "border-white/10 bg-space-900/60 text-cyan-100"
                    }`}
                  >
                    <span>{p.avatarUrl || "🧑‍🚀"}</span>
                    <span className="truncate max-w-[80px]">{isMe ? "TÚ" : p.displayName}</span>
                    <span className="text-[11px]">
                      {p.isEliminated ? "💀" : "❤️".repeat(p.lives)}
                    </span>
                    <span className="text-[10px] text-cyan-300 font-mono">
                      {p.score}pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          FASE 4: PODIO Y CAMPEÓN DE LA SALA (GAME OVER)
          ===================================================================== */}
      {g.status === "finished" && (
        <div className="rounded-3xl border-4 border-amber-400/80 bg-gradient-to-br from-[#2a1a04]/95 via-[#1a0e28]/95 to-[#050c1f]/95 p-6 text-center space-y-5 shadow-neon-cyan-lg">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-400/20 px-3.5 py-1 text-xs font-black text-amber-200 shadow-md">
              <Trophy className="h-4 w-4" />
              <span>FINAL DE LA BATALLA DE TRIVIA</span>
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-white text-glow-cyan">
              🏆 ¡CAMPEONES DE LA TRIVIA GALÁCTICA!
            </h3>
            <p className="text-xs sm:text-sm text-cyan-100/90">
              Sobrevivieron a las preguntas del espacio y demostraron su conocimiento.
            </p>
          </div>

          {/* Podio con 1°, 2° y 3° lugar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2">
            {/* 2° Lugar */}
            {g.podium[1] && (
              <div className="rounded-2xl border-2 border-slate-300 bg-space-950/80 p-4 space-y-1 sm:mt-4 order-2 sm:order-1">
                <span className="text-2xl">🥈</span>
                <p className="text-sm font-black text-slate-200">
                  {g.podium[1].avatarUrl} {g.podium[1].displayName}
                </p>
                <p className="text-xs text-cyan-200 font-mono font-bold">
                  {g.podium[1].score} Puntos
                </p>
                <div className="text-[11px] text-rose-400">
                  {"❤️".repeat(g.podium[1].lives) || "💀"}
                </div>
              </div>
            )}

            {/* 1° Lugar (Campeón) */}
            {g.podium[0] && (
              <div className="rounded-3xl border-4 border-amber-300 bg-gradient-to-b from-amber-500/20 to-space-950 p-5 space-y-1.5 order-1 sm:order-2 shadow-lg shadow-amber-500/40 transform sm:-translate-y-2">
                <span className="text-4xl">👑</span>
                <span className="text-xs font-black uppercase text-amber-300 tracking-wider block">
                  CAMPEÓN DE LA SALA
                </span>
                <p className="text-base sm:text-lg font-black text-white">
                  {g.podium[0].avatarUrl} {g.podium[0].displayName}
                </p>
                <p className="text-sm text-amber-200 font-mono font-black">
                  {g.podium[0].score} Puntos
                </p>
                <div className="text-xs text-rose-400">
                  {"❤️".repeat(g.podium[0].lives) || "💀"}
                </div>
              </div>
            )}

            {/* 3° Lugar */}
            {g.podium[2] && (
              <div className="rounded-2xl border-2 border-amber-600 bg-space-950/80 p-4 space-y-1 sm:mt-6 order-3">
                <span className="text-2xl">🥉</span>
                <p className="text-sm font-black text-amber-400">
                  {g.podium[2].avatarUrl} {g.podium[2].displayName}
                </p>
                <p className="text-xs text-cyan-200 font-mono font-bold">
                  {g.podium[2].score} Puntos
                </p>
                <div className="text-[11px] text-rose-400">
                  {"❤️".repeat(g.podium[2].lives) || "💀"}
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción final */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            {isHostWindow && (
              <button
                type="button"
                onClick={triviaRematchAction}
                className="btn-neon-gradient rounded-2xl px-6 py-3 text-xs sm:text-sm font-black flex items-center gap-2 shadow-neon-cyan cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>⚔️ ¡Otra Partida de Trivia!</span>
              </button>
            )}

            <button
              type="button"
              onClick={closeTriviaToRoom}
              className="rounded-2xl border-2 border-neon-cyan bg-space-950 px-5 py-3 text-xs sm:text-sm font-black text-white flex items-center gap-2 transition hover:bg-neon-cyan/20 cursor-pointer shadow-neon-cyan"
            >
              <ArrowLeft className="h-4 w-4 text-neon-cyan" />
              <span>Volver a la sala</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
