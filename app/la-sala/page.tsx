"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Radio,
  Video,
  Users,
  ShieldAlert,
  Play,
  Square,
  CheckCircle2,
  Clock,
  Sparkles,
  UserCheck,
  Volume2,
  Eye,
  Gift,
  LogOut,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { LiveVideoStage } from "@/components/live/LiveVideoStage";
import { VoiceChatBar } from "@/components/live/VoiceChatBar";
import { LiveRaceArena } from "@/components/live/LiveRaceArena";
import { LiveImpostorArena } from "@/components/live/LiveImpostorArena";
import { LiveDefenseArena } from "@/components/live/LiveDefenseArena";
import { LiveTriviaArena } from "@/components/live/LiveTriviaArena";
import { LiveRoomGiftModal } from "@/components/live/LiveRoomGiftModal";

function LaSalaContent() {
  const searchParams = useSearchParams();
  const hostParam =
    searchParams.get("host") ||
    searchParams.get("u") ||
    searchParams.get("room");

  const {
    currentUser,
    profiles,
    switchProfile,
    setIsProfileModalOpen,
    activeLiveSession,
    activeLiveSessions,
    selectLiveSession,
    isHostWindow,
    windowInstanceId,
    broadcastHistory,
    startLiveBroadcast,
    endLiveBroadcast,
    joinLiveVoiceRoom,
    leaveLiveVoiceRoom,
  } = useApp();

  const [streamTitle, setStreamTitle] = useState(
    `En Vivo desde NOVA con @${currentUser.username}`
  );
  const [hostCameraEnabled, setHostCameraEnabled] = useState(true);
  const [livekitMode, setLivekitMode] = useState<"livekit_cloud" | "demo_webrtc">(
    "demo_webrtc"
  );
  const [livekitStatusMessage, setLivekitStatusMessage] = useState<string>(
    "MODO DEMOSTRACIÓN ACTIVO: Sin llaves en .env.local — Video y Voz WebRTC sincronizados entre ventanas del navegador."
  );
  const [isStartingStream, setIsStartingStream] = useState(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [showStartLiveForm, setShowStartLiveForm] = useState(false);

  // Sintonizar creador indicado en la URL (?host=usuario)
  useEffect(() => {
    if (hostParam) {
      selectLiveSession(hostParam);
    }
  }, [hostParam, selectLiveSession]);

  // Actualizar título sugerido cuando cambia el usuario activo en esta ventana
  useEffect(() => {
    setStreamTitle(`En Vivo desde NOVA con @${currentUser.username}`);
  }, [currentUser.username]);

  // Consultar estado de configuración de LiveKit (.env.local vs Modo Demostración)
  useEffect(() => {
    let mounted = true;
    fetch("/api/livekit/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomName: "sala-verificacion",
        participantName: currentUser.displayName,
        participantId: currentUser.id,
        isHost: false,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data.mode === "livekit_cloud") {
          setLivekitMode("livekit_cloud");
        } else {
          setLivekitMode("demo_webrtc");
        }
        if (data.message) {
          setLivekitStatusMessage(data.message);
        }
      })
      .catch(() => {
        // Fallback silencioso a modo demostración
      });

    return () => {
      mounted = false;
    };
  }, [currentUser.displayName, currentUser.id]);

  // Si hay un en vivo activo y esta ventana es de un espectador que entra a La Sala,
  // lo sumamos automáticamente a la sala para que el contador de espectadores suba en tiempo real
  useEffect(() => {
    if (!activeLiveSession || isHostWindow) return;
    if (activeLiveSession.hostId === currentUser.id) return;
    const alreadyInRoom = activeLiveSession.voiceParticipants.some(
      (p) => p.id === currentUser.id
    );
    if (!alreadyInRoom) {
      joinLiveVoiceRoom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLiveSession?.roomId, currentUser.id, isHostWindow]);

  const handleGoLive = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStartingStream(true);
    try {
      const res = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: `sala-${currentUser.username}`,
          participantName: currentUser.displayName,
          participantId: currentUser.id,
          isHost: true,
        }),
      });
      const data = await res.json();
      const mode =
        data.mode === "livekit_cloud" ? "livekit_cloud" : "demo_webrtc";
      setLivekitMode(mode);
      if (data.message) {
        setLivekitStatusMessage(data.message);
      }
      startLiveBroadcast(streamTitle, mode, hostCameraEnabled);
    } catch {
      startLiveBroadcast(streamTitle, "demo_webrtc", hostCameraEnabled);
    } finally {
      setIsStartingStream(false);
    }
  };

  const isCurrentUserHost = Boolean(activeLiveSession) && isHostWindow;

  return (
    <div className="space-y-6">
      {/* =====================================================================
          BANNER DE ESTADO LIVEKIT WEBRTC / MODO DEMOSTRACIÓN (.env.local)
          ===================================================================== */}
      <section className="glass-card-cyan rounded-3xl p-4 sm:p-5 border border-neon-cyan/60">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-cyan bg-neon-cyan/20 px-3 py-1 text-xs font-black text-neon-cyan shadow-neon-cyan">
                <Radio className="h-3.5 w-3.5" />
                <span>PASO 5 • VIDEO EN VIVO Y CHAT DE VOZ (LIVEKIT WEBRTC)</span>
              </span>

              {livekitMode === "demo_webrtc" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-400/20 px-3 py-1 text-xs font-black text-amber-200">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-300" />
                  <span>MODO DEMOSTRACIÓN ACTIVO (SIN LLAVES EN .env.local)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-emerald bg-neon-emerald/20 px-3 py-1 text-xs font-black text-neon-emerald">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>LIVEKIT CLOUD CONECTADO</span>
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white text-glow-cyan">
              La Sala: Transmisión En Vivo Dentro de NOVA (Cero Espejo de Pantalla)
            </h1>
            <p className="text-xs sm:text-sm text-cyan-100/90">
              {livekitStatusMessage}
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-space-950/85 px-3.5 py-2.5 text-xs text-cyan-100 shrink-0">
            <p className="font-black text-white">
              💡 Prueba de 2 Ventanas del Navegador:
            </p>
            <p className="text-[11px] text-cyan-200/90 mt-0.5">
              Ventana 1: elige un Creador y pulsa{" "}
              <strong className="text-neon-cyan">Salir EN VIVO</strong>.<br />
              Ventana 2: abre <code className="text-amber-300">/la-sala</code> con
              otra cuenta para ver el video y hablar por voz.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SELECTOR RÁPIDO DE IDENTIDAD POR VENTANA (PERMITE TENER CREADOR EN
          VENTANA 1 Y ESPECTADOR EN VENTANA 2 SIMULTÁNEAMENTE)
          ===================================================================== */}
      <section className="glass-card rounded-3xl p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-neon-cyan" />
              <span>
                Identidad Activa en Esta Ventana:{" "}
                <span className="text-neon-cyan">
                  {currentUser.avatarUrl} {currentUser.displayName} (@
                  {currentUser.username})
                </span>
              </span>
            </h2>
            <p className="text-xs text-cyan-200/85">
              Cada pestaña o ventana del navegador conserva su propio usuario para
              que puedas probar Anfitrión (Ventana 1) y Espectador (Ventana 2) a la
              vez.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {profiles.map((prof) => {
            const isSelected = prof.id === currentUser.id;
            return (
              <button
                key={prof.id}
                type="button"
                onClick={() => switchProfile(prof.id)}
                className={`rounded-2xl border p-3 text-left transition flex flex-col justify-between ${
                  isSelected
                    ? "border-2 border-neon-cyan bg-neon-cyan/15 shadow-neon-cyan"
                    : "border-white/15 bg-space-900/75 hover:border-neon-cyan/50"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xl">{prof.avatarUrl}</span>
                  {prof.isLive ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-[9px] font-black uppercase text-white animate-soft-pulse">
                      ● EN VIVO
                    </span>
                  ) : (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-300">
                      {prof.tier === "titular" ? "TITULAR" : "CANTERA"}
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-xs font-black text-white truncate">
                    {prof.displayName}
                  </p>
                  <p className="text-[11px] font-bold text-cyan-300 truncate">
                    @{prof.username}
                  </p>
                </div>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="rounded-2xl border border-dashed border-neon-cyan/50 bg-space-900/40 p-3 text-center transition flex flex-col items-center justify-center gap-1 hover:border-neon-cyan text-cyan-200"
          >
            <span className="text-xl font-bold">+</span>
            <p className="text-xs font-black">Crear Otro Perfil</p>
          </button>
        </div>
      </section>

      {/* =====================================================================
          PANEL PARA SALIR EN VIVO (SI NO HAY TRANSMISIÓN ACTIVA O SI QUIERES
          INICIAR TU PROPIO EN VIVO DESDE EL NAVEGADOR)
          ===================================================================== */}
      {!activeLiveSession ? (
        <section className="glass-card-violet rounded-3xl p-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            <div className="lg:col-span-7 space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-neon-violet bg-neon-violet/20 px-3 py-1 text-xs font-black text-fuchsia-200">
                <Video className="h-3.5 w-3.5 text-neon-cyan" />
                <span>TRANSMITIR EN VIVO DESDE TU NAVEGADOR</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white text-glow-violet">
                Inicia tu En Vivo con Cámara y Micrófono como{" "}
                <span className="text-neon-cyan">
                  {currentUser.avatarUrl} {currentUser.displayName}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-fuchsia-100/90">
                También puedes iniciar desde el botón{" "}
                <Link href="/perfil" className="text-neon-cyan underline font-bold">
                  &ldquo;Transmitir en vivo&rdquo; en tu Perfil
                </Link>
                . Tu tarjeta mostrará la insignia{" "}
                <strong className="text-rose-400">EN VIVO</strong> (con pulso
                suave) en <strong>Inicio</strong> y en <strong>La Sala</strong>.
              </p>
            </div>

            <form
              onSubmit={handleGoLive}
              className="lg:col-span-5 rounded-2xl border border-neon-cyan/40 bg-space-950/90 p-4 space-y-3"
            >
              <div>
                <label className="block text-xs font-black text-cyan-200 mb-1">
                  Título para la sala en vivo:
                </label>
                <input
                  type="text"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  placeholder="Ej: Charla nocturna y voz abierta en La Sala"
                  className="w-full rounded-xl border border-neon-cyan/50 bg-[#060518] px-3.5 py-2.5 text-xs font-bold text-white focus:border-neon-cyan focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-space-900/75 px-3 py-2 text-xs">
                <span className="font-bold text-cyan-100">
                  Modo de salida del Creador:
                </span>
                <button
                  type="button"
                  onClick={() => setHostCameraEnabled((v) => !v)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-black transition ${
                    hostCameraEnabled
                      ? "bg-neon-cyan text-slate-950"
                      : "bg-neon-violet text-white"
                  }`}
                >
                  {hostCameraEnabled ? "📷 Cámara + Voz" : "🎙️ Solo Audio/Voz"}
                </button>
              </div>

              <button
                type="submit"
                disabled={isStartingStream}
                className="btn-neon-gradient w-full rounded-2xl px-5 py-3.5 text-sm font-black flex items-center justify-center gap-2 shadow-neon-cyan"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>
                  {isStartingStream
                    ? "Conectando WebRTC..."
                    : `🔴 Transmitir en vivo (@${currentUser.username})`}
                </span>
              </button>
            </form>
          </div>
        </section>
      ) : (
        /* =====================================================================
           SALA EN VIVO ACTIVA: VIDEO EN TIEMPO REAL + CHAT DE VOZ DE LA SALA
           ===================================================================== */
        <div className="space-y-5">
          {/* Selector de Canales Activos en Simultáneo (Permite ver múltiples streams a la vez) */}
          {activeLiveSessions.length > 1 && (
            <div className="rounded-2xl border border-neon-cyan/40 bg-space-950/90 p-3 flex flex-wrap items-center justify-between gap-3 shadow-neon-cyan">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
                <span className="text-xs font-black text-cyan-200 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                  <Radio className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                  <span>Canales En Vivo ({activeLiveSessions.length}):</span>
                </span>
                <div className="flex items-center gap-2">
                  {activeLiveSessions.map((s) => {
                    const isSelected = activeLiveSession.roomId === s.roomId;
                    return (
                      <button
                        key={s.roomId}
                        type="button"
                        onClick={() => selectLiveSession(s.hostId)}
                        className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer border ${
                          isSelected
                            ? "bg-rose-600 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-soft-pulse"
                            : "bg-space-900 border-white/20 text-slate-300 hover:border-neon-cyan"
                        }`}
                      >
                        <span>{s.hostAvatar}</span>
                        <span>@{s.hostUsername}</span>
                        <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[9px]">
                          {s.viewersCount} 👁️
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Formulario para iniciar tu propio En Vivo (si estás viendo y decides transmitir a la vez) */}
          {showStartLiveForm && !isCurrentUserHost && (
            <section className="glass-card-violet rounded-3xl p-5 border border-neon-violet/70 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <Video className="h-4 w-4 text-neon-cyan" />
                  <span>Transmitir en tu propio canal (@{currentUser.username})</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowStartLiveForm(false)}
                  className="text-xs font-bold text-slate-400 hover:text-white"
                >
                  ✕ Cerrar
                </button>
              </div>
              <form onSubmit={handleGoLive} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-8">
                  <label className="block text-xs font-black text-cyan-200 mb-1">
                    Título de tu transmisión:
                  </label>
                  <input
                    type="text"
                    value={streamTitle}
                    onChange={(e) => setStreamTitle(e.target.value)}
                    className="w-full rounded-xl border border-neon-cyan/50 bg-[#060518] px-3.5 py-2 text-xs font-bold text-white focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-4">
                  <button
                    type="submit"
                    disabled={isStartingStream}
                    className="btn-neon-gradient w-full rounded-xl py-2 px-4 text-xs font-black flex items-center justify-center gap-2 shadow-neon-cyan cursor-pointer"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>{isStartingStream ? "Conectando..." : "🔴 Salir En Vivo"}</span>
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Barra de aviso superior de transmisión en curso */}
          <div className="rounded-2xl border-2 border-rose-500/80 bg-gradient-to-r from-rose-950/90 via-space-900/95 to-fuchsia-950/90 p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-[0_0_30px_rgba(244,63,94,0.35)]">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1 text-xs font-black uppercase text-white animate-soft-pulse">
                <Radio className="h-3.5 w-3.5" />
                <span>SALA EN VIVO AHORA</span>
              </span>
              <div>
                <p className="text-xs sm:text-sm font-black text-white">
                  Anfitrión: {activeLiveSession.hostAvatar}{" "}
                  {activeLiveSession.hostDisplayName} (@
                  {activeLiveSession.hostUsername})
                </p>
                <p className="text-[11px] font-bold text-rose-200/90">
                  Viendo ahora como:{" "}
                  <span className="text-neon-cyan">
                    {currentUser.avatarUrl} {currentUser.displayName} (
                    {isCurrentUserHost
                      ? "Anfitrión / Creador"
                      : "Espectador en Sala"}
                    )
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-neon-cyan/50 bg-space-950/90 px-3 py-1.5 text-xs font-black text-neon-cyan">
                <Eye className="h-4 w-4" />
                <span>{activeLiveSession.viewersCount} presentes</span>
              </div>

              {/* Botón Regalar integrado al en vivo */}
              <button
                type="button"
                onClick={() => setIsGiftModalOpen(true)}
                className="btn-neon-gradient inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black text-white shadow-neon-magenta hover:brightness-110 transition cursor-pointer"
                title="Enviar un regalo al Creador (Reparto 77/20/3)"
              >
                <Gift className="h-4 w-4" />
                <span>🎁 Regalar</span>
              </button>

              {!isCurrentUserHost && (
                <button
                  type="button"
                  onClick={() => setShowStartLiveForm((v) => !v)}
                  className="rounded-xl border border-neon-violet bg-neon-violet/30 hover:bg-neon-violet/60 px-3.5 py-2 text-xs font-black text-white shadow transition cursor-pointer flex items-center gap-1.5"
                  title="Abrir tu propia sala para transmitir en vivo"
                >
                  <Video className="h-3.5 w-3.5 text-neon-cyan" />
                  <span>{showStartLiveForm ? "Ocultar panel" : "Transmitir mi en vivo"}</span>
                </button>
              )}

              {isCurrentUserHost ? (
                <button
                  type="button"
                  onClick={() => endLiveBroadcast()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-400 bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-black text-white transition shadow-lg cursor-pointer"
                  title="Terminar transmisión (Solo el anfitrión)"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                  <span>Terminar transmisión</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    leaveLiveVoiceRoom();
                    void import("@/lib/media/livekitRoom").then(
                      ({ disconnectLiveKitRoom }) => disconnectLiveKitRoom()
                    );
                    window.location.href = "/";
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-space-900/90 hover:bg-space-800 px-3.5 py-2 text-xs font-bold text-slate-300 transition shadow cursor-pointer"
                  title="Salir de la sala sin afectar la transmisión del anfitrión"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Salir de la sala</span>
                </button>
              )}
            </div>
          </div>

          {/* Modal Oficial de Donaciones y Regalos NOVA */}
          <LiveRoomGiftModal
            session={activeLiveSession}
            isOpen={isGiftModalOpen}
            onClose={() => setIsGiftModalOpen(false)}
          />

          {/* Escenario de Video en Tiempo Real (Fijo arriba para que nunca salte ni se mueva durante la carrera) */}
          <LiveVideoStage
            session={activeLiveSession}
            isHostWindow={isCurrentUserHost}
            onEndBroadcast={endLiveBroadcast}
          />

          {/* Minijuegos Integrados Paso 6: CARRERAS, EL IMPOSTOR, DEFIENDE LA NAVE y TRIVIA GALÁCTICA */}
          <LiveRaceArena session={activeLiveSession} />
          <LiveImpostorArena session={activeLiveSession} />
          <LiveDefenseArena session={activeLiveSession} />
          <LiveTriviaArena session={activeLiveSession} />

          {/* Chat de Voz Integrado de La Sala (Funciona durante toda la carrera) */}
          <VoiceChatBar session={activeLiveSession} />
        </div>
      )}

      {/* =====================================================================
          TARJETAS DE CREADORES EN LA SALA (MUESTRAN LA INSIGNIA "EN VIVO"
          CUANDO EL CREADOR ESTÁ TRANSMITIENDO Y VUELVEN A NORMAL AL TERMINAR)
          ===================================================================== */}
      <section className="glass-card rounded-3xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-neon-cyan" />
              <span>Salas de Creadores en NOVA (Estado en Tiempo Real)</span>
            </h2>
            <p className="text-xs text-cyan-200/85">
              Cuando un creador inicia su transmisión, su tarjeta muestra la
              insignia <strong className="text-rose-400">EN VIVO</strong> aquí y en{" "}
              <Link href="/" className="text-neon-cyan underline">
                Inicio
              </Link>
              .
            </p>
          </div>
          <Link
            href="/"
            className="text-xs font-black text-neon-cyan hover:underline"
          >
            Ir a Inicio (50/50) →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {profiles.map((creator) => {
            const isCreatorLive = Boolean(creator.isLive);
            return (
              <div
                key={creator.id}
                className={`rounded-2xl border p-4 transition-all space-y-3 ${
                  isCreatorLive
                    ? "border-2 border-rose-500 bg-gradient-to-br from-rose-950/60 via-space-900/95 to-space-950 shadow-[0_0_28px_rgba(244,63,94,0.45)]"
                    : "border-white/15 bg-space-900/80"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  {isCreatorLive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-black uppercase text-white animate-soft-pulse">
                      <Radio className="h-3 w-3" />
                      <span>EN VIVO</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-300">
                      <span>SALA EN ESPERA</span>
                    </span>
                  )}

                  <span className="text-[10px] font-black uppercase text-cyan-200">
                    {creator.tier === "titular" ? "👑 TITULAR" : "🚀 CANTERA"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-neon-cyan/50 bg-space-950 text-2xl">
                    {creator.avatarUrl}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-white truncate">
                      {creator.displayName}
                    </h3>
                    <p className="text-xs font-bold text-cyan-300 truncate">
                      @{creator.username}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-300 border-t border-white/10 pt-2">
                  <span>{creator.followersCount} seg.</span>
                  {isCreatorLive && activeLiveSession ? (
                    <span className="font-black text-rose-300">
                      👁️ {activeLiveSession.viewersCount} viendo
                    </span>
                  ) : (
                    <span className="text-slate-400">Offline</span>
                  )}
                </div>

                {isCreatorLive ? (
                  <button
                    type="button"
                    onClick={() => {
                      joinLiveVoiceRoom();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="btn-neon-cyan w-full rounded-xl py-2 text-xs font-black flex items-center justify-center gap-1.5"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Ver En Vivo + Voz</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      switchProfile(creator.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 py-2 text-xs font-bold text-slate-200 transition"
                  >
                    Elegir a @{creator.username}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          HISTORIAL DE TRANSMISIONES EN VIVO (SE GUARDA AL TERMINAR EL EN VIVO
          Y TAMBIÉN APARECE EN EL PERFIL DEL PASO 2)
          ===================================================================== */}
      <section className="glass-card-cyan rounded-3xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-neon-cyan" />
              <span>
                Registro de Transmisiones Finalizadas (Historial de Creadores)
              </span>
            </h2>
            <p className="text-xs text-cyan-200/85">
              Al terminar un en vivo, la sala vuelve a su estado normal y queda
              registrado en Supabase y en{" "}
              <Link href="/perfil" className="text-neon-cyan underline font-bold">
                Mi Perfil (Paso 2)
              </Link>
              .
            </p>
          </div>
          <Link
            href="/perfil"
            className="text-xs font-black text-neon-cyan hover:underline"
          >
            Ver Historial en Mi Perfil →
          </Link>
        </div>

        {broadcastHistory.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-space-950/70 p-4 text-xs text-cyan-100/80 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-neon-cyan shrink-0" />
            <span>
              Aún no hay transmisiones finalizadas en esta sesión. Inicia un{" "}
              <strong>En Vivo</strong> y luego pulsa{" "}
              <strong>Terminar transmisión</strong> para ver cómo se guarda el
              registro.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {broadcastHistory.map((log) => (
              <div
                key={log.id}
                className="rounded-2xl border border-neon-cyan/40 bg-space-950/85 p-3.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-neon-emerald/20 border border-neon-emerald/50 px-2 py-0.5 text-[10px] font-black text-neon-emerald">
                      TRANSMISIÓN COMPLETADA
                    </span>
                    <span className="text-[11px] font-bold text-cyan-200">
                      {log.hostDisplayName} (@{log.hostUsername})
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm font-black text-white truncate">
                    {log.title}
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Inicio:{" "}
                    {new Date(log.startedAt).toLocaleTimeString("es-MX", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}{" "}
                    • Fin:{" "}
                    {new Date(log.endedAt).toLocaleTimeString("es-MX", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block rounded-xl border border-neon-cyan/40 bg-neon-cyan/10 px-2.5 py-1 text-xs font-black text-neon-cyan">
                    Pico: {log.peakViewers} 👁️
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function LaSalaPageStep5() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-white">
          <p className="text-sm font-bold text-cyan-200 animate-pulse">
            Cargando La Sala de Transmisiones...
          </p>
        </div>
      }
    >
      <LaSalaContent />
    </Suspense>
  );
}
