"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Volume2,
  Users,
  Play,
  SkipForward,
  Vote,
  Send,
  Trophy,
  RotateCcw,
  Eye,
} from "lucide-react";
import {
  type ActiveLiveSession,
  type ImpostorPlayer,
} from "@/lib/types";
import { useApp } from "@/context/AppContext";

interface LiveImpostorArenaProps {
  session: ActiveLiveSession;
}

const MIN_PLAYERS = 4;
const MAX_PLAYERS = 10;

export function LiveImpostorArena({ session }: LiveImpostorArenaProps) {
  const {
    currentUser,
    windowInstanceId,
    isHostWindow,
    openImpostorLobby,
    joinImpostorGame,
    startImpostorRound,
    passImpostorTurn,
    castImpostorVote,
    resolveImpostorVotes,
    submitImpostorWordGuess,
    nextImpostorRound,
    closeImpostorToRoom,
    getMyImpostorSeat,
  } = useApp();

  const g = session.activeImpostor;
  const scoreboard = session.impostorScoreboard || [];

  const [now, setNow] = useState<number>(() => Date.now());
  const [guess, setGuess] = useState("");
  const autoKeyRef = useRef<string>("");

  // Reloj local solo de este componente (el video no se re-renderiza)
  useEffect(() => {
    if (!g || !g.turnEndsAtMs) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [g?.turnEndsAtMs, g?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  // El anfitrión avanza el turno / cierra la última oportunidad al agotarse el tiempo
  useEffect(() => {
    if (!isHostWindow || !g || !g.turnEndsAtMs) return;
    if (now < g.turnEndsAtMs) return;
    const key = `${g.gameId}-${g.round}-${g.status}-${g.turnIndex}`;
    if (autoKeyRef.current === key) return;
    autoKeyRef.current = key;
    if (g.status === "clues") passImpostorTurn();
    if (g.status === "impostor_last_chance") submitImpostorWordGuess("");
  }, [now, g, isHostWindow]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setGuess("");
  }, [g?.round, g?.status]);

  // ---------------------------------------------------------------------
  // Sin juego abierto: barra de lanzamiento
  // ---------------------------------------------------------------------
  if (!g) {
    if (session.activeRace) return null;
    return (
      <section className="glass-card-cyan rounded-3xl p-4 sm:p-5 border-2 border-neon-violet/70 shadow-neon-violet space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-violet bg-neon-violet/20 px-3 py-0.5 text-xs font-black text-fuchsia-200">
              <Volume2 className="h-3.5 w-3.5 text-neon-cyan" />
              <span>JUEGO DE SALA • TODOS JUEGAN HABLANDO</span>
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white text-glow-cyan">
              🎭 EL IMPOSTOR — Pistas por voz, votación y revelación
            </h3>
            <p className="text-xs sm:text-sm text-cyan-100/90">
              {isHostWindow
                ? "De 4 a 10 jugadores. Todos reciben una palabra secreta menos uno: el impostor. Cada quien da una pista en voz alta y al final se vota."
                : `Esperando a que @${session.hostUsername} abra EL IMPOSTOR para unirte con un toque.`}
            </p>
          </div>
          {isHostWindow && (
            <button
              type="button"
              onClick={openImpostorLobby}
              className="btn-neon-gradient rounded-2xl px-5 py-3.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2 shrink-0 shadow-neon-cyan cursor-pointer"
            >
              <span>🎭 Jugar: EL IMPOSTOR</span>
            </button>
          )}
        </div>
        <Scoreboard entries={scoreboard} />
      </section>
    );
  }

  // ---------------------------------------------------------------------
  // Datos derivados
  // ---------------------------------------------------------------------
  const seat = getMyImpostorSeat();
  const isPlayer = Boolean(seat);
  const inQueue = g.queue.some(
    (p) => p.id === currentUser.id && p.windowId === windowInstanceId
  );
  const amImpostor = Boolean(seat && seat.id === g.impostorId);
  const impostorPlayer: ImpostorPlayer | undefined = g.players.find(
    (p) => p.id === g.impostorId
  );
  const currentTurnPlayer = g.players[g.turnIndex];
  const secondsLeft = g.turnEndsAtMs
    ? Math.max(0, Math.ceil((g.turnEndsAtMs - now) / 1000))
    : 0;
  const votedCount = g.players.filter((p) => g.votes[p.id]).length;
  const myVote = seat ? g.votes[seat.id] : g.roomVotes[currentUser.id];

  const tally = (map: Record<string, string>) => {
    const t: Record<string, number> = {};
    Object.values(map).forEach((id) => {
      t[id] = (t[id] || 0) + 1;
    });
    return t;
  };
  const roomTally = tally(g.roomVotes);
  const roomTotal = Object.keys(g.roomVotes).length;
  const playerTally = tally(g.votes);

  const headline = () => {
    if (g.status === "lobby") return "🎭 Sala abierta: ¡Únete con un toque!";
    if (g.status === "clues") return "🗣️ Ronda de pistas: habla por la voz de la sala";
    if (g.status === "voting") return "🗳️ Votación: ¿Quién es el impostor?";
    if (g.status === "impostor_last_chance")
      return "🎭 ¡IMPOSTOR DESCUBIERTO! Última oportunidad";
    return "🎬 Revelación";
  };

  // ---------------------------------------------------------------------
  // Vista privada (solo la ventana del jugador la ve)
  // ---------------------------------------------------------------------
  const PrivateCard = () => {
    if (g.status === "lobby" || g.status === "revealed") return null;
    if (!isPlayer) {
      return (
        <div className="rounded-2xl border-2 border-cyan-300/60 bg-space-950/90 p-4 text-center space-y-1">
          <div className="text-sm font-black text-cyan-200 flex items-center justify-center gap-2">
            <Eye className="h-4 w-4" /> ERES ESPECTADOR
          </div>
          <p className="text-xs text-cyan-100/80">
            {inQueue
              ? "Quedaste en la fila: entras en la siguiente ronda."
              : "Esta ronda ya empezó. Puedes opinar en “La sala opina” y entrar en la siguiente."}
          </p>
          {!inQueue && (
            <button
              type="button"
              onClick={joinImpostorGame}
              className="mt-2 rounded-xl border border-neon-cyan bg-neon-cyan/15 px-4 py-2 text-xs font-black text-white cursor-pointer"
            >
              Entrar en la siguiente ronda
            </button>
          )}
        </div>
      );
    }
    if (amImpostor) {
      return (
        <div className="rounded-2xl border-4 border-fuchsia-400 bg-gradient-to-br from-[#2a0638] via-[#160b38] to-[#1b0524] p-5 text-center space-y-2 shadow-neon-magenta">
          <div className="text-[11px] font-black uppercase tracking-widest text-fuchsia-200">
            🔒 Solo tú ves esto
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white text-glow-cyan">
            🎭 ERES EL IMPOSTOR
          </div>
          <p className="text-sm sm:text-base font-bold text-fuchsia-100">
            No sabes la palabra. Escucha las pistas y finge que sí sabes.
          </p>
        </div>
      );
    }
    return (
      <div className="rounded-2xl border-4 border-neon-emerald bg-gradient-to-br from-[#04271f] via-[#071f36] to-[#0a0624] p-5 text-center space-y-2 shadow-neon-emerald">
        <div className="text-[11px] font-black uppercase tracking-widest text-emerald-200">
          🔒 Solo tú ves esto • ✅ NO eres el impostor
        </div>
        <div className="text-sm font-bold text-cyan-100">
          {g.categoryIcon} Categoría: {g.categoryName}
        </div>
        <div className="text-2xl sm:text-4xl font-black text-white text-glow-cyan">
          La palabra es: {g.secretWord}
        </div>
        <p className="text-xs text-emerald-100/90">
          Da una pista en voz alta sin decir la palabra. Que el impostor no la
          adivine.
        </p>
      </div>
    );
  };

  // ---------------------------------------------------------------------
  // Render principal
  // ---------------------------------------------------------------------
  return (
    <section className="glass-card-cyan rounded-3xl p-5 sm:p-6 border-2 border-neon-violet shadow-neon-violet space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neon-violet/40 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-violet px-3 py-0.5 text-xs font-black uppercase text-white shadow-neon-violet">
              🎭 EL IMPOSTOR • RONDA {g.round}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-emerald/70 bg-neon-emerald/15 px-3 py-0.5 text-[11px] font-black text-neon-emerald">
              <Volume2 className="h-3.5 w-3.5" />
              <span>VOZ DE LA SALA ACTIVA</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-neon-cyan bg-neon-cyan/15 px-2.5 py-0.5 text-[11px] font-black text-cyan-100">
              <Users className="h-3.5 w-3.5 text-neon-cyan" />
              <span>{g.players.length} jugadores</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white text-glow-cyan">
            {headline()}
          </h2>
        </div>
        {isHostWindow ? (
          <button
            type="button"
            onClick={closeImpostorToRoom}
            className="rounded-2xl border-2 border-neon-cyan bg-space-950/90 hover:bg-neon-cyan/20 px-4 py-2.5 text-xs font-black text-white flex items-center gap-1.5 transition shadow-neon-cyan cursor-pointer"
            title="Cierra el juego sin cortar la transmisión ni perder el historial"
          >
            <ArrowLeft className="h-4 w-4 text-neon-cyan" />
            <span>Terminar / Volver a la sala</span>
          </button>
        ) : (
          <span className="text-[11px] font-bold text-cyan-200/80">
            El anfitrión cierra el juego. El video sigue arriba.
          </span>
        )}
      </div>

      {/* LOBBY */}
      {g.status === "lobby" && (
        <div className="space-y-4">
          <PlayerChips players={g.players} />
          <p className="text-xs text-cyan-100/90">
            {g.players.length}/{MAX_PLAYERS} jugadores • mínimo {MIN_PLAYERS} para
            empezar.{" "}
            {g.queue.length > 0 && `${g.queue.length} en fila para la siguiente.`}
          </p>
          <div className="flex flex-wrap gap-3">
            {!isPlayer && !inQueue && (
              <button
                type="button"
                onClick={joinImpostorGame}
                className="btn-neon-gradient rounded-2xl px-6 py-3.5 text-sm font-black flex items-center gap-2 shadow-neon-cyan cursor-pointer"
              >
                🎭 Unirme a EL IMPOSTOR (1 toque)
              </button>
            )}
            {isPlayer && (
              <span className="rounded-2xl border border-neon-emerald bg-neon-emerald/15 px-4 py-3 text-xs font-black text-emerald-200">
                ✅ Ya estás dentro. Espera a que el anfitrión empiece.
              </span>
            )}
            {isHostWindow && (
              <button
                type="button"
                disabled={g.players.length < MIN_PLAYERS}
                onClick={startImpostorRound}
                className="btn-neon-gradient rounded-2xl px-6 py-3.5 text-sm font-black flex items-center gap-2 shadow-neon-cyan cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Play className="h-4 w-4" />
                {g.players.length < MIN_PLAYERS
                  ? `Faltan ${MIN_PLAYERS - g.players.length} jugadores`
                  : "Repartir y empezar"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* VISTA PRIVADA */}
      <PrivateCard />

      {/* PISTAS */}
      {g.status === "clues" && currentTurnPlayer && (
        <div className="space-y-4">
          <div className="rounded-2xl border-2 border-neon-cyan bg-space-950/90 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-[11px] font-black uppercase text-cyan-200">
                Turno {g.turnIndex + 1} de {g.players.length}
              </div>
              <div className="text-xl font-black text-white text-glow-cyan">
                {currentTurnPlayer.avatarUrl} {currentTurnPlayer.displayName}
                {seat?.id === currentTurnPlayer.id && " (¡eres tú!)"}
              </div>
              <div className="text-xs text-cyan-100/80">
                Dice UNA pista corta en voz alta por el chat de voz.
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-4xl font-black text-neon-cyan text-glow-cyan tabular-nums">
                {secondsLeft}s
              </div>
              {isHostWindow && (
                <button
                  type="button"
                  onClick={passImpostorTurn}
                  className="rounded-xl border-2 border-neon-violet bg-neon-violet/20 px-4 py-2.5 text-xs font-black text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <SkipForward className="h-4 w-4" /> Pasar turno
                </button>
              )}
            </div>
          </div>
          <ol className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {g.players.map((p, i) => (
              <li
                key={p.id}
                className={`rounded-xl border px-3 py-2 text-xs font-black ${
                  i === g.turnIndex
                    ? "border-neon-cyan bg-neon-cyan/25 text-white shadow-neon-cyan"
                    : i < g.turnIndex
                    ? "border-neon-emerald/50 bg-neon-emerald/10 text-emerald-200"
                    : "border-neon-violet/40 bg-space-950/80 text-cyan-100/80"
                }`}
              >
                {i + 1}. {p.avatarUrl} {p.displayName}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* VOTACIÓN */}
      {g.status === "voting" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border-2 border-neon-cyan bg-space-950/90 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-black text-white">
                <Vote className="h-4 w-4 text-neon-cyan" />
                {isPlayer ? "Toca a quién crees que es el impostor" : "Solo votan los jugadores"}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {g.players.map((p) => {
                  const disabled = !isPlayer || seat?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => castImpostorVote(p.id)}
                      className={`rounded-xl border-2 px-3 py-3 text-xs font-black transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        isPlayer && myVote === p.id
                          ? "border-neon-cyan bg-neon-cyan/30 text-white shadow-neon-cyan"
                          : "border-neon-violet/60 bg-space-950 text-cyan-100 hover:bg-neon-violet/20"
                      }`}
                    >
                      {p.avatarUrl} {p.displayName}
                    </button>
                  );
                })}
              </div>
              <div className="text-[11px] text-cyan-200/80">
                Votaron {votedCount} de {g.players.length} jugadores.
              </div>
              {isHostWindow && (
                <button
                  type="button"
                  onClick={resolveImpostorVotes}
                  className="rounded-xl border-2 border-neon-violet bg-neon-violet/20 px-4 py-2 text-xs font-black text-white cursor-pointer"
                >
                  Cerrar votación y revelar
                </button>
              )}
            </div>

            <div className="rounded-2xl border-2 border-neon-violet bg-space-950/90 p-4 space-y-3">
              <div className="text-sm font-black text-fuchsia-200">
                📣 La sala opina{" "}
                <span className="text-[11px] font-bold text-cyan-200/80">
                  (no decide la partida)
                </span>
              </div>
              {!isPlayer && (
                <p className="text-[11px] text-cyan-100/80">
                  Como espectador, toca a tu sospechoso en la lista de la
                  izquierda.
                </p>
              )}
              {g.players.map((p) => {
                const n = roomTally[p.id] || 0;
                const pct = roomTotal ? Math.round((n / roomTotal) * 100) : 0;
                return (
                  <div key={p.id} className="space-y-0.5">
                    <div className="flex justify-between text-[11px] font-bold text-cyan-100">
                      <span>{p.displayName}</span>
                      <span>{n}</span>
                    </div>
                    <div className="h-2 rounded-full bg-space-900 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-neon-cyan to-neon-violet transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ÚLTIMA OPORTUNIDAD */}
      {g.status === "impostor_last_chance" && (
        <div className="space-y-4">
          <div className="rounded-3xl border-4 border-fuchsia-400 bg-gradient-to-r from-[#2a0638] via-[#160b38] to-[#071f36] p-6 text-center space-y-2 shadow-neon-magenta">
            <div className="text-3xl sm:text-5xl font-black text-white text-glow-cyan">
              ¡IMPOSTOR DESCUBIERTO!
            </div>
            <div className="text-lg font-black text-fuchsia-100">
              🎭 {impostorPlayer?.avatarUrl} {impostorPlayer?.displayName} era el impostor
            </div>
            <div className="text-sm text-cyan-100">
              Pero tiene UNA última oportunidad: adivinar la palabra secreta ({secondsLeft}s).
            </div>
          </div>
          {amImpostor ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (guess.trim()) submitImpostorWordGuess(guess);
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                autoFocus
                placeholder="Escribe la palabra secreta…"
                className="flex-1 rounded-2xl border-2 border-neon-cyan bg-space-950 px-4 py-3 text-base font-black text-white outline-none"
              />
              <button
                type="submit"
                className="btn-neon-gradient rounded-2xl px-6 py-3 text-sm font-black flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="h-4 w-4" /> Enviar palabra
              </button>
            </form>
          ) : (
            <p className="text-center text-sm font-bold text-cyan-100">
              Esperando la respuesta del impostor…
            </p>
          )}
        </div>
      )}

      {/* REVELACIÓN (pantalla grande para toda la sala) */}
      {g.status === "revealed" && (
        <div className="space-y-4">
          <div
            className={`rounded-3xl border-4 p-6 sm:p-8 text-center space-y-3 ${
              g.outcome === "caught_failed"
                ? "border-neon-emerald bg-gradient-to-r from-[#04271f] via-[#071f36] to-[#0a0624] shadow-neon-emerald"
                : "border-fuchsia-400 bg-gradient-to-r from-[#2a0638] via-[#160b38] to-[#1b0524] shadow-neon-magenta"
            }`}
          >
            <div className="text-3xl sm:text-5xl font-black text-white text-glow-cyan">
              {g.outcome === "escaped" && "¡EL IMPOSTOR SE ESCAPÓ!"}
              {g.outcome === "stole" && "¡EL IMPOSTOR ROBÓ LA PARTIDA! 🎭"}
              {g.outcome === "caught_failed" && "¡IMPOSTOR DESCUBIERTO! 🎉"}
            </div>
            <div className="text-base sm:text-lg font-black text-cyan-100">
              🎭 El impostor era {impostorPlayer?.avatarUrl}{" "}
              {impostorPlayer?.displayName}
            </div>
            <div className="text-base sm:text-lg font-black text-white">
              {g.categoryIcon} {g.categoryName}: la palabra era{" "}
              <span className="text-neon-cyan text-glow-cyan">{g.secretWord}</span>
            </div>
            {g.outcome !== "escaped" && g.guessedWord && (
              <div className="text-sm text-cyan-100/90">
                El impostor dijo: “{g.guessedWord}”
              </div>
            )}
            <div className="text-lg font-black text-white">
              {g.outcome === "caught_failed"
                ? "🏆 ¡Gana la sala!"
                : "🏆 ¡Gana el impostor!"}
            </div>
          </div>
          {isHostWindow ? (
            <button
              type="button"
              onClick={nextImpostorRound}
              className="btn-neon-gradient rounded-2xl px-6 py-3.5 text-sm font-black flex items-center gap-2 shadow-neon-cyan cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" /> Otra ronda
            </button>
          ) : (
            <p className="text-xs font-bold text-cyan-200/80">
              El anfitrión puede lanzar otra ronda con un toque.
            </p>
          )}
        </div>
      )}

      <Scoreboard entries={scoreboard} />
    </section>
  );
}

function PlayerChips({ players }: { players: ImpostorPlayer[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {players.map((p) => (
        <span
          key={p.id}
          className="rounded-full border border-neon-cyan/60 bg-space-950/90 px-3 py-1.5 text-xs font-black text-white"
        >
          {p.avatarUrl} {p.displayName}
        </span>
      ))}
    </div>
  );
}

function Scoreboard({
  entries,
}: {
  entries: NonNullable<ActiveLiveSession["impostorScoreboard"]>;
}) {
  if (entries.length === 0) return null;
  const sorted = [...entries].sort(
    (a, b) => b.impostorWins + b.roomWins - (a.impostorWins + a.roomWins)
  );
  return (
    <div className="rounded-2xl border border-neon-violet/60 bg-space-950/90 p-4 space-y-2">
      <div className="flex items-center gap-2 text-sm font-black text-white">
        <Trophy className="h-4 w-4 text-amber-300" /> Marcador de la sala
      </div>
      <div className="grid gap-1.5">
        {sorted.map((e) => (
          <div
            key={e.playerId}
            className="flex items-center justify-between text-xs font-bold text-cyan-100 rounded-lg bg-space-900/80 px-3 py-1.5"
          >
            <span>
              {e.avatarUrl} {e.displayName}
            </span>
            <span>
              🎭 como impostor: {e.impostorWins} • 🏠 con la sala: {e.roomWins}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
