"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  VideoOff,
  Users,
  ShieldCheck,
  Sparkles,
  Radio,
  CheckCircle2,
  Volume2,
  SwitchCamera,
  Camera,
  Mic,
  MicOff,
  Pause,
  Play,
} from "lucide-react";
import { type ActiveLiveSession, type DonationAlertEvent } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import {
  acquireHostCameraAndMicStream,
  getExistingHostStream,
} from "@/lib/media/sharedStream";
import {
  connectToLiveKitRoom,
  getLocalLiveKitVideoTrack,
  getActiveLiveKitRoom,
  startLiveKitAudio,
  disconnectLiveKitRoom,
  switchLiveKitCamera,
  getCurrentFacingMode,
  setLiveKitMicMuted,
  setLiveKitCameraMuted,
} from "@/lib/media/livekitRoom";

interface LiveVideoStageProps {
  session: ActiveLiveSession;
  isHostWindow: boolean;
  onEndBroadcast?: () => void;
}

const VIDEO_BUS_CHANNEL = "nova_live_video_bus_v5";

export const LiveVideoStage = React.memo(
  function LiveVideoStage({
    session,
    isHostWindow,
    onEndBroadcast,
  }: LiveVideoStageProps) {
    const { enqueueDonationAlert, currentUser } = useApp();
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
    const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const sessionRef = useRef<ActiveLiveSession>(session);
    useEffect(() => {
      sessionRef.current = session;
    }, [session]);

    const isLiveKitMode = session.providerMode === "livekit_cloud";

    const [cameraStatusMsg, setCameraStatusMsg] = useState<string>(
      isLiveKitMode
        ? "Conectando con LiveKit Cloud WebRTC..."
        : "Cámara y micrófono del navegador activos"
    );
    const [remoteFrameDataUrl, setRemoteFrameDataUrl] = useState<string | null>(
      null
    );
    const [hasRemoteLiveKitVideo, setHasRemoteLiveKitVideo] =
      useState<boolean>(false);
    const [isAudioBlocked, setIsAudioBlocked] = useState<boolean>(false);
    const [audioDiag, setAudioDiag] = useState({
      audioPublished: isHostWindow,
      audioTrackReceived: false,
      audioElementAttached: false,
      canPlaybackAudio: true,
    });
    const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
    const [isFlippingCamera, setIsFlippingCamera] = useState<boolean>(false);
    const [isHostMicMuted, setIsHostMicMuted] = useState<boolean>(false);
    const [isLivePaused, setIsLivePaused] = useState<boolean>(false);

    const handleFlipCamera = async () => {
      setIsFlippingCamera(true);
      try {
        const next = await switchLiveKitCamera();
        if (next) {
          setFacingMode(next);
        }
      } catch (e) {
        console.warn("Flip error:", e);
      } finally {
        setIsFlippingCamera(false);
      }
    };

    const handleToggleHostMic = () => {
      const nextMuted = !isHostMicMuted;
      setIsHostMicMuted(nextMuted);
      setLiveKitMicMuted(nextMuted);
    };

    const handleToggleLivePause = () => {
      const nextPaused = !isLivePaused;
      setIsLivePaused(nextPaused);
      setLiveKitCameraMuted(nextPaused);
      setLiveKitMicMuted(nextPaused ? true : isHostMicMuted);
    };

    // Cronómetro en vivo de la transmisión
    useEffect(() => {
      const updateClock = () => {
        const diff = Math.max(
          0,
          Math.floor(
            (Date.now() - new Date(session.startedAt).getTime()) / 1000
          )
        );
        setElapsedSeconds(diff);
      };
      updateClock();
      const interval = setInterval(updateClock, 1000);
      return () => clearInterval(interval);
    }, [session.startedAt]);

    const handleUnlockAudio = async () => {
      try {
        await startLiveKitAudio();
        if (remoteAudioRef.current) {
          remoteAudioRef.current.muted = false;
          remoteAudioRef.current.volume = 1.0;
          void remoteAudioRef.current.play().catch(() => {});
        }
        setIsAudioBlocked(false);
        setAudioDiag((prev) => ({ ...prev, canPlaybackAudio: true }));
      } catch {
        // Ignorar
      }
    };

    // =========================================================================
    // 1. CONEXIÓN REAL CON LIVEKIT CLOUD WEBRTC (CALIDAD REAL HD 30-60 FPS)
    // =========================================================================
    useEffect(() => {
      if (!isLiveKitMode) return;
      let cancelled = false;

      connectToLiveKitRoom({
        roomName: session.roomId,
        participantId: isHostWindow
          ? session.hostId
          : `${currentUser?.id || "viewer"}-${Date.now().toString(36)}`,
        participantName: isHostWindow
          ? session.hostDisplayName
          : (currentUser?.displayName || "Espectador NOVA"),
        isHost: isHostWindow,
        cameraEnabled: session.hostCameraEnabled,
        onVideoTrackSubscribed: (track) => {
          if (cancelled) return;
          if (remoteVideoRef.current) {
            track.attach(remoteVideoRef.current);
            remoteVideoRef.current.muted = true;
            remoteVideoRef.current.playsInline = true;
            void remoteVideoRef.current.play().catch(() => {});
            setHasRemoteLiveKitVideo(true);
            setCameraStatusMsg("Video WebRTC en vivo recibido de LiveKit Cloud");
          }
        },
        onAudioTrackSubscribed: (track) => {
          if (cancelled) return;
          console.log("[LiveVideoStage] Audio track recibido de LiveKit:", track.sid);
          setAudioDiag((prev) => ({ ...prev, audioTrackReceived: true }));
          if (remoteAudioRef.current) {
            remoteAudioRef.current.muted = false;
            remoteAudioRef.current.volume = 1.0;
            track.attach(remoteAudioRef.current);
            setAudioDiag((prev) => ({ ...prev, audioElementAttached: true }));
            void remoteAudioRef.current.play().catch(() => {
              setIsAudioBlocked(true);
              setAudioDiag((prev) => ({ ...prev, canPlaybackAudio: false }));
            });
          }
        },
        onAudioBlocked: (blocked) => {
          if (!cancelled) {
            setIsAudioBlocked(blocked);
            setAudioDiag((prev) => ({ ...prev, canPlaybackAudio: !blocked }));
          }
        },
        onDonationAlert: (alert) => {
          if (!cancelled && alert) {
            console.log("[LiveVideoStage] Alerta de regalo recibida en vivo:", alert);
            enqueueDonationAlert(alert as DonationAlertEvent);
          }
        },
        onStatusChange: (status) => {
          if (!cancelled) setCameraStatusMsg(status);
        },
      }).then((res) => {
        if (cancelled || !res) return;
        if (isHostWindow) {
          setAudioDiag((prev) => ({ ...prev, audioPublished: true }));
          const localTrack = getLocalLiveKitVideoTrack();
          if (localTrack && localVideoRef.current) {
            const el = localVideoRef.current;
            el.muted = true;
            el.setAttribute("playsinline", "true");
            el.setAttribute("webkit-playsinline", "true");
            localTrack.attach(el);
            if (!el.srcObject && localTrack.mediaStreamTrack) {
              el.srcObject = new MediaStream([localTrack.mediaStreamTrack]);
            }
            void el.play().catch(() => {});
            setCameraStatusMsg(
              "🔴 Transmitiendo cámara y voz a LiveKit Cloud (HD WebRTC Real)"
            );
          }
        }
      });

      return () => {
        cancelled = true;
      };
    }, [
      isLiveKitMode,
      isHostWindow,
      session.hostCameraEnabled,
      session.hostDisplayName,
      session.hostId,
      session.roomId,
    ]);

    // Vista previa inmediata de la cámara local del anfitrión (cero pantalla negra mientras conecta LiveKit)
    useEffect(() => {
      if (!isHostWindow) return;
      let active = true;

      const setupImmediateCamera = async () => {
        try {
          const el = localVideoRef.current;
          if (!el) return;
          el.muted = true;
          el.setAttribute("playsinline", "true");
          el.setAttribute("webkit-playsinline", "true");

          const existing = getLocalLiveKitVideoTrack();
          if (existing && existing.mediaStreamTrack) {
            existing.attach(el);
            if (!el.srcObject) {
              el.srcObject = new MediaStream([existing.mediaStreamTrack]);
            }
            void el.play().catch(() => {});
            return;
          }

          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
              audio: false,
            });
            if (!active) {
              stream.getTracks().forEach((t) => t.stop());
              return;
            }
            if (el && (!el.srcObject || el.paused)) {
              el.srcObject = stream;
              void el.play().catch(() => {});
            }
          }
        } catch (e) {
          console.warn("[LiveVideoStage] Vista previa inicial de cámara:", e);
        }
      };

      void setupImmediateCamera();
      return () => {
        active = false;
      };
    }, [isHostWindow, facingMode]);

    // Garantizar que la cámara local del anfitrión se mantenga acoplada y visible en pantalla (móvil y PC)
    useEffect(() => {
      if (!isHostWindow || !isLiveKitMode) return;
      const attachTimer = setInterval(() => {
        const localTrack = getLocalLiveKitVideoTrack();
        const el = localVideoRef.current;
        if (localTrack && el) {
          if (!el.srcObject || el.paused) {
            el.muted = true;
            el.setAttribute("playsinline", "true");
            el.setAttribute("webkit-playsinline", "true");
            localTrack.attach(el);
            if (!el.srcObject && localTrack.mediaStreamTrack) {
              el.srcObject = new MediaStream([localTrack.mediaStreamTrack]);
            }
            void el.play().catch(() => {});
          }
        }
      }, 700);

      return () => clearInterval(attachTimer);
    }, [isHostWindow, isLiveKitMode]);

    // =========================================================================
    // 2. MODO DEMOSTRACIÓN (FALLBACK): RELEVO DEMO DE CUADROS
    // SOLO activo si providerMode === "demo_webrtc". En LiveKit queda DESACTIVADO.
    // =========================================================================
    useEffect(() => {
      if (isLiveKitMode) return; // DESACTIVADO cuando LiveKit Cloud está activo
      if (!isHostWindow) return;
      if (typeof window === "undefined") return;

      let cancelled = false;
      let frameIntervalId: ReturnType<typeof setInterval> | null = null;
      let lastReacquireAt = 0;

      const videoBus =
        "BroadcastChannel" in window
          ? new BroadcastChannel(VIDEO_BUS_CHANNEL)
          : null;

      acquireHostCameraAndMicStream()
        .then((stream) => {
          if (cancelled) return;
          if (stream && localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            void localVideoRef.current.play().catch(() => {});
            setCameraStatusMsg(
              "Cámara y micrófono en vivo activos (Modo Demostración)"
            );
          } else {
            setCameraStatusMsg(
              "Permiso de cámara pendiente o cámara ocupada por otra app"
            );
          }
        })
        .catch(() => {
          if (!cancelled) {
            setCameraStatusMsg("Verifica el permiso de cámara del navegador");
          }
        });

      let tick = 0;
      frameIntervalId = setInterval(() => {
        if (cancelled) return;
        const videoEl = localVideoRef.current;
        const canvasEl = captureCanvasRef.current;
        if (!videoEl || !canvasEl) return;

        const existing = getExistingHostStream();
        if (existing) {
          const liveVideo = existing
            .getVideoTracks()
            .some((t) => t.readyState === "live");
          if (liveVideo) {
            if (videoEl.srcObject !== existing) {
              videoEl.srcObject = existing;
            }
            if (videoEl.paused) void videoEl.play().catch(() => {});
          } else if (Date.now() - lastReacquireAt > 3000) {
            lastReacquireAt = Date.now();
            acquireHostCameraAndMicStream()
              .then((s) => {
                if (!cancelled && s && localVideoRef.current) {
                  localVideoRef.current.srcObject = s;
                  void localVideoRef.current.play().catch(() => {});
                }
              })
              .catch(() => {});
          }
        }

        const ctx = canvasEl.getContext("2d");
        if (!ctx) return;

        tick += 1;
        const w = canvasEl.width;
        const h = canvasEl.height;

        if (videoEl.readyState >= 2 && videoEl.videoWidth > 0) {
          ctx.drawImage(videoEl, 0, 0, w, h);
        } else {
          return;
        }

        try {
          const dataUrl = canvasEl.toDataURL("image/jpeg", 0.6);
          if (videoBus) {
            videoBus.postMessage({
              type: "LIVE_VIDEO_FRAME",
              roomId: sessionRef.current.roomId,
              frame: dataUrl,
              timestamp: Date.now(),
            });
          }
          if (tick % 4 === 0) {
            void fetch("/api/live/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "VIDEO_FRAME",
                roomId: sessionRef.current.roomId,
                frame: dataUrl,
              }),
            }).catch(() => {});
          }
        } catch {
          // Ignorar
        }
      }, 65);

      return () => {
        cancelled = true;
        if (frameIntervalId) clearInterval(frameIntervalId);
        if (videoBus) videoBus.close();
      };
    }, [isHostWindow, isLiveKitMode, session.roomId]);

    // Escucha del espectador en Modo Demostración
    useEffect(() => {
      if (isLiveKitMode) return; // DESACTIVADO cuando LiveKit Cloud está activo
      if (isHostWindow) return;
      if (typeof window === "undefined") return;

      let videoBus: BroadcastChannel | null = null;
      if ("BroadcastChannel" in window) {
        videoBus = new BroadcastChannel(VIDEO_BUS_CHANNEL);
        videoBus.onmessage = (ev) => {
          const data = ev.data;
          if (data && data.type === "LIVE_VIDEO_FRAME" && data.frame) {
            setRemoteFrameDataUrl(data.frame);
          }
        };
      }

      const pollId = setInterval(() => {
        fetch("/api/live/sync", { cache: "no-store" })
          .then((r) => r.json())
          .then((store) => {
            if (store?.latestVideoFrame) {
              setRemoteFrameDataUrl(store.latestVideoFrame);
            }
          })
          .catch(() => {});
      }, 350);

      return () => {
        clearInterval(pollId);
        if (videoBus) videoBus.close();
      };
    }, [isHostWindow, isLiveKitMode, session.roomId]);

    const formatDuration = (secs: number) => {
      const mins = Math.floor(secs / 60)
        .toString()
        .padStart(2, "0");
      const rem = (secs % 60).toString().padStart(2, "0");
      return `${mins}:${rem}`;
    };

    return (
      <div className="glass-card-cyan rounded-3xl overflow-hidden border-2 border-neon-cyan/80 shadow-neon-cyan-lg">
        {/* Barra Superior de Estado WebRTC / Modo Demostración */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#061428]/95 px-4 py-2.5 border-b border-neon-cyan/35">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-magenta px-3 py-0.5 text-xs font-black uppercase tracking-wider text-white animate-soft-pulse">
              <span className="h-2 w-2 rounded-full bg-white" />
              EN VIVO • {formatDuration(elapsedSeconds)}
            </span>

            {isLiveKitMode ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-neon-emerald/70 bg-neon-emerald/20 px-2.5 py-0.5 text-[11px] font-black text-neon-emerald">
                <CheckCircle2 className="h-3.5 w-3.5 text-neon-emerald" />
                LIVEKIT CLOUD WEBRTC ACTIVO (CALIDAD REAL HD)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/60 bg-amber-400/15 px-2.5 py-0.5 text-[11px] font-black text-amber-200">
                <Sparkles className="h-3 w-3" />
                MODO DEMOSTRACIÓN (RELEVO DE CUADROS)
              </span>
            )}

            <span className="inline-flex items-center gap-1 rounded-full border border-neon-cyan/60 bg-neon-cyan/15 px-2.5 py-0.5 text-[11px] font-black text-neon-cyan">
              <ShieldCheck className="h-3.5 w-3.5" />
              CERO ESPEJO DE PANTALLA
            </span>
          </div>

          {/* Contador de Espectadores Presentes en Tiempo Real */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-neon-cyan bg-neon-cyan/20 px-3 py-1 text-xs font-black text-white shadow-neon-cyan">
              <Users className="h-4 w-4 text-neon-cyan" />
              <span>{session.viewersCount} presentes en la sala</span>
            </div>
          </div>
        </div>

        {/* Escenario Principal de Video en Tiempo Real */}
        <div
          onClick={() => {
            if (isAudioBlocked) void handleUnlockAudio();
          }}
          onTouchStart={() => {
            if (isAudioBlocked) void handleUnlockAudio();
          }}
          className="relative min-h-[380px] sm:min-h-[460px] aspect-video w-full bg-[#050414] overflow-hidden flex items-center justify-center"
        >
          {isHostWindow ? (
            <>
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`h-full w-full object-contain block ${
                  facingMode === "user" ? "scale-x-[-1]" : ""
                }`}
              />

              {/* Barra de Controles Táctiles Flotante del Anfitrión (Sin encimarse con la barra inferior) */}
              <div className="absolute bottom-24 sm:bottom-20 inset-x-2 sm:inset-x-4 z-30 flex flex-wrap items-center justify-center gap-2 pointer-events-auto">
                <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-black/75 p-1.5 border border-neon-cyan/40 backdrop-blur-md shadow-neon-cyan">
                  {/* 1. Cambiar Cámara */}
                  <button
                    type="button"
                    onClick={handleFlipCamera}
                    disabled={isFlippingCamera || isLivePaused}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neon-cyan/60 bg-space-950/90 px-3 py-1.5 text-[11px] sm:text-xs font-black text-white shadow hover:bg-neon-cyan/20 active:scale-95 transition cursor-pointer"
                    title="Cambiar entre cámara frontal y trasera"
                  >
                    <SwitchCamera
                      className={`h-3.5 w-3.5 text-neon-cyan ${
                        isFlippingCamera ? "animate-spin" : ""
                      }`}
                    />
                    <span>
                      {facingMode === "user" ? "Girar Cámara" : "Cámara Frontal"}
                    </span>
                  </button>

                  {/* 2. Silenciar / Reactivar Micrófono */}
                  <button
                    type="button"
                    onClick={handleToggleHostMic}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] sm:text-xs font-black shadow active:scale-95 transition cursor-pointer ${
                      isHostMicMuted
                        ? "border-rose-500 bg-rose-600 text-white animate-soft-pulse"
                        : "border-neon-cyan/60 bg-space-950/90 text-white hover:bg-neon-cyan/20"
                    }`}
                    title={isHostMicMuted ? "Reactivar micrófono" : "Silenciar micrófono"}
                  >
                    {isHostMicMuted ? (
                      <>
                        <MicOff className="h-3.5 w-3.5 text-rose-200" />
                        <span>Reactivar Mic</span>
                      </>
                    ) : (
                      <>
                        <Mic className="h-3.5 w-3.5 text-neon-cyan" />
                        <span>Silenciar Mic</span>
                      </>
                    )}
                  </button>

                  {/* 3. Pausar / Reanudar Transmisión */}
                  <button
                    type="button"
                    onClick={handleToggleLivePause}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] sm:text-xs font-black shadow active:scale-95 transition cursor-pointer ${
                      isLivePaused
                        ? "border-amber-400 bg-amber-500 text-slate-950 font-extrabold animate-pulse"
                        : "border-amber-400/60 bg-space-950/90 text-amber-300 hover:bg-amber-400/20"
                    }`}
                    title={isLivePaused ? "Reanudar transmisión" : "Pausar transmisión"}
                  >
                    {isLivePaused ? (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current text-slate-950" />
                        <span>Reanudar En Vivo</span>
                      </>
                    ) : (
                      <>
                        <Pause className="h-3.5 w-3.5 text-amber-300" />
                        <span>Pausar En Vivo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Overlay cuando el anfitrión pausa la transmisión */}
              {isLivePaused && (
                <div className="absolute inset-0 z-15 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-6 text-center space-y-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-amber-400 bg-amber-400/20 text-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.5)]">
                    <Pause className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white text-glow-amber">
                    TRANSMISIÓN EN PAUSA
                  </h3>
                  <p className="text-xs text-amber-200/90 max-w-sm">
                    Has pausado temporalmente el video y el micrófono. Pulsa &ldquo;Reanudar En Vivo&rdquo; abajo para continuar.
                  </p>
                </div>
              )}

              <canvas
                ref={captureCanvasRef}
                width={480}
                height={270}
                className="hidden"
              />
            </>
          ) : isLiveKitMode ? (
            <>
              {/* Espectador en LiveKit Cloud: Video HD nativo WebRTC */}
              {/* Siempre montado con playsInline y muted para permitir reproducción en iOS Safari, iPadOS, Android y PC */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-contain block"
              />
              {/* Audio remoto para escuchar al anfitrión y participantes */}
              <audio ref={remoteAudioRef} autoPlay />

              {/* Aviso claro para iOS Safari / Móviles cuando el navegador bloquea el audio (BUG 2) */}
              {isAudioBlocked && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleUnlockAudio();
                  }}
                  className="absolute top-14 inset-x-3 sm:inset-x-6 z-30 flex items-center justify-between gap-3 rounded-2xl border-2 border-neon-cyan bg-space-950/95 px-4 py-2.5 text-xs font-black text-neon-cyan shadow-[0_0_25px_rgba(0,240,255,0.45)] animate-pulse cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5 shrink-0 text-neon-cyan" />
                    <span>⚠️ Audio silenciado por Safari. Toca para escuchar:</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleUnlockAudio();
                    }}
                    className="btn-neon-cyan shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-black cursor-pointer shadow-neon-cyan"
                  >
                    🔊 Activar Audio
                  </button>
                </div>
              )}

              {!hasRemoteLiveKitVideo && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-2 bg-space-950/85 backdrop-blur-sm z-10">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-neon-cyan bg-neon-cyan/15 text-4xl shadow-neon-cyan animate-soft-pulse">
                    {session.hostAvatar}
                  </div>
                  <p className="text-base font-black text-white text-glow-cyan">
                    Conectando con la señal LiveKit Cloud de {session.hostDisplayName}...
                  </p>
                  <p className="text-xs text-cyan-200/80">
                    Sincronizando pista WebRTC de alta definición...
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const room = getActiveLiveKitRoom();
                      if (room) {
                        for (const p of room.remoteParticipants.values()) {
                          for (const pub of p.trackPublications.values()) {
                            if (
                              pub.track &&
                              pub.track.kind === "video" &&
                              remoteVideoRef.current
                            ) {
                              pub.track.attach(remoteVideoRef.current);
                              remoteVideoRef.current.muted = true;
                              remoteVideoRef.current.playsInline = true;
                              void remoteVideoRef.current.play().catch(() => {});
                              setHasRemoteLiveKitVideo(true);
                            }
                          }
                        }
                      }
                    }}
                    className="mt-3 rounded-xl border border-white/25 bg-space-900/90 px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:text-white hover:border-neon-cyan transition"
                  >
                    🔄 Reintentar conexión de video
                  </button>
                </div>
              )}
            </>
          ) : remoteFrameDataUrl ? (
            <img
              src={remoteFrameDataUrl}
              alt={`Cámara en vivo de ${session.hostDisplayName}`}
              className="h-full w-full object-cover block"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-neon-cyan bg-neon-cyan/15 text-4xl shadow-neon-cyan animate-soft-pulse">
                {session.hostAvatar}
              </div>
              <p className="text-base font-black text-white text-glow-cyan">
                Conectando con la cámara en vivo de {session.hostDisplayName}...
              </p>
            </div>
          )}

          {/* Badge superior izquierdo */}
          <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full border border-neon-emerald/70 bg-space-950/85 px-3 py-1 text-[11px] font-black text-neon-emerald shadow-neon-emerald">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            <span>
              {isHostWindow
                ? `EMITIENDO CÁMARA EN VIVO (@${session.hostUsername})`
                : `VIENDO CÁMARA EN VIVO DE @${session.hostUsername}`}
            </span>
          </div>

          {/* Indicador Discreto de Diagnóstico WebRTC de Audio (BUG 2) */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-2 rounded-full border border-white/20 bg-space-950/85 px-3 py-1 text-[10px] font-bold text-slate-300 backdrop-blur-md">
            <span title="Micrófono del anfitrión publicado en LiveKit">
              🎙️ Mic: {audioDiag.audioPublished || isHostWindow ? "✅ Sí" : "—"}
            </span>
            <span className="text-white/30">•</span>
            <span title="Pista de audio remota recibida en espectador">
              📡 Audio: {audioDiag.audioTrackReceived ? "✅ Sí" : isHostWindow ? "Anfitrión" : "Buscando..."}
            </span>
            <span className="text-white/30">•</span>
            <span title="Elemento de audio adjuntado al DOM">
              🔊 Altavoz: {audioDiag.audioElementAttached ? "✅ Sí" : isHostWindow ? "Monitor OFF" : "No"}
            </span>
          </div>

          {/* Superposición Inferior con Datos del Creador y Controles del Anfitrión */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-neon-cyan bg-space-950 text-2xl shadow-neon-cyan">
                {session.hostAvatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white text-glow-cyan">
                    {session.title}
                  </h2>
                  <span className="rounded-md bg-neon-violet/40 border border-neon-violet px-2 py-0.5 text-[10px] font-black uppercase text-fuchsia-100">
                    {session.hostTier === "titular" ? "TITULAR" : "LA CANTERA"}
                  </span>
                </div>
                <p className="text-xs font-bold text-cyan-200">
                  Anfitrión: {session.hostDisplayName} (@{session.hostUsername}) •{" "}
                  {isHostWindow ? (
                    <span className="text-neon-emerald">
                      Transmitiendo ({cameraStatusMsg})
                    </span>
                  ) : (
                    <span className="text-neon-cyan">
                      {isLiveKitMode
                        ? "Viendo en directo por LiveKit Cloud WebRTC"
                        : "Viendo cámara en tiempo real como espectador"}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {isHostWindow && onEndBroadcast && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onEndBroadcast}
                  className="rounded-xl border border-neon-magenta bg-neon-magenta px-4 py-2 text-xs font-black text-white shadow-neon-magenta hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
                >
                  <VideoOff className="h-4 w-4" />
                  <span>Terminar transmisión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
  (prev, next) =>
    prev.isHostWindow === next.isHostWindow &&
    prev.session.roomId === next.session.roomId &&
    prev.session.viewersCount === next.session.viewersCount &&
    prev.session.title === next.session.title &&
    prev.session.hostId === next.session.hostId &&
    prev.session.providerMode === next.session.providerMode
);
