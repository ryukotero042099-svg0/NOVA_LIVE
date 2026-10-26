// Gestor del stream de Cámara + Micrófono para la ventana del Anfitrión.
// IMPORTANTE: Solo la ventana del Anfitrión abre la cámara física (video: true)
// para que en Windows la segunda ventana (Espectador) nunca bloquee ni robe la webcam.

let hostMediaStream: MediaStream | null = null;
let hostPendingPromise: Promise<MediaStream | null> | null = null;

export async function acquireHostCameraAndMicStream(): Promise<MediaStream | null> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return null;
  }

  if (
    hostMediaStream &&
    hostMediaStream.getVideoTracks().some((t) => t.readyState === "live")
  ) {
    return hostMediaStream;
  }

  if (hostPendingPromise) {
    return hostPendingPromise;
  }

  hostPendingPromise = (async () => {
    try {
      // Exactamente como funcionó la primera vez: video + audio directo del navegador
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      hostMediaStream = stream;
      return stream;
    } catch {
      try {
        const videoOnly = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        hostMediaStream = videoOnly;
        return videoOnly;
      } catch {
        return null;
      }
    } finally {
      hostPendingPromise = null;
    }
  })();

  return hostPendingPromise;
}

export function getExistingHostStream(): MediaStream | null {
  return hostMediaStream;
}

export function releaseSharedMediaStream(): void {
  if (hostMediaStream) {
    hostMediaStream.getTracks().forEach((t) => {
      try {
        t.stop();
      } catch {
        // Ignorar
      }
    });
    hostMediaStream = null;
  }
  hostPendingPromise = null;
}
