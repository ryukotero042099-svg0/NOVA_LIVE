"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UserCheck,
  UserPlus,
  Award,
  ShieldCheck,
  Sparkles,
  Check,
  TrendingUp,
  Radio,
  Clock,
  Video,
  Mic,
  Square,
  Eye,
  X,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NOVA_ECONOMY_RULES } from "@/lib/types";

const AVATAR_OPTIONS = ["🚀", "🌟", "⚡", "👑", "🦊", "🐉", "🎮", "🛸"];

export default function PerfilPageStep2And5() {
  const router = useRouter();
  const {
    currentUser,
    profiles,
    switchProfile,
    updateCurrentProfile,
    setIsProfileModalOpen,
    simulateGainFollower,
    activeLiveSession,
    startLiveBroadcast,
    endLiveBroadcast,
    broadcastHistory,
  } = useApp();

  const [username, setUsername] = useState(currentUser.username);
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [bio, setBio] = useState(currentUser.bio);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const [savedNotice, setSavedNotice] = useState(false);

  // Modal / Formulario para "Transmitir en vivo" desde el perfil del creador (Requisito 1 del Paso 5)
  const [isGoLiveModalOpen, setIsGoLiveModalOpen] = useState(false);
  const [roomTitle, setRoomTitle] = useState(
    `En Vivo desde NOVA con @${currentUser.username}`
  );
  const [permissionStatus, setPermissionStatus] = useState<string>("");
  const [isStartingLive, setIsStartingLive] = useState(false);

  useEffect(() => {
    setUsername(currentUser.username);
    setDisplayName(currentUser.displayName);
    setBio(currentUser.bio);
    setAvatarUrl(currentUser.avatarUrl);
    setRoomTitle(`En Vivo desde NOVA con @${currentUser.username}`);
  }, [currentUser]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentProfile({ username, displayName, bio, avatarUrl });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleStartLiveFromProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStartingLive(true);
    setPermissionStatus("Conectando con LiveKit Cloud...");

    try {
      const res = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: `sala-${currentUser.username.toLowerCase()}`,
          participantId: currentUser.id,
          participantName: currentUser.displayName,
          isHost: true,
        }),
      });
      const data = await res.json();
      const mode =
        data.mode === "livekit_cloud" ? "livekit_cloud" : "demo_webrtc";

      startLiveBroadcast(
        roomTitle.trim() || `En Vivo con ${currentUser.displayName}`,
        mode,
        true
      );
    } catch {
      startLiveBroadcast(
        roomTitle.trim() || `En Vivo con ${currentUser.displayName}`,
        "livekit_cloud",
        true
      );
    } finally {
      setIsStartingLive(false);
      setIsGoLiveModalOpen(false);
      setPermissionStatus("");
      router.push("/la-sala");
    }
  };

  const followersProgress = Math.min(
    100,
    Math.round(
      (currentUser.followersCount / NOVA_ECONOMY_RULES.CANTERA_MAX_FOLLOWERS) *
        100
    )
  );
  const earningsProgress = Math.min(
    100,
    Math.round(
      (currentUser.creatorEarningsUsd /
        NOVA_ECONOMY_RULES.CANTERA_MAX_EARNINGS_USD) *
        100
    )
  );

  const creatorBroadcasts = broadcastHistory.filter(
    (b) => b.hostId === currentUser.id
  );

  return (
    <div className="space-y-6">
      {/* =====================================================================
          MODAL PARA TRANSMITIR EN VIVO DESDE EL PERFIL DEL CREADOR (PASO 5)
          ===================================================================== */}
      {isGoLiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-card-cyan relative w-full max-w-md rounded-3xl border-2 border-neon-cyan p-6 shadow-neon-cyan-lg space-y-4">
            <button
              type="button"
              onClick={() => setIsGoLiveModalOpen(false)}
              className="absolute right-4 top-4 rounded-full bg-white/10 p-1.5 text-slate-200 hover:bg-white/20"
              aria-label="Cerrar modal"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neon-cyan bg-space-950 text-2xl shadow-neon-cyan">
                {currentUser.avatarUrl}
              </div>
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-black uppercase text-white animate-soft-pulse">
                  <Radio className="h-3 w-3" />
                  <span>NUEVA TRANSMISIÓN EN VIVO</span>
                </span>
                <h2 className="mt-1 text-lg font-black text-white text-glow-cyan">
                  Transmitir en vivo como @{currentUser.username}
                </h2>
              </div>
            </div>

            <p className="text-xs text-cyan-100/90 leading-relaxed">
              Escribe el título para tu sala. Al continuar, el navegador pedirá
              permiso de <strong>cámara y micrófono</strong> e iniciarás tu
              transmisión en vivo dentro de NOVA (Cero espejo de pantalla).
            </p>

            <form onSubmit={handleStartLiveFromProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-cyan-200 mb-1.5">
                  Título para la sala en vivo:
                </label>
                <input
                  type="text"
                  required
                  value={roomTitle}
                  onChange={(e) => setRoomTitle(e.target.value)}
                  placeholder="Ej: Charla estelar y chat de voz abierto"
                  className="w-full rounded-xl border border-neon-cyan/60 bg-[#060518] px-3.5 py-2.5 text-xs sm:text-sm font-bold text-white focus:border-neon-cyan focus:outline-none"
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-space-950/80 p-3 flex items-center gap-3 text-xs text-cyan-100">
                <Video className="h-5 w-5 text-neon-cyan shrink-0" />
                <Mic className="h-5 w-5 text-neon-violet shrink-0" />
                <span>
                  Se activarán tu cámara y micrófono en tiempo real mediante
                  LiveKit WebRTC (o Modo Demostración si no hay llaves en{" "}
                  <code>.env.local</code>).
                </span>
              </div>

              {permissionStatus && (
                <p className="text-xs font-bold text-amber-300">
                  {permissionStatus}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsGoLiveModalOpen(false)}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isStartingLive}
                  className="btn-neon-gradient rounded-xl px-5 py-2.5 text-xs sm:text-sm font-black flex items-center gap-2 shadow-neon-cyan"
                >
                  <Radio className="h-4 w-4" />
                  <span>
                    {isStartingLive
                      ? "Iniciando..."
                      : "Iniciar Transmisión Ahora"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          CABECERA DEL PERFIL DEL CREADOR + BOTÓN "TRANSMITIR EN VIVO"
          ===================================================================== */}
      <section className="glass-card-violet rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-neon-cyan bg-space-900 text-3xl shadow-neon-cyan">
              {currentUser.avatarUrl}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-white text-glow-cyan">
                  {currentUser.displayName}
                </h1>
                <span
                  className={`rounded-full border px-3 py-0.5 text-xs font-black uppercase ${
                    currentUser.tier === "titular"
                      ? "border-neon-violet bg-neon-violet/30 text-fuchsia-100 shadow-neon-violet"
                      : "border-neon-cyan bg-neon-cyan/20 text-neon-cyan shadow-neon-cyan"
                  }`}
                >
                  {currentUser.tier === "titular"
                    ? "👑 LOS TITULARES"
                    : "🚀 LA CANTERA"}
                </span>

                {currentUser.isLive && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-3 py-0.5 text-xs font-black uppercase text-white animate-soft-pulse">
                    ● EN VIVO
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-cyan-200 mt-0.5">
                @{currentUser.username} • Antigüedad: {currentUser.accountAgeDays}{" "}
                días • Saldo:{" "}
                <strong className="text-neon-cyan">
                  {currentUser.novaBalance} NOVAS
                </strong>
              </p>
              <p className="text-xs text-slate-200/90 mt-1">{currentUser.bio}</p>
            </div>
          </div>

          {/* Botones principales del Perfil: "Transmitir en vivo" + Crear Nuevo Perfil */}
          <div className="flex flex-wrap items-center gap-2.5">
            {currentUser.isLive &&
            activeLiveSession?.hostId === currentUser.id ? (
              <>
                <button
                  type="button"
                  onClick={() => router.push("/la-sala")}
                  className="btn-neon-cyan inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-xs sm:text-sm font-black"
                >
                  <Eye className="h-4 w-4" />
                  <span>Ir a mi Sala en Vivo</span>
                </button>
                <button
                  type="button"
                  onClick={() => endLiveBroadcast()}
                  className="inline-flex items-center gap-2 rounded-2xl border border-rose-400 bg-rose-600 hover:bg-rose-500 px-4 py-3 text-xs sm:text-sm font-black text-white transition shadow-lg"
                >
                  <Square className="h-4 w-4 fill-current" />
                  <span>Terminar transmisión</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsGoLiveModalOpen(true)}
                className="btn-neon-gradient inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs sm:text-sm font-black shadow-neon-cyan"
              >
                <Radio className="h-4 w-4" />
                <span>Transmitir en vivo</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="btn-neon-cyan inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-xs sm:text-sm font-black"
            >
              <UserPlus className="h-4 w-4" />
              <span>+ Crear Nuevo Perfil</span>
            </button>
          </div>
        </div>
      </section>

      {/* Selector Rápido de Cuentas de Prueba (Cantera vs Casi Graduado vs Titular) */}
      <section className="glass-card rounded-3xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-neon-cyan" />
              <span>
                Cambiar de Cuenta en Esta Ventana del Navegador (1 Clic)
              </span>
            </h2>
            <p className="text-xs text-cyan-200/85">
              Cada ventana del navegador guarda su propia cuenta activa para que
              puedas abrir dos ventanas con cuentas distintas y probar el En
              Vivo y la Voz en tiempo real.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {profiles.map((prof) => {
            const isCurrent = prof.id === currentUser.id;
            return (
              <button
                key={prof.id}
                type="button"
                onClick={() => switchProfile(prof.id)}
                className={`rounded-2xl border p-3.5 text-left transition ${
                  isCurrent
                    ? "border-2 border-neon-cyan bg-neon-cyan/15 shadow-neon-cyan"
                    : "border-white/15 bg-space-900/75 hover:border-neon-cyan/50"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-2xl">{prof.avatarUrl}</span>
                  {prof.isLive ? (
                    <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[9px] font-black uppercase text-white animate-soft-pulse">
                      ● EN VIVO
                    </span>
                  ) : (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                        prof.tier === "titular"
                          ? "bg-neon-violet/35 text-fuchsia-100"
                          : "bg-neon-cyan/25 text-neon-cyan"
                      }`}
                    >
                      {prof.tier === "titular" ? "TITULAR" : "LA CANTERA"}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm font-black text-white truncate">
                  {prof.displayName}
                </p>
                <p className="text-xs font-bold text-cyan-200 truncate">
                  @{prof.username}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-200 border-t border-white/10 pt-2">
                  <span>{prof.followersCount} seg.</span>
                  <span>\${prof.creatorEarningsUsd.toFixed(2)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          HISTORIAL DE TRANSMISIONES DEL CREADOR (PASO 5: Creador, Título,
          Hora de inicio, Hora de fin, Pico de espectadores + Supabase)
          ===================================================================== */}
      <section className="glass-card-cyan rounded-3xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neon-cyan/30 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2 text-glow-cyan">
              <Radio className="h-5 w-5 text-neon-cyan" />
              <span>
                Historial de Transmisiones de {currentUser.displayName} (@
                {currentUser.username})
              </span>
            </h2>
            <p className="text-xs text-cyan-100/90">
              Cada transmisión finalizada queda registrada con creador, título,
              hora de inicio, hora de fin y pico de espectadores (sincronizado
              con Supabase <code>live_broadcasts</code>).
            </p>
          </div>
          <span className="rounded-xl border border-neon-cyan/50 bg-neon-cyan/15 px-3 py-1 text-xs font-black text-neon-cyan self-start sm:self-center">
            {creatorBroadcasts.length} transmisiones guardadas
          </span>
        </div>

        {creatorBroadcasts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-space-950/75 p-4 text-xs text-cyan-100/85 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-neon-cyan shrink-0" />
              <span>
                Aún no hay transmisiones registradas para{" "}
                <strong>@{currentUser.username}</strong>. Pulsa el botón{" "}
                <strong>&ldquo;Transmitir en vivo&rdquo;</strong> arriba y luego{" "}
                <strong>&ldquo;Terminar transmisión&rdquo;</strong> para ver el
                registro aquí.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsGoLiveModalOpen(true)}
              className="btn-neon-cyan rounded-xl px-3.5 py-2 text-xs font-black"
            >
              Transmitir en vivo →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {creatorBroadcasts.map((log) => (
              <div
                key={log.id}
                className="rounded-2xl border border-neon-cyan/50 bg-space-950/90 p-4 space-y-2.5 shadow-neon-cyan"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-neon-emerald/20 border border-neon-emerald/50 px-2.5 py-0.5 text-[10px] font-black uppercase text-neon-emerald">
                    ✓ REGISTRADA EN HISTORIAL
                  </span>
                  <span className="rounded-lg border border-neon-cyan/40 bg-neon-cyan/15 px-2.5 py-0.5 text-xs font-black text-neon-cyan">
                    Pico: {log.peakViewers} espectador(es)
                  </span>
                </div>

                <div>
                  <p className="text-sm font-black text-white">{log.title}</p>
                  <p className="text-xs font-bold text-cyan-300">
                    Creador: {log.hostDisplayName} (@{log.hostUsername})
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-black/40 p-2.5 text-[11px] text-slate-200">
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-cyan-200/80">
                      Hora de inicio
                    </span>
                    <span className="font-black text-white">
                      {new Date(log.startedAt).toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-cyan-200/80">
                      Hora de fin
                    </span>
                    <span className="font-black text-white">
                      {new Date(log.endedAt).toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Medidor de Graduación de La Cantera a Los Titulares (100 seguidores o $100 USD) */}
      <section className="glass-card-cyan rounded-3xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-cyan bg-neon-cyan/20 px-3 py-0.5 text-xs font-black text-neon-cyan">
              <Award className="h-3.5 w-3.5" />
              REGLA ANTI-TRAMPA Y GRADUACIÓN AUTOMÁTICA
            </span>
            <h2 className="mt-2 text-lg font-black text-white text-glow-cyan">
              Progreso hacia LOS TITULARES (100 Seguidores o \$100 USD Ganados)
            </h2>
            <p className="text-xs text-cyan-100/90">
              Al llegar a cualquiera de las dos metas, tu cuenta se gradúa con una
              animación de celebración a pantalla completa.
            </p>
          </div>

          <button
            type="button"
            onClick={simulateGainFollower}
            className="btn-neon-gradient rounded-2xl px-4 py-2.5 text-xs font-black flex items-center gap-1.5 self-start"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Simular +1 Seguidor Ahora</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-neon-cyan/40 bg-space-900/80 p-4 space-y-2">
            <div className="flex justify-between text-xs font-black">
              <span className="text-cyan-200">Meta 1: Seguidores</span>
              <span className="text-white">
                {currentUser.followersCount} /{" "}
                {NOVA_ECONOMY_RULES.CANTERA_MAX_FOLLOWERS}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-space-950 border border-neon-cyan/30">
              <div
                className="h-full bg-gradient-to-r from-neon-cyan to-neon-violet transition-all duration-300"
                style={{ width: `${followersProgress}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-neon-violet/40 bg-space-900/80 p-4 space-y-2">
            <div className="flex justify-between text-xs font-black">
              <span className="text-fuchsia-200">
                Meta 2: Ganancias Acumuladas (77% creador)
              </span>
              <span className="text-white">
                \${currentUser.creatorEarningsUsd.toFixed(2)} / \$
                {NOVA_ECONOMY_RULES.CANTERA_MAX_EARNINGS_USD}.00 USD
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-space-950 border border-neon-violet/30">
              <div
                className="h-full bg-gradient-to-r from-neon-violet to-neon-magenta transition-all duration-300"
                style={{ width: `${earningsProgress}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Formulario para Editar los Datos de Tu Perfil Activo */}
      <section className="glass-card rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-neon-cyan" />
            <span>
              Editar Datos de Tu Perfil Activo (@{currentUser.username})
            </span>
          </h2>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-neon-emerald">
            <ShieldCheck className="h-4 w-4" />
            Sincronizado
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-cyan-200 mb-1.5">
              Icono / Avatar:
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatarUrl(emoji)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition ${
                    avatarUrl === emoji
                      ? "border-neon-cyan bg-neon-cyan/25 shadow-neon-cyan scale-110"
                      : "border-white/15 bg-space-900 hover:border-neon-cyan/50"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-cyan-200 mb-1">
                Nombre de usuario (@)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-neon-cyan/50 bg-[#060518] px-3 py-2 text-xs font-bold text-white focus:border-neon-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-cyan-200 mb-1">
                Nombre visible
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-neon-cyan/50 bg-[#060518] px-3 py-2 text-xs font-bold text-white focus:border-neon-cyan focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-cyan-200 mb-1">
              Biografía
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-xl border border-neon-cyan/50 bg-[#060518] px-3 py-2 text-xs font-bold text-white focus:border-neon-cyan focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="btn-neon-cyan rounded-2xl px-5 py-2.5 text-xs font-black"
            >
              Guardar Cambios del Perfil
            </button>
            {savedNotice && (
              <span className="inline-flex items-center gap-1 text-xs font-black text-neon-emerald">
                <Check className="h-4 w-4" />
                ¡Perfil actualizado!
              </span>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
