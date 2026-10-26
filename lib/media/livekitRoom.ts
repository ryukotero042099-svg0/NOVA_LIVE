"use client";

import {
  Room,
  RoomEvent,
  VideoPresets,
  VideoQuality,
  createLocalVideoTrack,
  createLocalAudioTrack,
  type LocalVideoTrack,
  type LocalAudioTrack,
  type RemoteTrack,
  type RemoteTrackPublication,
  type RemoteParticipant,
} from "livekit-client";

export interface LiveKitConnectionOptions {
  roomName: string;
  participantId: string;
  participantName: string;
  isHost: boolean;
  cameraEnabled?: boolean;
  onVideoTrackSubscribed?: (track: RemoteTrack) => void;
  onAudioTrackSubscribed?: (track: RemoteTrack) => void;
  onSpeakingChange?: (isSpeaking: boolean) => void;
  onStatusChange?: (status: string) => void;
  onAudioBlocked?: (blocked: boolean) => void;
  onDonationAlert?: (alert: unknown) => void;
}

let activeRoom: Room | null = null;
let localVideoTrack: LocalVideoTrack | null = null;
let localAudioTrack: LocalAudioTrack | null = null;
let connectionPromise: Promise<{ room: Room; mode: "livekit_cloud" } | null> | null =
  null;

export interface LiveKitDiagnosticState {
  audioPublished: boolean;
  audioTrackReceived: boolean;
  audioElementAttached: boolean;
  canPlaybackAudio: boolean;
}

export const liveKitDiagState: LiveKitDiagnosticState = {
  audioPublished: false,
  audioTrackReceived: false,
  audioElementAttached: false,
  canPlaybackAudio: true,
};

function attachExistingRemoteTracks(
  room: Room,
  options: LiveKitConnectionOptions
) {
  try {
    room.remoteParticipants.forEach((participant) => {
      participant.trackPublications.forEach((pub) => {
        if (pub.isSubscribed && pub.track) {
          if (pub.track.kind === "video") {
            try {
              if ("setVideoQuality" in pub) {
                void (pub as any).setVideoQuality(VideoQuality.HIGH);
              }
            } catch {
              // Ignorar
            }
            options.onVideoTrackSubscribed?.(pub.track);
          } else if (pub.track.kind === "audio") {
            liveKitDiagState.audioTrackReceived = true;
            try {
              if ("setVolume" in pub.track) {
                (pub.track as any).setVolume(1.0);
              }
              const autoAttachedEl = pub.track.attach();
              if (autoAttachedEl) {
                autoAttachedEl.muted = false;
                autoAttachedEl.volume = 1.0;
                liveKitDiagState.audioElementAttached = true;
                void autoAttachedEl.play().catch(() => {
                  options.onAudioBlocked?.(true);
                });
              }
            } catch (e) {
              console.warn("Existing audio attach error:", e);
            }
            options.onAudioTrackSubscribed?.(pub.track);
          }
        }
      });
    });
  } catch {
    // Ignorar
  }
}

export async function broadcastLiveKitDonationAlert(
  alert: unknown
): Promise<boolean> {
  if (!activeRoom || !activeRoom.localParticipant) return false;
  try {
    const payload = new TextEncoder().encode(
      JSON.stringify({
        type: "DONATION_ALERT",
        alert,
      })
    );
    await activeRoom.localParticipant.publishData(payload, { reliable: true });
    return true;
  } catch (err) {
    console.warn("Error broadcasting donation alert via LiveKit:", err);
    return false;
  }
}

export async function startLiveKitAudio(): Promise<boolean> {
  if (!activeRoom) return false;
  try {
    await activeRoom.startAudio();
    liveKitDiagState.canPlaybackAudio = activeRoom.canPlaybackAudio;
    return true;
  } catch (err) {
    console.warn("Error unlocking LiveKit audio:", err);
    return false;
  }
}

export async function connectToLiveKitRoom(
  options: LiveKitConnectionOptions
): Promise<{ room: Room; mode: "livekit_cloud" } | null> {
  if (typeof window === "undefined") return null;

  if (activeRoom && activeRoom.state === "connected") {
    // Si ya está conectada la sala, re-suscribir pistas existentes inmediatamente
    attachExistingRemoteTracks(activeRoom, options);
    if (!activeRoom.canPlaybackAudio) {
      options.onAudioBlocked?.(true);
    }
    return { room: activeRoom, mode: "livekit_cloud" };
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    try {
      // 1. Obtener token firmado de nuestra API segura (el secreto nunca viaja al cliente)
      const res = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: options.roomName,
          participantId: options.participantId,
          participantName: options.participantName,
          isHost: options.isHost,
        }),
      });

      if (!res.ok) {
        options.onStatusChange?.("Error al solicitar token de LiveKit Cloud");
        return null;
      }

      const data = await res.json();
      if (data.mode !== "livekit_cloud" || !data.token || !data.wsUrl) {
        options.onStatusChange?.("LiveKit Cloud no configurado");
        return null;
      }

      options.onStatusChange?.("Conectando con LiveKit Cloud WebRTC...");

      const room = new Room({
        adaptiveStream: false, // Evita degradar agresivamente la calidad del video en pantallas retina
        dynacast: true,
        videoCaptureDefaults: {
          resolution: VideoPresets.h1080.resolution,
        },
      });

      // 2. Suscribirse a pistas remotas (los espectadores ven el video y escuchan la voz)
      room.on(
        RoomEvent.TrackSubscribed,
        (
          track: RemoteTrack,
          _publication: RemoteTrackPublication,
          _participant: RemoteParticipant
        ) => {
          if (track.kind === "video") {
            try {
              if (_publication && "setVideoQuality" in _publication) {
                void (_publication as any).setVideoQuality(VideoQuality.HIGH);
              }
            } catch {
              // Ignorar
            }
            options.onVideoTrackSubscribed?.(track);
          } else if (track.kind === "audio") {
            liveKitDiagState.audioTrackReceived = true;
            try {
              if ("setVolume" in track) {
                (track as any).setVolume(1.0);
              }
              const autoAttachedEl = track.attach();
              if (autoAttachedEl) {
                autoAttachedEl.muted = false;
                autoAttachedEl.volume = 1.0;
                liveKitDiagState.audioElementAttached = true;
                void autoAttachedEl.play().catch(() => {
                  options.onAudioBlocked?.(true);
                });
              }
            } catch (e) {
              console.warn("Audio auto-attach error:", e);
            }
            options.onAudioTrackSubscribed?.(track);
          }
        }
      );

      // Si se publica una pista y aún no está suscrita, suscribirse de inmediato
      room.on(RoomEvent.TrackPublished, (publication) => {
        if (!publication.isSubscribed) {
          void publication.setSubscribed(true);
        }
      });

      // Canal de datos WebRTC entre dispositivos: alertas de donación en tiempo real (BUG 3)
      room.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
        try {
          const text = new TextDecoder().decode(payload);
          const parsed = JSON.parse(text);
          if (parsed && parsed.type === "DONATION_ALERT" && parsed.alert) {
            console.log("[LiveKit Data] Alerta de donación recibida:", parsed.alert);
            options.onDonationAlert?.(parsed.alert);
          }
        } catch (e) {
          console.warn("LiveKit data parse warning:", e);
        }
      });

      // Detectar estado de reproducción de audio (iOS Safari exige interacción del usuario)
      room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
        liveKitDiagState.canPlaybackAudio = room.canPlaybackAudio;
        if (!room.canPlaybackAudio) {
          options.onAudioBlocked?.(true);
        } else {
          options.onAudioBlocked?.(false);
        }
      });

      // Detectar participantes hablando para los indicadores de voz
      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const isSpeaking = speakers.some(
          (s) => s.identity === options.participantId
        );
        options.onSpeakingChange?.(isSpeaking);
      });

      room.on(RoomEvent.Disconnected, () => {
        options.onStatusChange?.("Desconectado de LiveKit Cloud");
      });

      // 3. Conectar a la sala WebRTC en LiveKit Cloud
      await room.connect(data.wsUrl, data.token);
      activeRoom = room;

      // 4. Conectar pistas existentes si ya estaban publicadas
      attachExistingRemoteTracks(room, options);

      // Comprobar política de reproducción de audio (Safari/iOS)
      if (!room.canPlaybackAudio) {
        options.onAudioBlocked?.(true);
      }

      // 5. Si es Anfitrión, publicar cámara y micrófono como pistas WebRTC reales
      if (options.isHost) {
        try {
          if (options.cameraEnabled !== false) {
            const videoTrack = await createLocalVideoTrack({
              resolution: VideoPresets.h1080.resolution,
            });
            localVideoTrack = videoTrack;
            await room.localParticipant.publishTrack(videoTrack, {
              name: "camera",
              simulcast: true,
              videoCodec: "vp8", // Máxima compatibilidad cruzada con iOS Safari, Android y PC
              videoEncoding: {
                maxBitrate: 3_000_000, // 3 Mbps Full HD cristalina
                maxFramerate: 30,
              },
            });
          }

          // BUG 2 (a): Garantizar que la pista de micrófono se cree activa y desmutada
          const audioTrack = await createLocalAudioTrack({
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          });
          localAudioTrack = audioTrack;
          audioTrack.mediaStreamTrack.enabled = true;
          await audioTrack.unmute();

          const audioPub = await room.localParticipant.publishTrack(audioTrack, {
            name: "microphone",
          });
          liveKitDiagState.audioPublished = Boolean(audioPub && audioPub.track);
          console.log(
            "[LiveKit Host] Micrófono publicado exitosamente:",
            audioPub?.trackSid,
            "Activo:",
            audioTrack.mediaStreamTrack.enabled
          );

          options.onStatusChange?.(
            "🔴 Transmitiendo en VIVO con LiveKit Cloud (HD 720p Real)"
          );
        } catch (publishErr) {
          console.warn("LiveKit publish warning:", publishErr);
          liveKitDiagState.audioPublished = false;
        }
      } else {
        options.onStatusChange?.(
          "🟢 Conectado como Espectador a LiveKit Cloud (HD Real)"
        );
      }

      return { room, mode: "livekit_cloud" };
    } catch (err: unknown) {
      console.warn("LiveKit connection error:", err);
      const msg = err instanceof Error ? err.message : "Error WebRTC";
      options.onStatusChange?.(`Error LiveKit: ${msg}`);
      return null;
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
}

export function getActiveLiveKitRoom(): Room | null {
  return activeRoom;
}

export function getLocalLiveKitVideoTrack(): LocalVideoTrack | null {
  return localVideoTrack;
}

export function setLiveKitMicMuted(muted: boolean): void {
  if (localAudioTrack) {
    if (muted) {
      void localAudioTrack.mute();
    } else {
      void localAudioTrack.unmute();
    }
  }
}

export function setLiveKitCameraMuted(muted: boolean): void {
  if (localVideoTrack) {
    if (muted) {
      void localVideoTrack.mute();
    } else {
      void localVideoTrack.unmute();
    }
  }
}

export async function publishViewerMicToLiveKit(): Promise<LocalAudioTrack | null> {
  if (!activeRoom || activeRoom.state !== "connected") return null;
  if (localAudioTrack) {
    await localAudioTrack.unmute();
    return localAudioTrack;
  }
  try {
    const audioTrack = await createLocalAudioTrack({
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    });
    localAudioTrack = audioTrack;
    await activeRoom.localParticipant.publishTrack(audioTrack, {
      name: "viewer-microphone",
    });
    return audioTrack;
  } catch {
    return null;
  }
}

export function disconnectLiveKitRoom(): void {
  if (localVideoTrack) {
    try {
      localVideoTrack.stop();
    } catch {
      // Ignorar
    }
    localVideoTrack = null;
  }
  if (localAudioTrack) {
    try {
      localAudioTrack.stop();
    } catch {
      // Ignorar
    }
    localAudioTrack = null;
  }
  if (activeRoom) {
    try {
      activeRoom.disconnect();
    } catch {
      // Ignorar
    }
    activeRoom = null;
  }
  connectionPromise = null;
}
