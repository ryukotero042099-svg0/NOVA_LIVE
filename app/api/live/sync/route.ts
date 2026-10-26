import { NextResponse } from "next/server";
import {
  type UserProfile,
  type ActiveLiveSession,
  type BroadcastHistoryLog,
} from "@/lib/types";

interface ServerLiveStore {
  version: number;
  profiles: UserProfile[] | null;
  activeLiveSession: ActiveLiveSession | null;
  broadcastHistory: BroadcastHistoryLog[];
  latestVideoFrame: string | null;
  latestVoicePacket: {
    id: string;
    roomId: string;
    senderId: string;
    senderName: string;
    freq: number;
    text?: string;
    pcm?: number[];
    sampleRate?: number;
    ts: number;
    timestamp: number;
  } | null;
  latestDonationAlert?: {
    id: string;
    donorName: string;
    giftName: string;
    tier: string;
    amountNovas: number;
    timestamp: string;
    serverTimestamp: number;
    [key: string]: unknown;
  } | null;
  updatedAt: number;
}

const globalForNova = globalThis as unknown as {
  __novaLiveStore?: ServerLiveStore;
};

function sanitizeProfiles(
  profiles: UserProfile[] | null | undefined
): UserProfile[] | null {
  if (!profiles || !Array.isArray(profiles)) return null;
  return profiles.filter(
    (p) =>
      p &&
      p.id !== "user-cantera-casi-graduado" &&
      p.id !== "user-cantera-1" &&
      p.id !== "user-cantera-2" &&
      p.id !== "user-titular-1" &&
      p.id !== "user-titular-2" &&
      p.username !== "Luna_Gaming" &&
      p.username !== "Astro_Racer" &&
      p.username !== "Mateo_Cantera" &&
      p.username !== "Kael_Stream" &&
      p.username !== "Valeria_Titan"
  );
}

if (!globalForNova.__novaLiveStore) {
  globalForNova.__novaLiveStore = {
    version: 0,
    profiles: null,
    activeLiveSession: null,
    broadcastHistory: [],
    latestVideoFrame: null,
    latestVoicePacket: null,
    latestDonationAlert: null,
    updatedAt: Date.now(),
  };
}

export async function GET() {
  const store = globalForNova.__novaLiveStore!;
  if (store.profiles) {
    store.profiles = sanitizeProfiles(store.profiles);
  }
  if (store.activeLiveSession) {
    const isTestHost =
      store.activeLiveSession.hostId === "user-cantera-1" ||
      store.activeLiveSession.hostUsername === "Luna_Gaming";
    if (isTestHost) {
      store.activeLiveSession = null;
    }
  }
  return NextResponse.json(store, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function POST(request: Request) {
  try {
    const store = globalForNova.__novaLiveStore!;
    const body = await request.json();

    if (body.type === "FORCE_STOP_LIVE") {
      const currentHostId = store.activeLiveSession?.hostId;
      // Seguridad BUG 1: Solo el anfitrión dueño de la sala puede cortar la transmisión
      if (currentHostId && body.senderHostId && body.senderHostId !== currentHostId) {
        return NextResponse.json(
          { error: "Permiso denegado: Solo el anfitrión puede terminar la transmisión." },
          { status: 403 }
        );
      }

      store.version += 1;
      store.activeLiveSession = null;
      store.latestVideoFrame = null;
      store.latestVoicePacket = null;
      store.latestDonationAlert = null;
      if (Array.isArray(body.profiles)) {
        store.profiles = body.profiles.map((p: UserProfile) => ({
          ...p,
          isLive: false,
        }));
      } else if (store.profiles) {
        store.profiles = store.profiles.map((p) => ({ ...p, isLive: false }));
      }
      if (Array.isArray(body.broadcastHistory)) {
        store.broadcastHistory = body.broadcastHistory;
      }
      store.updatedAt = Date.now();
      return NextResponse.json({ ok: true, store });
    }

    // Sincronización oficial de toques de carrera: EL SERVIDOR DETERMINA EL GANADOR EN TIEMPO REAL
    if (body.type === "RACE_TAP" && body.userId) {
      const race = store.activeLiveSession?.activeRace;
      if (!race) {
        return NextResponse.json({ ok: false, error: "No hay carrera activa en el servidor" });
      }
      if (race.status === "racing") {
        const racer = race.racers.find((r) => r.id === body.userId);
        if (racer && racer.progress < 100) {
          const now = Date.now();
          // Cada toque verificado en el servidor incrementa el avance real (+5.0%)
          const newProgress = Math.min(100, Number((racer.progress + 5.0).toFixed(1)));
          racer.progress = newProgress;

          if (newProgress >= 100 && !racer.finishPlace) {
            if (!Array.isArray(race.podium)) race.podium = [];
            const nextPlace = race.podium.length + 1;
            racer.finishPlace = nextPlace;
            racer.finishedAtMs = now;
            race.podium.push({ ...racer });

            // El primer corredor que llegue a 100 en el servidor es el GANADOR OFICIAL
            if (!race.winner) {
              race.winner = { ...racer };
            }

            const humanRacers = race.racers.filter((r) => !r.isBot);
            const finishedHumans = race.racers.filter(
              (r) => !r.isBot && r.progress >= 100
            );
            if (finishedHumans.length >= humanRacers.length) {
              race.status = "finished";
            }
          }

          store.version += 1;
          store.updatedAt = now;
        }
      }
      return NextResponse.json({ ok: true, activeRace: race, store });
    }

    // BUG 3: Sincronización de alertas de regalo entre todos los dispositivos
    if (body.type === "DONATION_ALERT" && body.alert) {
      store.version += 1;
      store.latestDonationAlert = {
        ...body.alert,
        serverTimestamp: Date.now(),
      };
      store.updatedAt = Date.now();
      return NextResponse.json({ ok: true, store });
    }

    if (body.type === "SYNC_STATE") {
      store.version += 1;
      if (Array.isArray(body.profiles)) {
        store.profiles = sanitizeProfiles(body.profiles);
      }
      if (body.activeLiveSession !== undefined) {
        if (
          body.activeLiveSession &&
          (body.activeLiveSession.hostId === "user-cantera-1" ||
            body.activeLiveSession.hostUsername === "Luna_Gaming")
        ) {
          store.activeLiveSession = null;
        } else {
          store.activeLiveSession = body.activeLiveSession;
        }
        if (!store.activeLiveSession) {
          store.latestVideoFrame = null;
          store.latestVoicePacket = null;
        }
      }
      if (Array.isArray(body.broadcastHistory)) {
        store.broadcastHistory = body.broadcastHistory;
      }
      store.updatedAt = Date.now();
      return NextResponse.json({ ok: true, store });
    }

    if (body.type === "VIDEO_FRAME") {
      if (
        store.activeLiveSession &&
        body.roomId === store.activeLiveSession.roomId
      ) {
        store.latestVideoFrame = body.frame || null;
      }
      return NextResponse.json({ ok: true });
    }

    if (body.type === "VOICE_PACKET") {
      const now = Date.now();
      store.latestVoicePacket = {
        id: `${now}-${Math.random()}`,
        roomId: body.roomId,
        senderId: body.senderId,
        senderName: body.senderName,
        freq: body.freq || 440,
        text: body.text,
        pcm: Array.isArray(body.pcm) ? body.pcm : undefined,
        sampleRate: body.sampleRate || 44100,
        ts: now,
        timestamp: now,
      };
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true, store });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
