"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ShieldAlert,
  Radio,
  UserPlus,
  LogOut,
} from "lucide-react";
import { type ActiveLiveSession } from "@/lib/types";
import { useApp } from "@/context/AppContext";

interface VoiceChatBarProps {
  session: ActiveLiveSession;
}

const VOICE_AUDIO_BUS = "nova_live_voice_audio_bus_v5";

export function VoiceChatBar({ session }: VoiceChatBarProps) {
  const {
    currentUser,
    isHostWindow,
    joinLiveVoiceRoom,
    leaveLiveVoiceRoom,
    toggleParticipantMic,
    toggleHostMuteParticipant,
    setParticipantSpeakingState,
  } = useApp();

  const isHost = isHostWindow;

  // En una misma PC con 2 ventanas:
  // - La ventana del Anfitrión tiene el monitor local APAGADO por defecto (como en Twitch/Zoom) para NO duplicar el audio ni hacer eco.
  // - La ventana del Espectador tiene el altavoz de la sala ENCENDIDO por defecto para escuchar el En Vivo limpio.
  const [speakerEnabled, setSpeakerEnabled] = useState<boolean>(!isHostWindow);
  const speakerEnabledRef = useRef<boolean>(!isHostWindow);

  useEffect(() => {
    setSpeakerEnabled(!isHostWindow);
    speakerEnabledRef.current = !isHostWindow;
  }, [isHostWindow]);

  useEffect(() => {
    speakerEnabledRef.current = speakerEnabled;
    if (nativeAudioRef.current) {
      nativeAudioRef.current.muted = !speakerEnabled || !someoneElseMicOpen;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakerEnabled]);

  const [audioHint, setAudioHint] = useState<string>(
    "Audio WebRTC limpio con cancelación de eco activa (sin duplicación entre ventanas)."
  );

  const nativeAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const voiceBusRef = useRef<BroadcastChannel | null>(null);
  const lastHeardVoiceTsRef = useRef<number>(0);

  const myParticipant = session.voiceParticipants.find(
    (vp) => vp.id === currentUser.id
  );

  // Verificar si otra persona en la sala tiene el micrófono abierto
  const someoneElseMicOpen = session.voiceParticipants.some(
    (vp) => vp.id !== currentUser.id && vp.isMicOn && !vp.isMutedByHost
  );

  useEffect(() => {
    if (nativeAudioRef.current) {
      nativeAudioRef.current.muted = !speakerEnabled || !someoneElseMicOpen;
    }
  }, [speakerEnabled, someoneElseMicOpen]);

  const getOrCreateAudioContext = (): AudioContext | null => {
    if (typeof window === "undefined") return null;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === "suspended") {
        void audioCtxRef.current.resume().catch(() => {});
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  };

  // Reproducir tono suave y voz limpia (sin eco ni superposición) al pulsar "Hablar Ahora"
  const playCleanVoiceNotification = (freq?: number, spokenText?: string) => {
    const ctx = getOrCreateAudioContext();
    if (ctx) {
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq || 440, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.26);
      } catch {
        // Ignorar
      }
    }

    if (
      spokenText &&
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(spokenText);
        utter.lang = "es-MX";
        utter.rate = 1.02;
        utter.volume = 0.9;
        window.speechSynthesis.speak(utter);
      } catch {
        // Ignorar
      }
    }
  };

  // Bus para avisos puntuales entre ventanas (sin mandar buffers PCM cortados)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let bus: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      bus = new BroadcastChannel(VOICE_AUDIO_BUS);
      voiceBusRef.current = bus;

      bus.onmessage = (event) => {
        const msg = event.data;
        if (!msg || msg.roomId !== session.roomId) return;

        if (
          msg.type === "VOICE_TONE_PACKET" &&
          msg.senderId !== currentUser.id &&
          speakerEnabledRef.current
        ) {
          playCleanVoiceNotification(msg.freq, msg.text);
        }
      };
    }

    const pollId = setInterval(() => {
      fetch("/api/live/sync", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          const pkt = data?.latestVoicePacket;
          const pktTime = pkt?.ts || pkt?.timestamp || 0;
          if (
            pkt &&
            pkt.roomId === session.roomId &&
            pkt.senderId !== currentUser.id &&
            pktTime > lastHeardVoiceTsRef.current
          ) {
            lastHeardVoiceTsRef.current = pktTime;
            if (speakerEnabledRef.current) {
              playCleanVoiceNotification(pkt.freq, pkt.text);
            }
          }
        })
        .catch(() => {});
    }, 550);

    return () => {
      clearInterval(pollId);
      if (bus) bus.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.roomId, currentUser.id]);

  // ===========================================================================
  // STREAM DE AUDIO NATIVO LIMPIO (<audio>) EN LA VENTANA RECEPTORA (MODO DEMO)
  // En modo LiveKit Cloud, el audio viaja directamente por WebRTC en LiveVideoStage.
  // ===========================================================================
  useEffect(() => {
    if (session.providerMode === "livekit_cloud") {
      if (nativeAudioRef.current) {
        nativeAudioRef.current.srcObject = null;
      }
      return;
    }
    if (!speakerEnabled || !someoneElseMicOpen) {
      if (nativeAudioRef.current) {
        nativeAudioRef.current.srcObject = null;
      }
      return;
    }
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    )
      return;

    let cancelled = false;
    let audioStream: MediaStream | null = null;

    navigator.mediaDevices
      .getUserMedia({
        video: false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        audioStream = s;
        if (nativeAudioRef.current) {
          nativeAudioRef.current.srcObject = s;
          nativeAudioRef.current.muted = false;
          nativeAudioRef.current.volume = 0.85;
          void nativeAudioRef.current.play().catch(() => {});
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (nativeAudioRef.current) {
        nativeAudioRef.current.srcObject = null;
      }
      if (audioStream) {
        audioStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [speakerEnabled, someoneElseMicOpen]);

  const speakingCallbackRef = useRef(setParticipantSpeakingState);
  useEffect(() => {
    speakingCallbackRef.current = setParticipantSpeakingState;
  }, [setParticipantSpeakingState]);

  const pttTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (pttTimerRef.current) clearTimeout(pttTimerRef.current);
    };
  }, []);

  // ===========================================================================
  // MEDIDOR DE NIVEL DE VOZ DEL MICRÓFONO PROPIO (SOLO ANALYSER, CERO ECO LOCAL)
  // En el Anfitrión reutiliza el stream existente sin volver a pedir cámara
  // ===========================================================================
  useEffect(() => {
    if (!myParticipant || !myParticipant.isMicOn || myParticipant.isMutedByHost)
      return;

    let cancelled = false;
    let dedicatedAudioStream: MediaStream | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let micAudioCtx: AudioContext | null = null;

    const obtainAudioStream = async (): Promise<MediaStream | null> => {
      if (isHost) {
        const { acquireHostCameraAndMicStream } = await import(
          "@/lib/media/sharedStream"
        );
        const shared = await acquireHostCameraAndMicStream();
        if (shared && shared.getAudioTracks().length > 0) {
          return new MediaStream([shared.getAudioTracks()[0]]);
        }
      }
      if (
        typeof navigator !== "undefined" &&
        navigator.mediaDevices?.getUserMedia
      ) {
        const s = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        dedicatedAudioStream = s;
        return s;
      }
      return null;
    };

    obtainAudioStream()
      .then((audioStream) => {
        if (cancelled || !audioStream) return;
        if (audioStream.getAudioTracks().length === 0) return;

        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        micAudioCtx = new AudioCtx();
        const source = micAudioCtx.createMediaStreamSource(audioStream);
        const analyser = micAudioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        setAudioHint(
          isHost
            ? "🎙️ Transmitiendo tu voz limpia a los espectadores (Monitor local apagado para evitar eco en tu misma PC)."
            : "🎙️ Tu micrófono está abierto en la sala con cancelación de eco activa."
        );

        intervalId = setInterval(() => {
          if (cancelled) return;
          analyser.getByteFrequencyData(dataArray);
          const avg =
            dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
          const speakingNow = avg > 15;
          speakingCallbackRef.current(currentUser.id, speakingNow);
        }, 320);
      })
      .catch(() => {
        if (!cancelled) {
          setAudioHint(
            "Usa el botón 'Hablar Ahora (Probar Voz)' para enviar voz a la sala."
          );
        }
      });

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      if (dedicatedAudioStream) {
        dedicatedAudioStream.getTracks().forEach((t) => t.stop());
      }
      if (micAudioCtx) void micAudioCtx.close().catch(() => {});
    };
  }, [
    myParticipant?.id,
    myParticipant?.isMicOn,
    myParticipant?.isMutedByHost,
    currentUser.id,
    isHost,
  ]);

  const handlePushToTalkBurst = () => {
    if (!myParticipant) {
      joinLiveVoiceRoom();
      return;
    }
    if (myParticipant.isMutedByHost) return;
    if (!myParticipant.isMicOn) {
      toggleParticipantMic(currentUser.id);
    }

    const freq = isHost ? 440 : 528;
    const spokenText = isHost
      ? `Hola desde el en vivo de ${currentUser.displayName}`
      : `Hola, habla ${currentUser.displayName} desde la sala`;

    // Reproducir una sola vez limpia (speechSynthesis es global del navegador en la misma PC)
    playCleanVoiceNotification(freq, spokenText);

    speakingCallbackRef.current(currentUser.id, true);
    if (pttTimerRef.current) clearTimeout(pttTimerRef.current);
    pttTimerRef.current = setTimeout(() => {
      speakingCallbackRef.current(currentUser.id, false);
    }, 2000);
  };

  return (
    <div className="glass-card-violet rounded-3xl p-4 sm:p-5 space-y-4">
      {/* Elemento de audio nativo oculto para reproducción limpia sin cortes */}
      <audio ref={nativeAudioRef} autoPlay playsInline className="hidden" />

      {/* Cabecera de la Barra de Chat de Voz de La Sala */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neon-violet/30 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-neon-cyan animate-pulse" />
            <h3 className="text-base sm:text-lg font-black text-white text-glow-cyan">
              Chat de Voz de La Sala ({session.voiceParticipants.length}{" "}
              conectados)
            </h3>
          </div>
          <p className="text-xs text-cyan-100/90 mt-0.5">{audioHint}</p>
        </div>

        {/* Controles Personales de Voz para la Ventana Actual */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              getOrCreateAudioContext();
              setSpeakerEnabled((prev) => !prev);
            }}
            className={`rounded-2xl px-3.5 py-2 text-xs font-black flex items-center gap-1.5 transition ${
              speakerEnabled
                ? "border border-neon-emerald bg-neon-emerald/20 text-neon-emerald shadow-neon-emerald"
                : "border border-white/25 bg-space-900 text-slate-300"
            }`}
            title={
              isHost
                ? "En la ventana del anfitrión está apagado por defecto para no hacer eco con la ventana del espectador en la misma PC"
                : "Activar o silenciar el audio del en vivo en esta ventana"
            }
          >
            {speakerEnabled ? (
              <>
                <Volume2 className="h-4 w-4" />
                <span>
                  {isHost ? "Monitor Local: ON" : "Audio del Live: ACTIVO"}
                </span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4 text-amber-300" />
                <span>
                  {isHost
                    ? "Anti-Eco Activo (Escucha en Ventana 2)"
                    : "Audio Silenciado (Activar)"}
                </span>
              </>
            )}
          </button>

          {!myParticipant ? (
            <button
              type="button"
              onClick={() => {
                getOrCreateAudioContext();
                joinLiveVoiceRoom();
              }}
              className="btn-neon-cyan rounded-2xl px-4 py-2.5 text-xs font-black flex items-center gap-1.5"
            >
              <UserPlus className="h-4 w-4" />
              <span>Entrar al Chat de Voz (Solo Audio)</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={myParticipant.isMutedByHost}
                onClick={() => {
                  getOrCreateAudioContext();
                  toggleParticipantMic(currentUser.id);
                }}
                className={`rounded-2xl px-3.5 py-2 text-xs font-black flex items-center gap-1.5 transition ${
                  myParticipant.isMutedByHost
                    ? "border border-neon-magenta bg-neon-magenta/20 text-pink-200 cursor-not-allowed"
                    : myParticipant.isMicOn
                    ? "btn-neon-cyan"
                    : "border border-white/30 bg-space-900 text-slate-200 hover:border-neon-cyan"
                }`}
              >
                {myParticipant.isMicOn && !myParticipant.isMutedByHost ? (
                  <>
                    <Mic className="h-4 w-4" />
                    <span>Micrófono Abierto (Silenciar)</span>
                  </>
                ) : (
                  <>
                    <MicOff className="h-4 w-4 text-neon-magenta" />
                    <span>
                      {myParticipant.isMutedByHost
                        ? "Silenciado por Anfitrión"
                        : "Activar Mi Micrófono"}
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={myParticipant.isMutedByHost}
                onClick={handlePushToTalkBurst}
                className="btn-neon-violet rounded-2xl px-3.5 py-2 text-xs font-black flex items-center gap-1.5 disabled:opacity-40"
                title="Prueba de voz limpia sin eco"
              >
                <Radio className="h-4 w-4" />
                <span>Hablar Ahora (Probar Voz)</span>
              </button>

              {!isHost && (
                <button
                  type="button"
                  onClick={() => leaveLiveVoiceRoom(currentUser.id)}
                  className="rounded-xl border border-white/20 bg-space-900/90 px-2.5 py-2 text-xs font-bold text-slate-300 hover:text-white"
                  title="Salir del canal de voz"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Lista de Participantes Presentes en el Chat de Voz */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {session.voiceParticipants.map((vp) => {
          const isMe = vp.id === currentUser.id;
          const activeVoice = vp.isSpeaking && vp.isMicOn && !vp.isMutedByHost;

          return (
            <div
              key={vp.id}
              className={`rounded-2xl border p-3.5 flex items-center justify-between gap-2 transition-all ${
                activeVoice
                  ? "border-2 border-neon-cyan bg-neon-cyan/20 shadow-neon-cyan scale-[1.02]"
                  : vp.isMutedByHost
                  ? "border-neon-magenta/60 bg-neon-magenta/10"
                  : "border-white/15 bg-space-900/85"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-2xl ${
                    activeVoice
                      ? "border-neon-cyan bg-neon-cyan/25 shadow-neon-cyan"
                      : "border-white/20 bg-space-950"
                  }`}
                >
                  {vp.avatarUrl}
                  <span
                    className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-space-950 ${
                      vp.isMutedByHost || !vp.isMicOn
                        ? "bg-neon-magenta text-white"
                        : "bg-neon-emerald text-slate-950"
                    }`}
                  >
                    {vp.isMutedByHost || !vp.isMicOn ? (
                      <MicOff className="h-3 w-3" />
                    ) : (
                      <Mic className="h-3 w-3" />
                    )}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs sm:text-sm font-black text-white truncate">
                      {vp.displayName}
                    </p>
                    {isMe && (
                      <span className="rounded bg-neon-cyan/25 px-1.5 py-0.2 text-[9px] font-black text-neon-cyan">
                        TÚ
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-cyan-200 truncate">
                    @{vp.username} •{" "}
                    {vp.role === "anfitrion"
                      ? "Anfitrión (Video+Voz)"
                      : "Solo Voz"}
                  </p>
                  <p className="text-[10px] font-extrabold mt-0.5">
                    {vp.isMutedByHost ? (
                      <span className="text-neon-magenta">
                        🔇 Silenciado por el anfitrión
                      </span>
                    ) : activeVoice ? (
                      <span className="text-neon-cyan animate-pulse">
                        🔊 Hablando en vivo...
                      </span>
                    ) : vp.isMicOn ? (
                      <span className="text-neon-emerald">
                        🎙️ Micrófono abierto
                      </span>
                    ) : (
                      <span className="text-slate-400">Micrófono apagado</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Controles de Voz por Participante: Propio Micrófono o Silencio por Anfitrión */}
              <div className="flex items-center gap-1.5 shrink-0">
                {isMe && (
                  <button
                    type="button"
                    disabled={vp.isMutedByHost}
                    onClick={() => toggleParticipantMic(vp.id)}
                    className={`rounded-xl border px-2.5 py-1.5 text-[10px] font-black flex items-center gap-1 transition ${
                      vp.isMutedByHost
                        ? "border-neon-magenta/50 bg-neon-magenta/10 text-pink-300 cursor-not-allowed"
                        : vp.isMicOn
                        ? "border-neon-cyan bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30"
                        : "border-white/25 bg-space-950 text-slate-300 hover:border-neon-cyan"
                    }`}
                    title="Silenciar o activar tu micrófono"
                  >
                    {vp.isMicOn && !vp.isMutedByHost ? (
                      <>
                        <Mic className="h-3.5 w-3.5" />
                        <span>Silenciar</span>
                      </>
                    ) : (
                      <>
                        <MicOff className="h-3.5 w-3.5 text-neon-magenta" />
                        <span>Activar</span>
                      </>
                    )}
                  </button>
                )}

                {isHost && vp.id !== session.hostId && (
                  <button
                    type="button"
                    onClick={() => toggleHostMuteParticipant(vp.id)}
                    className={`rounded-xl border px-2.5 py-1.5 text-[10px] font-black flex items-center gap-1 transition ${
                      vp.isMutedByHost
                        ? "border-neon-emerald bg-neon-emerald/20 text-neon-emerald"
                        : "border-neon-magenta bg-neon-magenta/20 text-pink-200 hover:bg-neon-magenta/35"
                    }`}
                    title="Como anfitrión puedes silenciar o reactivar a cualquier participante de la sala"
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>
                      {vp.isMutedByHost ? "Quitar Silencio" : "Silenciar"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
