"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type UserProfile,
  type NovaGiftItem,
  type DonationAlertEvent,
  type NovaTransaction,
  type NovaPackage,
  type ModerationReport,
  type PasaleTuGenteRecommendation,
  type ActiveLiveSession,
  type BroadcastHistoryLog,
  type VoiceParticipant,
  type RaceParticipant,
  type LiveRaceState,
  type ImpostorPlayer,
  type ImpostorScoreEntry,
  type LiveImpostorState,
  type DefensePlayer,
  type LiveDefenseState,
  type TriviaPlayer,
  type LiveTriviaState,
  NOVA_ECONOMY_RULES,
  evaluateCreatorTier,
  getDonationAnimationTier,
} from "@/lib/types";
import {
  syncProfileToSupabaseIfConfigured,
  saveBroadcastToSupabaseIfConfigured,
  saveDonationToSupabaseIfConfigured,
} from "@/lib/supabase/client";
import {
  pickRandomImpostorWord,
  normalizeWordForComparison,
} from "@/lib/games/impostorWordBank";
import {
  createDefenseLobby,
  addDefensePlayer,
  startDefenseGame,
  rematchDefense,
  tickDefense,
  applyDefenseShot,
} from "@/lib/games/defendShipEngine";
import { shuffleQuestions } from "@/lib/games/triviaQuestionBank";

const INITIAL_PRESET_PROFILES: UserProfile[] = [
  {
    id: "user-cantera-casi-graduado",
    username: "Astro_Racer",
    displayName: "Astro Caos",
    email: "astro@novalive.es",
    avatarUrl: "⚡",
    bio: "¡En 99/100 seguidores! Con +1 seguidor me gradúo en vivo a Los Titulares.",
    createdAt: new Date(Date.now() - 19 * 86400000).toISOString(),
    accountAgeDays: 19,
    followersCount: 99,
    novaBalance: 2500,
    creatorEarningsUsd: 98.5,
    availableWithdrawUsd: 98.5,
    tier: "cantera",
    isLive: false,
    stripeConnectLinked: true,
  },
  {
    id: "user-cantera-1",
    username: "Luna_Gaming",
    displayName: "Luna Estelar",
    email: "luna@novalive.es",
    avatarUrl: "🚀",
    bio: "Creadora nueva en La Cantera. ¡Entra a conversar y jugar en mi sala!",
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    accountAgeDays: 8,
    followersCount: 34,
    novaBalance: 2500,
    creatorEarningsUsd: 18.48,
    availableWithdrawUsd: 18.48,
    tier: "cantera",
    isLive: false,
    stripeConnectLinked: false,
  },
  {
    id: "user-cantera-2",
    username: "Mateo_Cantera",
    displayName: "Mateo Nitro",
    email: "mateo@novalive.es",
    avatarUrl: "🦊",
    bio: "Sala abierta en La Cantera. ¡Chat de voz activo para todos!",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    accountAgeDays: 5,
    followersCount: 16,
    novaBalance: 1200,
    creatorEarningsUsd: 9.24,
    availableWithdrawUsd: 9.24,
    tier: "cantera",
    isLive: false,
    stripeConnectLinked: false,
  },
  {
    id: "user-titular-1",
    username: "Kael_Stream",
    displayName: "Kael Supernova",
    email: "kael@novalive.es",
    avatarUrl: "👑",
    bio: "Anfitrión de La Sala en Los Titulares.",
    createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
    accountAgeDays: 120,
    followersCount: 1420,
    novaBalance: 5000,
    creatorEarningsUsd: 840.0,
    availableWithdrawUsd: 165.0,
    tier: "titular",
    isLive: false,
    stripeConnectLinked: true,
  },
  {
    id: "user-titular-2",
    username: "Valeria_Titan",
    displayName: "Valeria Titán",
    email: "valeria@novalive.es",
    avatarUrl: "🐉",
    bio: "Creadora Titular de historias interactivas y salas de voz.",
    createdAt: new Date(Date.now() - 95 * 86400000).toISOString(),
    accountAgeDays: 95,
    followersCount: 685,
    novaBalance: 3400,
    creatorEarningsUsd: 412.5,
    availableWithdrawUsd: 88.0,
    tier: "titular",
    isLive: false,
    stripeConnectLinked: true,
  },
];

interface CreateProfileInput {
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  bio: string;
}

interface AppContextValue {
  currentUser: UserProfile;
  profiles: UserProfile[];
  transactions: NovaTransaction[];
  activeDonationAlert: DonationAlertEvent | null;
  enqueueDonationAlert: (alert: DonationAlertEvent) => void;
  dismissDonationAlert: () => void;
  graduationCelebrationUser: UserProfile | null;
  dismissGraduationCelebration: () => void;
  activeRecommendation: PasaleTuGenteRecommendation | null;
  dismissRecommendation: () => void;
  triggerPasaleTuGente: (
    fromTitularId: string,
    toCanteraId: string,
    customMessage?: string
  ) => void;
  // Paso 5: Video en Vivo y Chat de Voz Integrado
  windowInstanceId: string;
  isHostWindow: boolean;
  activeLiveSession: ActiveLiveSession | null;
  broadcastHistory: BroadcastHistoryLog[];
  startLiveBroadcast: (
    title: string,
    providerMode: "livekit_cloud" | "demo_webrtc",
    hostCameraEnabled: boolean
  ) => void;
  endLiveBroadcast: () => BroadcastHistoryLog | null;
  joinLiveVoiceRoom: (userOverride?: UserProfile) => void;
  leaveLiveVoiceRoom: (userId?: string) => void;
  toggleParticipantMic: (participantId: string) => void;
  toggleHostMuteParticipant: (participantId: string) => void;
  setParticipantSpeakingState: (
    participantId: string,
    isSpeaking: boolean
  ) => void;
  // Paso 6: Minijuego CARRERAS dentro de La Sala
  openLiveRaceLobby: () => void;
  joinLiveRace: () => void;
  startLiveRaceCountdown: () => void;
  boostMyRacer: () => void;
  closeLiveRaceToRoom: () => void;
  // Paso 6.7: Juego de sala EL IMPOSTOR
  openImpostorLobby: () => void;
  joinImpostorGame: () => void;
  startImpostorRound: () => void;
  passImpostorTurn: () => void;
  castImpostorVote: (targetPlayerId: string) => void;
  resolveImpostorVotes: () => void;
  submitImpostorWordGuess: (guessedWord: string) => void;
  nextImpostorRound: () => void;
  closeImpostorToRoom: () => void;
  getMyImpostorSeat: () => ImpostorPlayer | null;
  // Paso 6.8: Juego cooperativo DEFIENDE LA NAVE
  openDefenseLobby: () => void;
  joinDefenseGame: () => void;
  startDefenseMatch: () => void;
  sendDefenseShot: (shot: {
    gameId: string;
    playerId: string;
    asteroidId: string;
    support: boolean;
    inZone: boolean;
  }) => void;
  defenseRematchAction: () => void;
  closeDefenseToRoom: () => void;
  getMyDefenseSeat: () => DefensePlayer | null;
  // Minijuego Masivo: TRIVIA GALÁCTICA
  openTriviaLobby: () => void;
  joinTriviaGame: () => void;
  startTriviaMatch: () => void;
  submitTriviaAnswer: (optionIndex: 0 | 1 | 2 | 3) => void;
  triviaRematchAction: () => void;
  closeTriviaToRoom: () => void;
  getMyTriviaSeat: () => TriviaPlayer | null;
  pingTriviaTimerSync: () => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  createCustomProfile: (input: CreateProfileInput) => UserProfile;
  updateCurrentProfile: (updates: Partial<CreateProfileInput>) => void;
  switchProfile: (profileId: string) => void;
  sendGift: (
    gift: NovaGiftItem,
    customDonorName?: string,
    recipientCreatorName?: string,
    recipientCreatorId?: string
  ) => { ok: boolean; error?: string };
  purchasePackage: (pkg: NovaPackage) => void;
  addTestNovas: (amount: number) => void;
  linkStripeConnect: () => void;
  withdrawCreatorEarnings: () => {
    ok: boolean;
    withdrawnUsd?: number;
    error?: string;
  };
  simulateGainFollower: () => void;
  simulateGainFollowerForCreator: (creatorId: string) => void;
  resetAstroCaosTo99: () => void;
  blockedUsernames: string[];
  blockUsername: (username: string) => void;
  unblockUsername: (username: string) => void;
  reports: ModerationReport[];
  submitReport: (
    targetUsername: string,
    reason: ModerationReport["reason"],
    details: string
  ) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const STORAGE_KEY_PROFILES = "nova_live_profiles_v5";
const SESSION_KEY_CURRENT_ID = "nova_live_tab_user_id_v5";
const SESSION_KEY_WINDOW_ID = "nova_live_window_instance_id_v5";
const STORAGE_KEY_TX = "nova_live_transactions_v5";
const STORAGE_KEY_LIVE_SESSION = "nova_live_active_session_v5";
const STORAGE_KEY_BROADCAST_HISTORY = "nova_live_broadcast_history_v5";
const SYNC_CHANNEL_NAME = "nova_live_state_sync_v5";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<UserProfile[]>(
    INITIAL_PRESET_PROFILES
  );
  const [currentUserId, setCurrentUserId] = useState<string>(
    INITIAL_PRESET_PROFILES[1].id // Luna_Gaming por defecto
  );
  const [windowInstanceId, setWindowInstanceId] = useState<string>("win-init");
  const [transactions, setTransactions] = useState<NovaTransaction[]>([
    {
      id: "tx-init-1",
      userId: "user-cantera-1",
      type: "package_purchase",
      title: "Bono de Bienvenida Modo Prueba (2,500 NOVAS)",
      amountNovas: 2500,
      amountUsd: 0,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      status: "completado",
    },
  ]);
  const [activeLiveSession, setActiveLiveSession] =
    useState<ActiveLiveSession | null>(null);
  const [broadcastHistory, setBroadcastHistory] = useState<
    BroadcastHistoryLog[]
  >([]);
  const [activeDonationAlert, setActiveDonationAlert] =
    useState<DonationAlertEvent | null>(null);
  const [alertQueue, setAlertQueue] = useState<DonationAlertEvent[]>([]);
  const alertQueueRef = useRef<DonationAlertEvent[]>([]);
  const activeAlertRef = useRef<DonationAlertEvent | null>(null);
  const enqueueDonationAlertRef = useRef<((alert: DonationAlertEvent) => void) | null>(null);

  const [graduationCelebrationUser, setGraduationCelebrationUser] =
    useState<UserProfile | null>(null);
  const [activeRecommendation, setActiveRecommendation] =
    useState<PasaleTuGenteRecommendation | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [blockedUsernames, setBlockedUsernames] = useState<string[]>([]);
  const [reports, setReports] = useState<ModerationReport[]>([]);

  const syncChannelRef = useRef<BroadcastChannel | null>(null);
  const isApplyingRemoteRef = useRef<boolean>(false);
  const liveSessionRef = useRef<ActiveLiveSession | null>(null);
  const profilesRef = useRef<UserProfile[]>(profiles);
  const historyRef = useRef<BroadcastHistoryLog[]>(broadcastHistory);
  const windowIdRef = useRef<string>("win-init");
  const currentUserIdRef = useRef<string>(currentUserId);
  const lastServerVersionRef = useRef<number>(0);
  const lastLocalBroadcastAtRef = useRef<number>(0);
  const handleDefenseMessageRef = useRef<((msg: any) => void) | null>(null);
  const handleTriviaMessageRef = useRef<((msg: any) => void) | null>(null);

  useEffect(() => {
    activeAlertRef.current = activeDonationAlert;
  }, [activeDonationAlert]);

  const processedAlertIdsRef = useRef<Set<string>>(new Set());

  const enqueueDonationAlert = (alert: DonationAlertEvent) => {
    if (
      processedAlertIdsRef.current.has(alert.id) ||
      activeAlertRef.current?.id === alert.id ||
      alertQueueRef.current.some((a) => a.id === alert.id)
    ) {
      return;
    }
    processedAlertIdsRef.current.add(alert.id);
    if (!activeAlertRef.current) {
      activeAlertRef.current = alert;
      setActiveDonationAlert(alert);
    } else {
      alertQueueRef.current = [...alertQueueRef.current, alert];
      setAlertQueue([...alertQueueRef.current]);
    }
  };

  enqueueDonationAlertRef.current = enqueueDonationAlert;

  const dismissDonationAlert = () => {
    if (alertQueueRef.current.length > 0) {
      const [nextAlert, ...remaining] = alertQueueRef.current;
      alertQueueRef.current = remaining;
      setAlertQueue(remaining);
      activeAlertRef.current = nextAlert;
      setActiveDonationAlert(nextAlert);
    } else {
      activeAlertRef.current = null;
      setActiveDonationAlert(null);
    }
  };

  useEffect(() => {
    liveSessionRef.current = activeLiveSession;
  }, [activeLiveSession]);

  useEffect(() => {
    profilesRef.current = profiles;
  }, [profiles]);

  useEffect(() => {
    historyRef.current = broadcastHistory;
  }, [broadcastHistory]);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  // Si otra ventana inicia una transmisión y esta ventana tenía el mismo usuario por defecto,
  // cambiamos automáticamente esta ventana a una segunda cuenta de prueba (ej. Mateo_Cantera)
  // para que funcione como Espectador de inmediato sin que el usuario tenga que cambiar cuenta manualmente.
  const ensureSpectatorAccountIfOtherWindowIsHost = (
    incomingSession: ActiveLiveSession | null
  ) => {
    if (!incomingSession) return;
    if (
      incomingSession.hostWindowId &&
      incomingSession.hostWindowId !== windowIdRef.current &&
      currentUserIdRef.current === incomingSession.hostId
    ) {
      const fallbackSpectator =
        profilesRef.current.find(
          (p) =>
            p.id !== incomingSession.hostId && p.id === "user-cantera-2"
        ) ||
        profilesRef.current.find((p) => p.id !== incomingSession.hostId);

      if (fallbackSpectator) {
        currentUserIdRef.current = fallbackSpectator.id;
        setCurrentUserId(fallbackSpectator.id);
        try {
          sessionStorage.setItem(SESSION_KEY_CURRENT_ID, fallbackSpectator.id);
        } catch {
          // Ignorar
        }
      }
    }
  };

  // Carga inicial desde almacenamiento local y de sesión (por pestaña)
  useEffect(() => {
    try {
      const savedProfiles = localStorage.getItem(STORAGE_KEY_PROFILES);
      const savedTx = localStorage.getItem(STORAGE_KEY_TX);
      const savedLive = localStorage.getItem(STORAGE_KEY_LIVE_SESSION);
      const savedHistory = localStorage.getItem(STORAGE_KEY_BROADCAST_HISTORY);

      const parsedLive = savedLive
        ? (JSON.parse(savedLive) as ActiveLiveSession)
        : null;

      // Si esta pestaña inició este roomId específico y se recargó con F5, conservar su hostWindowId
      const savedHostRoomId = sessionStorage.getItem("nova_host_room_id_v5");
      const winId =
        parsedLive &&
        parsedLive.hostWindowId &&
        savedHostRoomId === parsedLive.roomId
          ? parsedLive.hostWindowId
          : `win-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      windowIdRef.current = winId;
      setWindowInstanceId(winId);

      liveSessionRef.current = parsedLive;
      setActiveLiveSession(parsedLive);
      ensureSpectatorAccountIfOtherWindowIsHost(parsedLive);

      if (savedProfiles) {
        const parsed = JSON.parse(savedProfiles) as UserProfile[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const syncedProfiles = parsed.map((p) => ({
            ...p,
            isLive: parsedLive ? p.id === parsedLive.hostId : false,
          }));
          profilesRef.current = syncedProfiles;
          setProfiles(syncedProfiles);
        }
      }
      if (savedTx) {
        setTransactions(JSON.parse(savedTx));
      }
      if (savedHistory) {
        const parsedHist = JSON.parse(savedHistory) as BroadcastHistoryLog[];
        historyRef.current = parsedHist;
        setBroadcastHistory(parsedHist);
      }
    } catch {
      // Ignorar errores de lectura
    }
  }, []);

  // Canal de sincronización en tiempo real entre dos o más ventanas del navegador
  // (BroadcastChannel + Polling ligero a /api/live/sync para soportar Incógnito o navegadores distintos)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let channel: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      syncChannelRef.current = channel;

      channel.onmessage = (event) => {
        const msg = event.data;
        if (!msg || typeof msg !== "object") return;
        isApplyingRemoteRef.current = true;
        if (msg.type === "FORCE_STOP_LIVE") {
          // BUG 1: Solo obedecer FORCE_STOP_LIVE si proviene del anfitrión de la sala
          if (
            liveSessionRef.current &&
            msg.senderHostId &&
            msg.senderHostId !== liveSessionRef.current.hostId
          ) {
            console.warn("FORCE_STOP_LIVE ignorado: no fue emitido por el anfitrión.");
            isApplyingRemoteRef.current = false;
            return;
          }

          liveSessionRef.current = null;
          setActiveLiveSession(null);
          void import("@/lib/media/livekitRoom").then(
            ({ disconnectLiveKitRoom }) => disconnectLiveKitRoom()
          );
          if (msg.profiles) {
            profilesRef.current = msg.profiles;
            setProfiles(msg.profiles);
          }
          if (msg.broadcastHistory) {
            historyRef.current = msg.broadcastHistory;
            setBroadcastHistory(msg.broadcastHistory);
          }
        } else if (msg.type === "SYNC_STATE") {
          if (msg.profiles) {
            profilesRef.current = msg.profiles;
            setProfiles(msg.profiles);
          }
          if (msg.activeLiveSession !== undefined) {
            liveSessionRef.current = msg.activeLiveSession;
            setActiveLiveSession(msg.activeLiveSession);
            ensureSpectatorAccountIfOtherWindowIsHost(msg.activeLiveSession);
          }
          if (msg.broadcastHistory) {
            historyRef.current = msg.broadcastHistory;
            setBroadcastHistory(msg.broadcastHistory);
          }
        } else if (msg.type === "RACE_BOOST" && msg.userId) {
          const curSess = liveSessionRef.current;
          if (
            curSess &&
            curSess.activeRace &&
            curSess.activeRace.status === "racing"
          ) {
            const updatedRacers = curSess.activeRace.racers.map((r) =>
              r.id === msg.userId && r.progress < 100
                ? { ...r, progress: Math.min(99, r.progress + 6.5) }
                : r
            );
            const nextSess: ActiveLiveSession = {
              ...curSess,
              activeRace: {
                ...curSess.activeRace,
                racers: updatedRacers,
              },
            };
            liveSessionRef.current = nextSess;
            setActiveLiveSession(nextSess);
          }
        } else if (msg.type === "DEFENSE_JOIN" || msg.type === "DEFENSE_SHOT") {
          handleDefenseMessageRef.current?.(msg);
        } else if (msg.type === "TRIVIA_JOIN" || msg.type === "TRIVIA_ANSWER") {
          handleTriviaMessageRef.current?.(msg);
        } else if (msg.type === "DONATION_ALERT" && msg.alert) {
          enqueueDonationAlertRef.current?.(msg.alert);
        }
        setTimeout(() => {
          isApplyingRemoteRef.current = false;
        }, 40);
      };
    }

    const handleStorage = (e: StorageEvent) => {
      try {
        if (e.key === STORAGE_KEY_PROFILES && e.newValue) {
          isApplyingRemoteRef.current = true;
          const nextP = JSON.parse(e.newValue);
          profilesRef.current = nextP;
          setProfiles(nextP);
        } else if (e.key === STORAGE_KEY_LIVE_SESSION) {
          isApplyingRemoteRef.current = true;
          const nextL = e.newValue ? JSON.parse(e.newValue) : null;
          liveSessionRef.current = nextL;
          setActiveLiveSession(nextL);
          ensureSpectatorAccountIfOtherWindowIsHost(nextL);
        } else if (e.key === STORAGE_KEY_BROADCAST_HISTORY && e.newValue) {
          isApplyingRemoteRef.current = true;
          const nextH = JSON.parse(e.newValue);
          historyRef.current = nextH;
          setBroadcastHistory(nextH);
        }
      } catch {
        // Ignorar
      } finally {
        setTimeout(() => {
          isApplyingRemoteRef.current = false;
        }, 40);
      }
    };

    // Sincronización continua contra el servidor (/api/live/sync) cada 650ms
    // para que funcione incluso entre Ventana Normal + Ventana Incógnito o dos navegadores distintos
    const pollServerSync = setInterval(() => {
      // Si esta ventana acaba de emitir un cambio local hace menos de 1.2s, no sobrescribir con un poll antiguo
      if (Date.now() - lastLocalBroadcastAtRef.current < 1200) return;

      fetch("/api/live/sync", { cache: "no-store" })
        .then((r) => r.json())
        .then((serverStore) => {
          if (!serverStore || typeof serverStore.version !== "number") return;
          if (Date.now() - lastLocalBroadcastAtRef.current < 1200) return;
          if (
            serverStore.version > lastServerVersionRef.current ||
            Boolean(serverStore.activeLiveSession) !==
              Boolean(liveSessionRef.current)
          ) {
            lastServerVersionRef.current = serverStore.version;
            isApplyingRemoteRef.current = true;

            if (Array.isArray(serverStore.profiles)) {
              profilesRef.current = serverStore.profiles;
              setProfiles(serverStore.profiles);
            }
            if (serverStore.activeLiveSession !== undefined) {
              liveSessionRef.current = serverStore.activeLiveSession;
              setActiveLiveSession(serverStore.activeLiveSession);
              ensureSpectatorAccountIfOtherWindowIsHost(
                serverStore.activeLiveSession
              );
            }
            if (Array.isArray(serverStore.broadcastHistory)) {
              historyRef.current = serverStore.broadcastHistory;
              setBroadcastHistory(serverStore.broadcastHistory);
            }

            setTimeout(() => {
              isApplyingRemoteRef.current = false;
            }, 30);
          }

          // BUG 3: Si hay una alerta de regalo reciente en el servidor, encolarla
          if (serverStore.latestDonationAlert) {
            enqueueDonationAlertRef.current?.(
              serverStore.latestDonationAlert as DonationAlertEvent
            );
          }
        })
        .catch(() => {
          // Ignorar errores de red
        });
    }, 650);

    window.addEventListener("storage", handleStorage);
    return () => {
      clearInterval(pollServerSync);
      window.removeEventListener("storage", handleStorage);
      if (channel) channel.close();
    };
  }, []);

  // Guardar identidad de la ventana actual en sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY_CURRENT_ID, currentUserId);
    } catch {
      // Ignorar
    }
  }, [currentUserId]);

  // Persistir y transmitir cambios compartidos a las demás ventanas abiertas (y al servidor /api/live/sync)
  const broadcastSharedState = (
    nextProfiles: UserProfile[],
    nextLive: ActiveLiveSession | null,
    nextHistory: BroadcastHistoryLog[],
    forceStop = false
  ) => {
    try {
      lastLocalBroadcastAtRef.current = Date.now();
      lastServerVersionRef.current += 1;
      profilesRef.current = nextProfiles;
      liveSessionRef.current = nextLive;
      historyRef.current = nextHistory;

      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(nextProfiles));
      if (nextLive) {
        localStorage.setItem(
          STORAGE_KEY_LIVE_SESSION,
          JSON.stringify(nextLive)
        );
      } else {
        localStorage.removeItem(STORAGE_KEY_LIVE_SESSION);
      }
      localStorage.setItem(
        STORAGE_KEY_BROADCAST_HISTORY,
        JSON.stringify(nextHistory)
      );

      const payload = {
        type: forceStop ? "FORCE_STOP_LIVE" : "SYNC_STATE",
        senderHostId: (liveSessionRef.current || nextLive)?.hostId || currentUser.id,
        profiles: nextProfiles,
        activeLiveSession: nextLive,
        broadcastHistory: nextHistory,
      };

      if (syncChannelRef.current && !isApplyingRemoteRef.current) {
        syncChannelRef.current.postMessage(payload);
      }

      void fetch("/api/live/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res?.store?.version) {
            lastServerVersionRef.current = Math.max(
              lastServerVersionRef.current,
              res.store.version
            );
          }
        })
        .catch(() => {});
    } catch {
      // Ignorar
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(transactions));
    } catch {
      // Ignorar
    }
  }, [transactions]);

  const currentUser =
    profiles.find((p) => p.id === currentUserId) || profiles[0];

  const isHostWindow = Boolean(
    activeLiveSession &&
      (activeLiveSession.hostWindowId === windowInstanceId ||
        activeLiveSession.hostId === currentUser.id)
  );

  // =========================================================================
  // PASO 5: FUNCIONES DE VIDEO EN VIVO Y CHAT DE VOZ DE LA SALA
  // =========================================================================
  const startLiveBroadcast = (
    title: string,
    providerMode: "livekit_cloud" | "demo_webrtc",
    hostCameraEnabled: boolean
  ) => {
    const hostParticipant: VoiceParticipant = {
      id: currentUser.id,
      username: currentUser.username,
      displayName: currentUser.displayName,
      avatarUrl: currentUser.avatarUrl,
      role: "anfitrion",
      hasCamera: hostCameraEnabled,
      isMicOn: true,
      isMutedByHost: false,
      isSpeaking: false,
      joinedAt: new Date().toISOString(),
    };

    const newSession: ActiveLiveSession = {
      roomId: `sala-${currentUser.username.toLowerCase()}-${Date.now()}`,
      roomCode: "NOVA05",
      title:
        title.trim() ||
        `En Vivo de ${currentUser.displayName} (@${currentUser.username})`,
      hostId: currentUser.id,
      hostWindowId: windowIdRef.current,
      hostUsername: currentUser.username,
      hostDisplayName: currentUser.displayName,
      hostAvatar: currentUser.avatarUrl,
      hostTier: currentUser.tier,
      startedAt: new Date().toISOString(),
      viewersCount: 1,
      peakViewers: 1,
      providerMode,
      hostCameraEnabled,
      voiceParticipants: [hostParticipant],
    };

    const nextProfiles = profilesRef.current.map((p) => ({
      ...p,
      isLive: p.id === currentUser.id,
    }));

    try {
      sessionStorage.setItem("nova_host_room_id_v5", newSession.roomId);
    } catch {
      // Ignorar
    }

    liveSessionRef.current = newSession;
    profilesRef.current = nextProfiles;
    setProfiles(nextProfiles);
    setActiveLiveSession(newSession);
    broadcastSharedState(nextProfiles, newSession, historyRef.current, false);
  };

  const endLiveBroadcast = (): BroadcastHistoryLog | null => {
    const currentSession = liveSessionRef.current || activeLiveSession;
    if (!currentSession) return null;

    // SEGURIDAD BUG 1: Solo el anfitrión dueño de la sala puede terminar la transmisión
    const isOwner = currentUser.id === currentSession.hostId || isHostWindow;
    if (!isOwner) {
      console.warn(
        "Permiso denegado: Solo el anfitrión puede terminar la transmisión."
      );
      return null;
    }

    // Apagar inmediatamente el ref para que ningún intervalo de voz vuelva a revivir la sesión
    liveSessionRef.current = null;
    try {
      sessionStorage.removeItem("nova_host_room_id_v5");
    } catch {
      // Ignorar
    }
    void import("@/lib/media/sharedStream").then(({ releaseSharedMediaStream }) =>
      releaseSharedMediaStream()
    );
    void import("@/lib/media/livekitRoom").then(({ disconnectLiveKitRoom }) =>
      disconnectLiveKitRoom()
    );

    const nextProfiles = profilesRef.current.map((p) => ({
      ...p,
      isLive: false,
    }));

    if (!currentSession) {
      setProfiles(nextProfiles);
      setActiveLiveSession(null);
      broadcastSharedState(nextProfiles, null, historyRef.current, true);
      return null;
    }

    const endedAt = new Date().toISOString();
    const durationSeconds = Math.max(
      1,
      Math.round(
        (Date.now() - new Date(currentSession.startedAt).getTime()) / 1000
      )
    );

    const logItem: BroadcastHistoryLog = {
      id: `hist-${Date.now()}`,
      hostId: currentSession.hostId,
      hostUsername: currentSession.hostUsername,
      hostDisplayName: currentSession.hostDisplayName,
      title: currentSession.title,
      startedAt: currentSession.startedAt,
      endedAt,
      durationSeconds,
      peakViewers: currentSession.peakViewers,
      providerMode: currentSession.providerMode,
    };

    const nextHistory = [logItem, ...historyRef.current];

    profilesRef.current = nextProfiles;
    historyRef.current = nextHistory;
    setProfiles(nextProfiles);
    setActiveLiveSession(null);
    setBroadcastHistory(nextHistory);
    broadcastSharedState(nextProfiles, null, nextHistory, true);
    void saveBroadcastToSupabaseIfConfigured(logItem);
    return logItem;
  };

  const joinLiveVoiceRoom = (userOverride?: UserProfile) => {
    const session = liveSessionRef.current;
    if (!session) return;
    ensureSpectatorAccountIfOtherWindowIsHost(session);
    const participantUser =
      userOverride ||
      profilesRef.current.find((p) => p.id === currentUserIdRef.current) ||
      currentUser;

    const alreadyIn = session.voiceParticipants.some(
      (vp) => vp.id === participantUser.id
    );
    if (alreadyIn) return;

    const newParticipant: VoiceParticipant = {
      id: participantUser.id,
      username: participantUser.username,
      displayName: participantUser.displayName,
      avatarUrl: participantUser.avatarUrl,
      role:
        participantUser.id === session.hostId ? "anfitrion" : "espectador_voz",
      hasCamera: false,
      isMicOn: participantUser.id === session.hostId,
      isMutedByHost: false,
      isSpeaking: false,
      joinedAt: new Date().toISOString(),
    };

    const nextParticipants = [...session.voiceParticipants, newParticipant];
    const nextViewers = nextParticipants.length;
    const nextPeak = Math.max(session.peakViewers, nextViewers);

    const nextSession: ActiveLiveSession = {
      ...session,
      viewersCount: nextViewers,
      peakViewers: nextPeak,
      voiceParticipants: nextParticipants,
    };

    liveSessionRef.current = nextSession;
    setActiveLiveSession(nextSession);
    broadcastSharedState(
      profilesRef.current,
      nextSession,
      historyRef.current,
      false
    );
  };

  const leaveLiveVoiceRoom = (userId?: string) => {
    const session = liveSessionRef.current;
    if (!session) return;
    const targetId = userId || currentUser.id;
    const nextParticipants = session.voiceParticipants.filter(
      (vp) => vp.id !== targetId
    );
    const nextViewers = Math.max(1, nextParticipants.length);
    const nextSession: ActiveLiveSession = {
      ...session,
      viewersCount: nextViewers,
      voiceParticipants: nextParticipants,
    };
    liveSessionRef.current = nextSession;
    setActiveLiveSession(nextSession);
    broadcastSharedState(
      profilesRef.current,
      nextSession,
      historyRef.current,
      false
    );
  };

  const toggleParticipantMic = (participantId: string) => {
    const session = liveSessionRef.current;
    if (!session) return;
    let nextMicTarget = false;
    const nextParticipants = session.voiceParticipants.map((vp) => {
      if (vp.id !== participantId) return vp;
      if (vp.isMutedByHost) return vp;
      const nextMic = !vp.isMicOn;
      nextMicTarget = nextMic;
      return {
        ...vp,
        isMicOn: nextMic,
        isSpeaking: nextMic ? vp.isSpeaking : false,
      };
    });
    const nextSession: ActiveLiveSession = {
      ...session,
      voiceParticipants: nextParticipants,
    };
    liveSessionRef.current = nextSession;
    setActiveLiveSession(nextSession);
    broadcastSharedState(
      profilesRef.current,
      nextSession,
      historyRef.current,
      false
    );

    // En LiveKit Cloud: silenciar o desilenciar la pista de audio WebRTC real
    if (
      participantId === currentUser.id &&
      session.providerMode === "livekit_cloud"
    ) {
      void import("@/lib/media/livekitRoom").then(
        ({ setLiveKitMicMuted, publishViewerMicToLiveKit }) => {
          if (nextMicTarget) {
            void publishViewerMicToLiveKit().then(() =>
              setLiveKitMicMuted(false)
            );
          } else {
            setLiveKitMicMuted(true);
          }
        }
      );
    }
  };

  const toggleHostMuteParticipant = (participantId: string) => {
    const session = liveSessionRef.current;
    if (!session) return;
    let targetMuted = false;
    const nextParticipants = session.voiceParticipants.map((vp) => {
      if (vp.id !== participantId) return vp;
      const nextMutedByHost = !vp.isMutedByHost;
      targetMuted = nextMutedByHost;
      return {
        ...vp,
        isMutedByHost: nextMutedByHost,
        isMicOn: nextMutedByHost ? false : true,
        isSpeaking: nextMutedByHost ? false : vp.isSpeaking,
      };
    });
    const nextSession: ActiveLiveSession = {
      ...session,
      voiceParticipants: nextParticipants,
    };
    liveSessionRef.current = nextSession;
    setActiveLiveSession(nextSession);
    broadcastSharedState(
      profilesRef.current,
      nextSession,
      historyRef.current,
      false
    );

    // Si el participante silenciado es el usuario actual en LiveKit, mutear su pista local
    if (
      participantId === currentUser.id &&
      session.providerMode === "livekit_cloud"
    ) {
      void import("@/lib/media/livekitRoom").then(
        ({ setLiveKitMicMuted }) => {
          setLiveKitMicMuted(targetMuted);
        }
      );
    }
  };

  const setParticipantSpeakingState = (
    participantId: string,
    isSpeaking: boolean
  ) => {
    const session = liveSessionRef.current;
    if (!session) return;
    const currentVp = session.voiceParticipants.find(
      (vp) => vp.id === participantId
    );
    if (!currentVp || currentVp.isSpeaking === isSpeaking) return;

    const nextParticipants = session.voiceParticipants.map((vp) =>
      vp.id === participantId
        ? {
            ...vp,
            isSpeaking: vp.isMicOn && !vp.isMutedByHost ? isSpeaking : false,
          }
        : vp
    );
    const nextSession: ActiveLiveSession = {
      ...session,
      voiceParticipants: nextParticipants,
    };
    liveSessionRef.current = nextSession;
    setActiveLiveSession(nextSession);
    broadcastSharedState(
      profilesRef.current,
      nextSession,
      historyRef.current,
      false
    );
  };

  // =========================================================================
  // PASO 6: MINIJUEGO "CARRERAS DENTRO DE LA SALA" (SINCRONIZADO EN TIEMPO REAL)
  // =========================================================================
  const raceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const raceTimeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearRaceTimers = () => {
    if (raceIntervalRef.current) {
      clearInterval(raceIntervalRef.current);
      raceIntervalRef.current = null;
    }
    raceTimeoutRefs.current.forEach((t) => clearTimeout(t));
    raceTimeoutRefs.current = [];
  };

  useEffect(() => {
    return () => {
      clearRaceTimers();
    };
  }, []);

  const LANE_COLORS: RaceParticipant["laneColor"][] = [
    "cyan",
    "violet",
    "magenta",
    "emerald",
    "gold",
  ];
  const SHIP_ICONS = ["🚀", "🛸", "⚡", "🏎️", "☄️"];

  const openLiveRaceLobby = () => {
    const session = liveSessionRef.current;
    if (!session) return;
    clearRaceTimers();

    const hostRacer: RaceParticipant = {
      id: session.hostId,
      username: session.hostUsername,
      displayName: session.hostDisplayName,
      avatarUrl: session.hostAvatar,
      shipIcon: "🚀",
      laneColor: "cyan",
      progress: 0,
      isBot: false,
    };

    const newRace: LiveRaceState = {
      raceId: `race-${Date.now()}`,
      status: "lobby",
      countdownValue: 3,
      racers: [hostRacer],
      podium: [],
      winner: null,
    };

    const nextSession: ActiveLiveSession = {
      ...session,
      activeRace: newRace,
    };

    liveSessionRef.current = nextSession;
    setActiveLiveSession(nextSession);
    broadcastSharedState(
      profilesRef.current,
      nextSession,
      historyRef.current,
      false
    );
  };

  const joinLiveRace = () => {
    const session = liveSessionRef.current;
    if (!session || !session.activeRace) return;
    if (
      session.activeRace.status !== "lobby" &&
      session.activeRace.status !== "countdown"
    ) {
      return;
    }

    ensureSpectatorAccountIfOtherWindowIsHost(session);
    const participantUser =
      profilesRef.current.find((p) => p.id === currentUserIdRef.current) ||
      currentUser;

    const alreadyJoined = session.activeRace.racers.some(
      (r) => r.id === participantUser.id
    );
    if (alreadyJoined) return;

    const idx = session.activeRace.racers.length;
    const newRacer: RaceParticipant = {
      id: participantUser.id,
      username: participantUser.username,
      displayName: participantUser.displayName,
      avatarUrl: participantUser.avatarUrl,
      shipIcon: SHIP_ICONS[idx % SHIP_ICONS.length],
      laneColor: LANE_COLORS[idx % LANE_COLORS.length],
      progress: 0,
      isBot: false,
    };

    const nextRace: LiveRaceState = {
      ...session.activeRace,
      racers: [...session.activeRace.racers, newRacer],
    };

    const nextSession: ActiveLiveSession = {
      ...session,
      activeRace: nextRace,
    };

    liveSessionRef.current = nextSession;
    setActiveLiveSession(nextSession);
    broadcastSharedState(
      profilesRef.current,
      nextSession,
      historyRef.current,
      false
    );
  };

  const startLiveRaceCountdown = () => {
    const session = liveSessionRef.current;
    if (!session || !session.activeRace) return;
    clearRaceTimers();

    // Asegurar mínimo 3 corredores para que el podio de los 3 primeros lugares (1°, 2°, 3°) siempre esté completo
    const currentRacers: RaceParticipant[] = [...session.activeRace.racers].map(
      (r, i) => ({
        ...r,
        progress: 0,
        finishPlace: undefined,
        finishedAtMs: undefined,
        shipIcon: SHIP_ICONS[i % SHIP_ICONS.length],
        laneColor: LANE_COLORS[i % LANE_COLORS.length],
      })
    );

    // También sumar automáticamente a espectadores ya conectados en el chat de voz de la sala si aún no estaban inscritos
    session.voiceParticipants.forEach((vp) => {
      if (!currentRacers.some((r) => r.id === vp.id)) {
        const idx = currentRacers.length;
        currentRacers.push({
          id: vp.id,
          username: vp.username,
          displayName: vp.displayName,
          avatarUrl: vp.avatarUrl,
          shipIcon: SHIP_ICONS[idx % SHIP_ICONS.length],
          laneColor: LANE_COLORS[idx % LANE_COLORS.length],
          progress: 0,
          isBot: false,
        });
      }
    });

    // Completar hasta 3 carriles si hace falta para el podio 1°, 2° y 3°
    for (const candidate of profilesRef.current) {
      if (currentRacers.length >= 3) break;
      if (!currentRacers.some((r) => r.id === candidate.id)) {
        const idx = currentRacers.length;
        currentRacers.push({
          id: candidate.id,
          username: candidate.username,
          displayName: candidate.displayName,
          avatarUrl: candidate.avatarUrl,
          shipIcon: SHIP_ICONS[idx % SHIP_ICONS.length],
          laneColor: LANE_COLORS[idx % LANE_COLORS.length],
          progress: 0,
          isBot: true,
        });
      }
    }

    const countdownRace3: LiveRaceState = {
      ...session.activeRace,
      status: "countdown",
      countdownValue: 3,
      racers: currentRacers,
      podium: [],
      winner: null,
    };

    const sess3: ActiveLiveSession = { ...session, activeRace: countdownRace3 };
    liveSessionRef.current = sess3;
    setActiveLiveSession(sess3);
    broadcastSharedState(profilesRef.current, sess3, historyRef.current, false);

    // Cuenta regresiva 3 -> 2 -> 1 -> ¡ARRANCAN!
    const t2 = setTimeout(() => {
      const s = liveSessionRef.current;
      if (!s || !s.activeRace) return;
      const next: ActiveLiveSession = {
        ...s,
        activeRace: { ...s.activeRace, status: "countdown", countdownValue: 2 },
      };
      liveSessionRef.current = next;
      setActiveLiveSession(next);
      broadcastSharedState(profilesRef.current, next, historyRef.current, false);
    }, 1000);

    const t1 = setTimeout(() => {
      const s = liveSessionRef.current;
      if (!s || !s.activeRace) return;
      const next: ActiveLiveSession = {
        ...s,
        activeRace: { ...s.activeRace, status: "countdown", countdownValue: 1 },
      };
      liveSessionRef.current = next;
      setActiveLiveSession(next);
      broadcastSharedState(profilesRef.current, next, historyRef.current, false);
    }, 2000);

    const tGo = setTimeout(() => {
      const s = liveSessionRef.current;
      if (!s || !s.activeRace) return;
      const startMs = Date.now();
      const next: ActiveLiveSession = {
        ...s,
        activeRace: {
          ...s.activeRace,
          status: "racing",
          countdownValue: 0,
          startedAtMs: startMs,
        },
      };
      liveSessionRef.current = next;
      setActiveLiveSession(next);
      broadcastSharedState(profilesRef.current, next, historyRef.current, false);

      // Bucle de avance en vivo sincronizado hacia la META (100%)
      raceIntervalRef.current = setInterval(() => {
        const cur = liveSessionRef.current;
        if (!cur || !cur.activeRace || cur.activeRace.status !== "racing") {
          if (raceIntervalRef.current) {
            clearInterval(raceIntervalRef.current);
            raceIntervalRef.current = null;
          }
          return;
        }

        const race = cur.activeRace;
        const nextPodium = [...race.podium];

        const updatedRacers = race.racers.map((racer) => {
          if (racer.progress >= 100) return racer;
          // Avance base constante (~10 segundos de carrera) para que tocar el botón de ACELERAR marque la diferencia
          const step =
            (racer.isBot ? 0.85 : 0.95) + Math.random() * 1.15;
          const nextProg = Math.min(100, Number((racer.progress + step).toFixed(1)));
          if (nextProg >= 100) {
            const place =
              race.racers.filter((x) => x.progress >= 100).length +
              nextPodium.filter(
                (p) => !race.racers.some((x) => x.id === p.id && x.progress >= 100)
              ).length +
              1;
            const finishedRacer: RaceParticipant = {
              ...racer,
              progress: 100,
              finishedAtMs: Date.now(),
              finishPlace: place,
            };
            if (
              nextPodium.length < 3 &&
              !nextPodium.some((p) => p.id === finishedRacer.id)
            ) {
              nextPodium.push({
                ...finishedRacer,
                finishPlace: nextPodium.length + 1,
              });
            }
            return finishedRacer;
          }
          return { ...racer, progress: nextProg };
        });

        const allFinished = updatedRacers.every((r) => r.progress >= 100);
        const finalStatus = allFinished ? "finished" : "racing";
        const finalWinner = nextPodium.length > 0 ? nextPodium[0] : null;

        const updatedSession: ActiveLiveSession = {
          ...cur,
          activeRace: {
            ...race,
            status: finalStatus,
            racers: updatedRacers,
            podium: nextPodium,
            winner: finalWinner,
          },
        };

        liveSessionRef.current = updatedSession;
        setActiveLiveSession(updatedSession);
        broadcastSharedState(
          profilesRef.current,
          updatedSession,
          historyRef.current,
          false
        );

        if (allFinished && raceIntervalRef.current) {
          clearInterval(raceIntervalRef.current);
          raceIntervalRef.current = null;
        }
      }, 180);
    }, 3000);

    raceTimeoutRefs.current = [t2, t1, tGo];
  };

  const boostMyRacer = () => {
    const session = liveSessionRef.current;
    if (!session || !session.activeRace || session.activeRace.status !== "racing")
      return;

    const myId = currentUser.id;
    if (syncChannelRef.current) {
      syncChannelRef.current.postMessage({
        type: "RACE_BOOST",
        userId: myId,
      });
    }

    const updatedRacers = session.activeRace.racers.map((r) =>
      r.id === myId && r.progress < 100
        ? { ...r, progress: Math.min(99, Number((r.progress + 6.5).toFixed(1))) }
        : r
    );

    const nextSession: ActiveLiveSession = {
      ...session,
      activeRace: {
        ...session.activeRace,
        racers: updatedRacers,
      },
    };
    liveSessionRef.current = nextSession;
    setActiveLiveSession(nextSession);
    broadcastSharedState(
      profilesRef.current,
      nextSession,
      historyRef.current,
      false
    );
  };

  // Botón "Volver a la sala": regresa al video en vivo sin cerrar la transmisión y sin perder el historial
  const closeLiveRaceToRoom = () => {
    clearRaceTimers();
    const session = liveSessionRef.current;
    if (!session) return;

    const nextSession: ActiveLiveSession = {
      ...session,
      activeRace: null,
    };

    liveSessionRef.current = nextSession;
    setActiveLiveSession(nextSession);
    broadcastSharedState(
      profilesRef.current,
      nextSession,
      historyRef.current,
      false
    );
  };

  // =========================================================================
  // PASO 6.7: EL IMPOSTOR (juego de sala por voz)
  // =========================================================================
  const IMPOSTOR_TURN_MS = 20000;
  const IMPOSTOR_LAST_CHANCE_MS = 30000;
  const IMPOSTOR_MIN_PLAYERS = 4;
  const IMPOSTOR_MAX_PLAYERS = 10;

  const impostorIntentRef = useRef<{
    joinGameId?: string;
    vote?: {
      gameId: string;
      round: number;
      voterId: string;
      target: string;
      spectator: boolean;
    };
  }>({});

  const commitImpostorSession = (next: ActiveLiveSession) => {
    liveSessionRef.current = next;
    setActiveLiveSession(next);
    broadcastSharedState(
      profilesRef.current,
      next,
      historyRef.current,
      false
    );
  };

  const getMyImpostorSeat = (): ImpostorPlayer | null => {
    const g = liveSessionRef.current?.activeImpostor;
    if (!g) return null;
    return (
      g.players.find(
        (p) =>
          p.id === currentUserIdRef.current &&
          p.windowId === windowIdRef.current
      ) || null
    );
  };

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Reparte la ronda: categoría + palabra secreta + 1 impostor al azar (todo en secreto)
  const buildImpostorRound = (
    base: LiveImpostorState,
    players: ImpostorPlayer[],
    queue: ImpostorPlayer[]
  ): LiveImpostorState => {
    const pick = pickRandomImpostorWord(base.secretWord);
    const order = shuffleArray(players);
    const impostor = order[Math.floor(Math.random() * order.length)];
    return {
      ...base,
      status: "clues",
      players: order,
      queue,
      categoryName: pick.categoryName,
      categoryIcon: pick.categoryIcon,
      secretWord: pick.secretWord,
      impostorId: impostor.id,
      turnIndex: 0,
      turnEndsAtMs: Date.now() + IMPOSTOR_TURN_MS,
      votes: {},
      roomVotes: {},
      mostVotedId: undefined,
      outcome: undefined,
      guessedWord: undefined,
    };
  };

  const applyImpostorScore = (
    session: ActiveLiveSession,
    g: LiveImpostorState,
    impostorWon: boolean
  ): ImpostorScoreEntry[] => {
    const board = [...(session.impostorScoreboard || [])];
    g.players.forEach((p) => {
      let idx = board.findIndex((e) => e.playerId === p.id);
      if (idx < 0) {
        board.push({
          playerId: p.id,
          username: p.username,
          displayName: p.displayName,
          avatarUrl: p.avatarUrl,
          impostorWins: 0,
          roomWins: 0,
        });
        idx = board.length - 1;
      }
      const e = { ...board[idx] };
      if (impostorWon && p.id === g.impostorId) e.impostorWins += 1;
      if (!impostorWon && p.id !== g.impostorId) e.roomWins += 1;
      board[idx] = e;
    });
    return board;
  };

  const openImpostorLobby = () => {
    const session = liveSessionRef.current;
    if (!session) return;
    if (session.activeImpostor) return;
    const host =
      profilesRef.current.find((p) => p.id === session.hostId) || currentUser;
    const seat: ImpostorPlayer = {
      id: host.id,
      username: host.username,
      displayName: host.displayName,
      avatarUrl: host.avatarUrl,
      windowId: windowIdRef.current,
    };
    commitImpostorSession({
      ...session,
      activeImpostor: {
        gameId: `imp-${Date.now()}`,
        round: 1,
        status: "lobby",
        players: [seat],
        queue: [],
        turnIndex: 0,
        votes: {},
        roomVotes: {},
      },
    });
  };

  const joinImpostorGame = () => {
    const session = liveSessionRef.current;
    const g = session?.activeImpostor;
    if (!session || !g) return;

    let user =
      profilesRef.current.find((p) => p.id === currentUserIdRef.current) ||
      currentUser;
    const everyone = [...g.players, ...g.queue];

    if (
      everyone.some(
        (p) => p.id === user.id && p.windowId === windowIdRef.current
      )
    ) {
      impostorIntentRef.current.joinGameId = undefined;
      return;
    }

    // Otra ventana ya usa esta misma cuenta: esta ventana pasa sola a una cuenta libre
    if (everyone.some((p) => p.id === user.id)) {
      const free = profilesRef.current.find(
        (p) => !everyone.some((q) => q.id === p.id)
      );
      if (free) {
        user = free;
        currentUserIdRef.current = free.id;
        setCurrentUserId(free.id);
        try {
          sessionStorage.setItem(SESSION_KEY_CURRENT_ID, free.id);
        } catch {
          // Ignorar
        }
      }
    }

    const seat: ImpostorPlayer = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      windowId: windowIdRef.current,
    };

    impostorIntentRef.current.joinGameId = g.gameId;

    const canPlay =
      g.status === "lobby" && g.players.length < IMPOSTOR_MAX_PLAYERS;
    if (!canPlay && g.queue.length >= IMPOSTOR_MAX_PLAYERS) return;

    commitImpostorSession({
      ...session,
      activeImpostor: {
        ...g,
        players: canPlay ? [...g.players, seat] : g.players,
        queue: canPlay ? g.queue : [...g.queue, seat],
      },
    });
  };

  const startImpostorRound = () => {
    const session = liveSessionRef.current;
    const g = session?.activeImpostor;
    if (!session || !g || g.status !== "lobby") return;
    if (g.players.length < IMPOSTOR_MIN_PLAYERS) return;
    commitImpostorSession({
      ...session,
      activeImpostor: buildImpostorRound(g, g.players, g.queue),
    });
  };

  // Pasa al siguiente turno de pista; tras el último pasa a la votación
  const passImpostorTurn = () => {
    const session = liveSessionRef.current;
    const g = session?.activeImpostor;
    if (!session || !g || g.status !== "clues") return;
    const nextIndex = g.turnIndex + 1;
    const next: LiveImpostorState =
      nextIndex < g.players.length
        ? {
            ...g,
            turnIndex: nextIndex,
            turnEndsAtMs: Date.now() + IMPOSTOR_TURN_MS,
          }
        : { ...g, status: "voting", turnEndsAtMs: undefined };
    commitImpostorSession({ ...session, activeImpostor: next });
  };

  const resolveImpostorVotes = () => {
    const session = liveSessionRef.current;
    const g = session?.activeImpostor;
    if (!session || !g || g.status !== "voting") return;

    const tally: Record<string, number> = {};
    Object.values(g.votes).forEach((t) => {
      tally[t] = (tally[t] || 0) + 1;
    });
    const entries = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    // Empate o sin votos = nadie es el más votado
    const mostVotedId =
      entries.length > 0 && (entries.length === 1 || entries[0][1] > entries[1][1])
        ? entries[0][0]
        : null;

    if (mostVotedId && mostVotedId === g.impostorId) {
      commitImpostorSession({
        ...session,
        activeImpostor: {
          ...g,
          status: "impostor_last_chance",
          mostVotedId,
          turnEndsAtMs: Date.now() + IMPOSTOR_LAST_CHANCE_MS,
        },
      });
      return;
    }

    const revealed: LiveImpostorState = {
      ...g,
      status: "revealed",
      mostVotedId,
      outcome: "escaped",
      turnEndsAtMs: undefined,
    };
    commitImpostorSession({
      ...session,
      activeImpostor: revealed,
      impostorScoreboard: applyImpostorScore(session, revealed, true),
    });
  };

  const castImpostorVote = (targetPlayerId: string) => {
    const session = liveSessionRef.current;
    const g = session?.activeImpostor;
    if (!session || !g || g.status !== "voting") return;
    if (!g.players.some((p) => p.id === targetPlayerId)) return;

    const seat = getMyImpostorSeat();
    const voterId = currentUserIdRef.current;

    if (seat) {
      if (seat.id === targetPlayerId) return; // no puedes votarte a ti mismo
      const votes = { ...g.votes, [seat.id]: targetPlayerId };
      impostorIntentRef.current.vote = {
        gameId: g.gameId,
        round: g.round,
        voterId: seat.id,
        target: targetPlayerId,
        spectator: false,
      };
      commitImpostorSession({
        ...session,
        activeImpostor: { ...g, votes },
      });
      if (g.players.every((p) => votes[p.id])) {
        resolveImpostorVotes();
      }
      return;
    }

    // Espectador: voto de "La sala opina" (no decide la partida)
    impostorIntentRef.current.vote = {
      gameId: g.gameId,
      round: g.round,
      voterId,
      target: targetPlayerId,
      spectator: true,
    };
    commitImpostorSession({
      ...session,
      activeImpostor: {
        ...g,
        roomVotes: { ...g.roomVotes, [voterId]: targetPlayerId },
      },
    });
  };

  // Última oportunidad del impostor. Con palabra vacía (solo anfitrión, por tiempo agotado) falla.
  const submitImpostorWordGuess = (guessedWord: string) => {
    const session = liveSessionRef.current;
    const g = session?.activeImpostor;
    if (!session || !g || g.status !== "impostor_last_chance") return;
    const seat = getMyImpostorSeat();
    const isImpostorWindow = Boolean(seat && seat.id === g.impostorId);
    const isHostTimeout =
      windowIdRef.current === session.hostWindowId && guessedWord === "";
    if (!isImpostorWindow && !isHostTimeout) return;

    const stole =
      guessedWord !== "" &&
      normalizeWordForComparison(guessedWord) ===
        normalizeWordForComparison(g.secretWord || "");

    const revealed: LiveImpostorState = {
      ...g,
      status: "revealed",
      outcome: stole ? "stole" : "caught_failed",
      guessedWord: guessedWord.trim(),
      turnEndsAtMs: undefined,
    };
    commitImpostorSession({
      ...session,
      activeImpostor: revealed,
      impostorScoreboard: applyImpostorScore(session, revealed, stole),
    });
  };

  // "Otra ronda": entran los que esperaban en cola; si hay 4+ arranca de inmediato
  const nextImpostorRound = () => {
    const session = liveSessionRef.current;
    const g = session?.activeImpostor;
    if (!session || !g || g.status !== "revealed") return;
    const merged = [...g.players, ...g.queue];
    const players = merged.slice(0, IMPOSTOR_MAX_PLAYERS);
    const queue = merged.slice(IMPOSTOR_MAX_PLAYERS);
    const base: LiveImpostorState = { ...g, round: g.round + 1 };
    const next: LiveImpostorState =
      players.length >= IMPOSTOR_MIN_PLAYERS
        ? buildImpostorRound(base, players, queue)
        : {
            ...base,
            status: "lobby",
            players,
            queue,
            categoryName: undefined,
            categoryIcon: undefined,
            secretWord: undefined,
            impostorId: undefined,
            turnIndex: 0,
            turnEndsAtMs: undefined,
            votes: {},
            roomVotes: {},
            mostVotedId: undefined,
            outcome: undefined,
            guessedWord: undefined,
          };
    commitImpostorSession({ ...session, activeImpostor: next });
  };

  // "Terminar / Volver a la sala": cierra el juego sin cortar la transmisión ni el historial
  const closeImpostorToRoom = () => {
    const session = liveSessionRef.current;
    if (!session) return;
    impostorIntentRef.current = {};
    commitImpostorSession({ ...session, activeImpostor: null });
  };

  // Reconciliación: si dos ventanas escriben a la vez, se re-aplica la unión/voto propio perdido
  useEffect(() => {
    const t = setInterval(() => {
      if (Date.now() - lastLocalBroadcastAtRef.current < 1500) return;
      const g = liveSessionRef.current?.activeImpostor;
      const intent = impostorIntentRef.current;
      if (!g) return;
      if (intent.joinGameId === g.gameId) {
        joinImpostorGame();
      }
      const v = intent.vote;
      if (
        v &&
        v.gameId === g.gameId &&
        v.round === g.round &&
        g.status === "voting"
      ) {
        const recorded = v.spectator
          ? g.roomVotes[v.voterId]
          : g.votes[v.voterId];
        if (recorded !== v.target) castImpostorVote(v.target);
      }
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================================================================
  // PASO 6.8: DEFIENDE LA NAVE (juego cooperativo)
  // Solo la ventana del ANFITRIÓN escribe activeDefense. Las demás ventanas le envían
  // sus uniones y disparos por el canal de sincronización; el anfitrión valida y publica.
  // =========================================================================
  const defenseAuthRef = useRef<LiveDefenseState | null>(null);
  const defenseClosedRef = useRef<Set<string>>(new Set());

  const isHostHere = () => {
    const s = liveSessionRef.current;
    return Boolean(s && s.hostWindowId === windowIdRef.current);
  };

  const commitDefense = (next: LiveDefenseState | null) => {
    const s = liveSessionRef.current;
    if (!s) return;
    const withRev = next
      ? { ...next, rev: (defenseAuthRef.current?.rev || 0) + 1 }
      : null;
    defenseAuthRef.current = withRev;
    commitImpostorSession({ ...s, activeDefense: withRev });
  };

  const mutateDefense = (
    fn: (s: LiveDefenseState) => LiveDefenseState
  ) => {
    const cur = defenseAuthRef.current;
    if (!cur) return;
    const n = fn(cur);
    if (n !== cur) commitDefense(n);
  };

  const getMyDefenseSeat = (): DefensePlayer | null => {
    const g = liveSessionRef.current?.activeDefense;
    if (!g) return null;
    return (
      g.players.find(
        (p) =>
          p.id === currentUserIdRef.current &&
          p.windowId === windowIdRef.current
      ) || null
    );
  };

  const openDefenseLobby = () => {
    const session = liveSessionRef.current;
    if (!session || !isHostHere() || session.activeDefense) return;
    const host =
      profilesRef.current.find((p) => p.id === session.hostId) || currentUser;
    const lobby = createDefenseLobby({
      id: host.id,
      username: host.username,
      displayName: host.displayName,
      avatarUrl: host.avatarUrl,
      windowId: windowIdRef.current,
    });
    defenseAuthRef.current = null;
    commitDefense(lobby);
  };

  const joinDefenseGame = () => {
    const session = liveSessionRef.current;
    const g = session?.activeDefense;
    if (!session || !g) return;
    if (g.status !== "lobby" && g.status !== "between") return;

    let user =
      profilesRef.current.find((p) => p.id === currentUserIdRef.current) ||
      currentUser;

    if (
      g.players.some(
        (p) => p.id === user.id && p.windowId === windowIdRef.current
      )
    )
      return;

    // Otra ventana ya usa esta cuenta: esta ventana pasa sola a una cuenta libre
    if (g.players.some((p) => p.id === user.id)) {
      const free = profilesRef.current.find(
        (p) => !g.players.some((q) => q.id === p.id)
      );
      if (free) {
        user = free;
        currentUserIdRef.current = free.id;
        setCurrentUserId(free.id);
        try {
          sessionStorage.setItem(SESSION_KEY_CURRENT_ID, free.id);
        } catch {
          // Ignorar
        }
      }
    }

    const seat = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      windowId: windowIdRef.current,
    };

    if (isHostHere()) {
      mutateDefense((s) => addDefensePlayer(s, seat));
    } else {
      syncChannelRef.current?.postMessage({
        type: "DEFENSE_JOIN",
        gameId: g.gameId,
        seat,
      });
    }
  };

  const startDefenseMatch = () => {
    if (!isHostHere()) return;
    mutateDefense((s) => startDefenseGame(s, Date.now()));
  };

  const defenseRematchAction = () => {
    if (!isHostHere()) return;
    mutateDefense((s) =>
      s.status === "over" ? rematchDefense(s, Date.now()) : s
    );
  };

  const sendDefenseShot = (shot: {
    gameId: string;
    playerId: string;
    asteroidId: string;
    support: boolean;
    inZone: boolean;
  }) => {
    if (isHostHere()) {
      mutateDefense((s) => applyDefenseShot(s, shot, Date.now()));
    } else {
      syncChannelRef.current?.postMessage({ type: "DEFENSE_SHOT", ...shot });
    }
  };

  const closeDefenseToRoom = () => {
    const s = liveSessionRef.current;
    if (!s || !isHostHere()) return;
    const id = defenseAuthRef.current?.gameId || s.activeDefense?.gameId;
    if (id) defenseClosedRef.current.add(id);
    defenseAuthRef.current = null;
    commitImpostorSession({ ...s, activeDefense: null });
  };

  // Mensajes de las otras ventanas hacia el anfitrión (usa solo refs)
  const handleDefenseMessage = (msg: {
    type: string;
    gameId?: string;
    seat?: Omit<DefensePlayer, "colorIdx" | "sector">;
    playerId?: string;
    asteroidId?: string;
    support?: boolean;
    inZone?: boolean;
  }) => {
    if (!isHostHere()) return;
    const cur = defenseAuthRef.current;
    if (!cur || msg.gameId !== cur.gameId) return;
    if (msg.type === "DEFENSE_JOIN" && msg.seat) {
      const seat = msg.seat;
      mutateDefense((s) => addDefensePlayer(s, seat));
    } else if (
      msg.type === "DEFENSE_SHOT" &&
      msg.playerId &&
      msg.asteroidId
    ) {
      const shot = {
        playerId: msg.playerId,
        asteroidId: msg.asteroidId,
        support: Boolean(msg.support),
        inZone: Boolean(msg.inZone),
      };
      mutateDefense((s) => applyDefenseShot(s, shot, Date.now()));
    }
  };

  useEffect(() => {
    handleDefenseMessageRef.current = handleDefenseMessage;
  });

  // Reloj del juego (solo anfitrión) + reconciliación contra escrituras de otras ventanas
  useEffect(() => {
    const t = setInterval(() => {
      if (!isHostHere()) return;
      const s = liveSessionRef.current;
      if (!s) {
        defenseAuthRef.current = null;
        return;
      }
      let cur = defenseAuthRef.current;
      if (
        !cur &&
        s.activeDefense &&
        !defenseClosedRef.current.has(s.activeDefense.gameId)
      ) {
        cur = s.activeDefense; // recarga de la pestaña del anfitrión
        defenseAuthRef.current = cur;
      }
      if (!cur) {
        if (
          s.activeDefense &&
          defenseClosedRef.current.has(s.activeDefense.gameId)
        ) {
          commitImpostorSession({ ...s, activeDefense: null });
        }
        return;
      }
      const ticked = tickDefense(cur, Date.now());
      if (ticked !== cur) {
        commitDefense(ticked);
      } else if (
        s.activeDefense?.rev !== cur.rev &&
        Date.now() - lastLocalBroadcastAtRef.current > 400
      ) {
        commitImpostorSession({ ...s, activeDefense: cur });
      }
    }, 120);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================================================================
  // JUEGO DE SALA MASIVO: TRIVIA GALÁCTICA (Supervivencia para toda la sala)
  // =========================================================================
  const TRIVIA_QUESTION_DURATION_MS = 12000;
  const TRIVIA_REVEAL_DURATION_MS = 5000;

  const commitTriviaSession = (nextTrivia: LiveTriviaState | null) => {
    const s = liveSessionRef.current;
    if (!s) return;
    const nextSession: ActiveLiveSession = {
      ...s,
      activeTrivia: nextTrivia,
    };
    liveSessionRef.current = nextSession;
    setActiveLiveSession(nextSession);
    broadcastSharedState(
      profilesRef.current,
      nextSession,
      historyRef.current,
      false
    );
  };

  const getMyTriviaSeat = (): TriviaPlayer | null => {
    const g = liveSessionRef.current?.activeTrivia;
    if (!g) return null;
    return (
      g.players.find(
        (p) =>
          p.id === currentUserIdRef.current &&
          p.windowId === windowIdRef.current
      ) || null
    );
  };

  const openTriviaLobby = () => {
    const session = liveSessionRef.current;
    if (!session || !isHostHere() || session.activeTrivia) return;
    const host =
      profilesRef.current.find((p) => p.id === session.hostId) || currentUser;
    const initialPlayer: TriviaPlayer = {
      id: host.id,
      username: host.username,
      displayName: host.displayName,
      avatarUrl: host.avatarUrl,
      windowId: windowIdRef.current,
      lives: 3,
      score: 0,
      streak: 0,
      isEliminated: false,
      selectedOption: null,
      lastAnswerCorrect: null,
    };
    const newTrivia: LiveTriviaState = {
      gameId: `triv-${Date.now()}`,
      status: "lobby",
      currentQuestionIndex: 0,
      totalQuestions: 6,
      questions: shuffleQuestions(6),
      players: [initialPlayer],
      tallies: [0, 0, 0, 0],
      podium: [],
    };
    commitTriviaSession(newTrivia);
  };

  const joinTriviaGame = () => {
    const session = liveSessionRef.current;
    const g = session?.activeTrivia;
    if (!session || !g) return;

    let user =
      profilesRef.current.find((p) => p.id === currentUserIdRef.current) ||
      currentUser;

    if (
      g.players.some(
        (p) => p.id === user.id && p.windowId === windowIdRef.current
      )
    ) {
      return;
    }

    if (g.players.some((p) => p.id === user.id)) {
      const free = profilesRef.current.find(
        (p) => !g.players.some((q) => q.id === p.id)
      );
      if (free) {
        user = free;
        currentUserIdRef.current = free.id;
        setCurrentUserId(free.id);
        try {
          sessionStorage.setItem(SESSION_KEY_CURRENT_ID, free.id);
        } catch {
          // Ignorar
        }
      }
    }

    const newPlayer: TriviaPlayer = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      windowId: windowIdRef.current,
      lives: 3,
      score: 0,
      streak: 0,
      isEliminated: false,
      selectedOption: null,
      lastAnswerCorrect: null,
    };

    if (isHostHere()) {
      commitTriviaSession({
        ...g,
        players: [...g.players, newPlayer],
      });
    } else {
      syncChannelRef.current?.postMessage({
        type: "TRIVIA_JOIN",
        gameId: g.gameId,
        player: newPlayer,
      });
    }
  };

  const startTriviaMatch = () => {
    const session = liveSessionRef.current;
    const g = session?.activeTrivia;
    if (!session || !g || !isHostHere() || g.status !== "lobby") return;

    commitTriviaSession({
      ...g,
      status: "question",
      currentQuestionIndex: 0,
      questionEndsAtMs: Date.now() + TRIVIA_QUESTION_DURATION_MS,
      tallies: [0, 0, 0, 0],
      players: g.players.map((p) => ({
        ...p,
        lives: 3,
        score: 0,
        streak: 0,
        isEliminated: false,
        selectedOption: null,
        lastAnswerCorrect: null,
      })),
    });
  };

  const handleApplyTriviaAnswer = (
    gameId: string,
    playerId: string,
    optionIndex: 0 | 1 | 2 | 3
  ) => {
    const session = liveSessionRef.current;
    const g = session?.activeTrivia;
    if (!session || !g || g.gameId !== gameId || g.status !== "question") return;

    const updatedPlayers = g.players.map((p) => {
      if (p.id !== playerId) return p;
      return { ...p, selectedOption: optionIndex };
    });

    const tallies: [number, number, number, number] = [0, 0, 0, 0];
    updatedPlayers.forEach((p) => {
      if (p.selectedOption !== null && p.selectedOption !== undefined) {
        tallies[p.selectedOption] += 1;
      }
    });

    const allAliveAnswered = updatedPlayers
      .filter((p) => !p.isEliminated)
      .every((p) => p.selectedOption !== null && p.selectedOption !== undefined);

    const nextState: LiveTriviaState = {
      ...g,
      players: updatedPlayers,
      tallies,
      questionEndsAtMs: allAliveAnswered
        ? Math.min(g.questionEndsAtMs || Date.now(), Date.now() + 600)
        : g.questionEndsAtMs,
    };

    commitTriviaSession(nextState);
  };

  const submitTriviaAnswer = (optionIndex: 0 | 1 | 2 | 3) => {
    const session = liveSessionRef.current;
    const g = session?.activeTrivia;
    if (!session || !g || g.status !== "question") return;

    const seat = getMyTriviaSeat();
    if (
      !seat ||
      seat.isEliminated ||
      (seat.selectedOption !== null && seat.selectedOption !== undefined)
    ) {
      return;
    }

    if (isHostHere()) {
      handleApplyTriviaAnswer(g.gameId, seat.id, optionIndex);
    } else {
      syncChannelRef.current?.postMessage({
        type: "TRIVIA_ANSWER",
        gameId: g.gameId,
        playerId: seat.id,
        optionIndex,
      });
    }
  };

  const resolveTriviaQuestion = (cur: LiveTriviaState) => {
    const curQ = cur.questions[cur.currentQuestionIndex];
    if (!curQ) return;

    const correctIdx = curQ.correctIndex;
    const evaluatedPlayers = cur.players.map((p) => {
      if (p.isEliminated) return p;
      const answered =
        p.selectedOption !== null && p.selectedOption !== undefined;
      const isCorrect = answered && p.selectedOption === correctIdx;

      const nextLives = isCorrect ? p.lives : Math.max(0, p.lives - 1);
      const nextStreak = isCorrect ? p.streak + 1 : 0;
      const bonus = isCorrect ? 100 + nextStreak * 25 : 0;

      return {
        ...p,
        lives: nextLives,
        score: p.score + bonus,
        streak: nextStreak,
        isEliminated: nextLives <= 0,
        lastAnswerCorrect: isCorrect,
      };
    });

    commitTriviaSession({
      ...cur,
      status: "reveal",
      players: evaluatedPlayers,
      revealEndsAtMs: Date.now() + TRIVIA_REVEAL_DURATION_MS,
    });
  };

  const advanceTriviaNextStep = (cur: LiveTriviaState) => {
    const nextIdx = cur.currentQuestionIndex + 1;
    const allEliminated = cur.players.every((p) => p.isEliminated);
    const noMoreQuestions = nextIdx >= cur.totalQuestions;

    if (allEliminated || noMoreQuestions) {
      const sorted = [...cur.players].sort((a, b) => {
        if (b.lives !== a.lives) return b.lives - a.lives;
        return b.score - a.score;
      });
      commitTriviaSession({
        ...cur,
        status: "finished",
        podium: sorted.slice(0, 3),
        revealEndsAtMs: undefined,
        questionEndsAtMs: undefined,
      });
      return;
    }

    commitTriviaSession({
      ...cur,
      status: "question",
      currentQuestionIndex: nextIdx,
      questionEndsAtMs: Date.now() + TRIVIA_QUESTION_DURATION_MS,
      revealEndsAtMs: undefined,
      tallies: [0, 0, 0, 0],
      players: cur.players.map((p) => ({
        ...p,
        selectedOption: null,
        lastAnswerCorrect: null,
      })),
    });
  };

  const triviaRematchAction = () => {
    if (!isHostHere()) return;
    const session = liveSessionRef.current;
    const g = session?.activeTrivia;
    if (!session || !g) return;

    commitTriviaSession({
      ...g,
      gameId: `triv-${Date.now()}`,
      status: "question",
      currentQuestionIndex: 0,
      totalQuestions: 6,
      questions: shuffleQuestions(6),
      questionEndsAtMs: Date.now() + TRIVIA_QUESTION_DURATION_MS,
      revealEndsAtMs: undefined,
      tallies: [0, 0, 0, 0],
      podium: [],
      players: g.players.map((p) => ({
        ...p,
        lives: 3,
        score: 0,
        streak: 0,
        isEliminated: false,
        selectedOption: null,
        lastAnswerCorrect: null,
      })),
    });
  };

  const closeTriviaToRoom = () => {
    commitTriviaSession(null);
  };

  const handleTriviaMessage = (msg: {
    type: string;
    gameId?: string;
    player?: TriviaPlayer;
    playerId?: string;
    optionIndex?: 0 | 1 | 2 | 3;
  }) => {
    if (!isHostHere()) return;
    const g = liveSessionRef.current?.activeTrivia;
    if (!g || msg.gameId !== g.gameId) return;

    if (msg.type === "TRIVIA_JOIN" && msg.player) {
      if (!g.players.some((p) => p.id === msg.player!.id)) {
        commitTriviaSession({
          ...g,
          players: [...g.players, msg.player!],
        });
      }
    } else if (
      msg.type === "TRIVIA_ANSWER" &&
      msg.playerId &&
      msg.optionIndex !== undefined
    ) {
      handleApplyTriviaAnswer(g.gameId, msg.playerId, msg.optionIndex);
    } else if (msg.type === "TRIVIA_PING_HOST_CHECK") {
      const now = Date.now();
      if (
        g.status === "question" &&
        g.questionEndsAtMs &&
        now >= g.questionEndsAtMs
      ) {
        resolveTriviaQuestion(g);
      } else if (
        g.status === "reveal" &&
        g.revealEndsAtMs &&
        now >= g.revealEndsAtMs
      ) {
        advanceTriviaNextStep(g);
      }
    }
  };

  const pingTriviaTimerSync = () => {
    const session = liveSessionRef.current;
    const g = session?.activeTrivia;
    if (!session || !g) return;
    if (isHostHere()) {
      const now = Date.now();
      if (
        g.status === "question" &&
        g.questionEndsAtMs &&
        now >= g.questionEndsAtMs
      ) {
        resolveTriviaQuestion(g);
      } else if (
        g.status === "reveal" &&
        g.revealEndsAtMs &&
        now >= g.revealEndsAtMs
      ) {
        advanceTriviaNextStep(g);
      }
    } else {
      syncChannelRef.current?.postMessage({
        type: "TRIVIA_PING_HOST_CHECK",
        gameId: g.gameId,
      });
    }
  };

  useEffect(() => {
    handleTriviaMessageRef.current = handleTriviaMessage;
  });

  // Temporizador de Trivia en el anfitrión (tasa rápida a 80ms para sincronía perfecta)
  useEffect(() => {
    const t = setInterval(() => {
      if (!isHostHere()) return;
      const g = liveSessionRef.current?.activeTrivia;
      if (!g) return;

      const now = Date.now();
      if (
        g.status === "question" &&
        g.questionEndsAtMs &&
        now >= g.questionEndsAtMs
      ) {
        resolveTriviaQuestion(g);
      } else if (
        g.status === "reveal" &&
        g.revealEndsAtMs &&
        now >= g.revealEndsAtMs
      ) {
        advanceTriviaNextStep(g);
      }
    }, 80);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================================================================
  // FUNCIONES DE PERFIL, MONEDERO Y DESCUBRIMIENTO (PASOS 2, 3 y 4)
  // =========================================================================
  const createCustomProfile = (input: CreateProfileInput): UserProfile => {
    const cleanUsername = input.username
      .trim()
      .replace(/^@+/, "")
      .replace(/\s+/g, "_");
    const newProfile: UserProfile = {
      id: `user-${Date.now()}`,
      username:
        cleanUsername || `Jugador_${Math.floor(Math.random() * 900 + 100)}`,
      displayName:
        input.displayName.trim() || cleanUsername || "Nuevo Creador Nova",
      email: input.email.trim() || "creador@novalive.es",
      avatarUrl: input.avatarUrl || "🌟",
      bio:
        input.bio.trim() ||
        "Nuevo en NOVA. Transmitiendo y jugando en vivo desde La Cantera.",
      createdAt: new Date().toISOString(),
      accountAgeDays: 1,
      followersCount: 0,
      novaBalance: 2500,
      creatorEarningsUsd: 0,
      availableWithdrawUsd: 0,
      tier: evaluateCreatorTier(0, 0, 1),
      isLive: false,
      stripeConnectLinked: false,
    };

    const nextProfiles = [newProfile, ...profiles];
    setProfiles(nextProfiles);
    setCurrentUserId(newProfile.id);
    broadcastSharedState(nextProfiles, activeLiveSession, broadcastHistory);

    const welcomeTx: NovaTransaction = {
      id: `tx-${Date.now()}`,
      userId: newProfile.id,
      type: "package_purchase",
      title: "Bono Inicial de Prueba al Crear Perfil (2,500 NOVAS)",
      amountNovas: 2500,
      amountUsd: 0,
      createdAt: new Date().toISOString(),
      status: "completado",
    };
    setTransactions((prev) => [welcomeTx, ...prev]);

    void syncProfileToSupabaseIfConfigured(newProfile);
    return newProfile;
  };

  const updateCurrentProfile = (updates: Partial<CreateProfileInput>) => {
    const nextProfiles = profiles.map((p) => {
      if (p.id !== currentUser.id) return p;
      const cleanUser =
        updates.username !== undefined
          ? updates.username.trim().replace(/^@+/, "").replace(/\s+/g, "_")
          : p.username;
      return {
        ...p,
        username: cleanUser || p.username,
        displayName:
          updates.displayName !== undefined
            ? updates.displayName
            : p.displayName,
        email: updates.email !== undefined ? updates.email : p.email,
        avatarUrl:
          updates.avatarUrl !== undefined ? updates.avatarUrl : p.avatarUrl,
        bio: updates.bio !== undefined ? updates.bio : p.bio,
      };
    });
    setProfiles(nextProfiles);
    broadcastSharedState(nextProfiles, activeLiveSession, broadcastHistory);
  };

  const switchProfile = (profileId: string) => {
    setCurrentUserId(profileId);
  };

  const sendGift = (
    gift: NovaGiftItem,
    customDonorName?: string,
    recipientCreatorName?: string,
    recipientCreatorId?: string
  ): { ok: boolean; error?: string } => {
    if (currentUser.novaBalance < gift.novas) {
      return {
        ok: false,
        error: `Saldo insuficiente. Necesitas ${gift.novas} NOVAS para enviar ${gift.name} (tienes ${currentUser.novaBalance} NOVAS). Puedes recargar saldo en tu Monedero.`,
      };
    }

    const grossUsd = +(gift.novas * NOVA_ECONOMY_RULES.USD_PER_NOVA).toFixed(2);
    const creatorShareUsd = +(
      (grossUsd * NOVA_ECONOMY_RULES.CREATOR_SHARE_PERCENT) /
      100
    ).toFixed(4);
    const platformShareUsd = +(
      (grossUsd * NOVA_ECONOMY_RULES.PLATFORM_SHARE_PERCENT) /
      100
    ).toFixed(4);
    const processorShareUsd = +(
      (grossUsd * NOVA_ECONOMY_RULES.PROCESSOR_SHARE_PERCENT) /
      100
    ).toFixed(4);

    const donorDisplay =
      customDonorName?.trim().replace(/^@+/, "") ||
      currentUser.username ||
      currentUser.displayName;

    const targetId = recipientCreatorId || currentUser.id;

    const nextProfiles = profiles.map((p) => {
      const isSender = p.id === currentUser.id;
      const isRecipient = p.id === targetId;
      if (!isSender && !isRecipient) return p;

      const nextBalance = isSender
        ? p.novaBalance - gift.novas
        : p.novaBalance;
      const nextEarnings = isRecipient
        ? +(p.creatorEarningsUsd + creatorShareUsd).toFixed(2)
        : p.creatorEarningsUsd;
      const nextAvailable = isRecipient
        ? +(p.availableWithdrawUsd + creatorShareUsd).toFixed(2)
        : p.availableWithdrawUsd;
      const nextTier = evaluateCreatorTier(
        p.followersCount,
        nextEarnings,
        p.accountAgeDays
      );
      const graduatedNow = p.tier === "cantera" && nextTier === "titular";

      const updated: UserProfile = {
        ...p,
        novaBalance: nextBalance,
        creatorEarningsUsd: nextEarnings,
        availableWithdrawUsd: nextAvailable,
        tier: nextTier,
        justGraduated: graduatedNow ? true : p.justGraduated,
      };
      if (graduatedNow) {
        setGraduationCelebrationUser(updated);
      }
      return updated;
    });

    setProfiles(nextProfiles);
    broadcastSharedState(nextProfiles, activeLiveSession, broadcastHistory);

    const newTx: NovaTransaction = {
      id: `tx-${Date.now()}`,
      userId: currentUser.id,
      type: "gift_sent",
      title: `Regalo: ${gift.name} (${gift.novas} NOVAS)${
        recipientCreatorName ? ` → ${recipientCreatorName}` : ""
      }`,
      amountNovas: -gift.novas,
      amountUsd: grossUsd,
      creatorShareUsd: +creatorShareUsd.toFixed(2),
      platformShareUsd: +platformShareUsd.toFixed(2),
      processorShareUsd: +processorShareUsd.toFixed(2),
      createdAt: new Date().toISOString(),
      status: "completado",
    };

    const newTxList: NovaTransaction[] = [newTx];
    let creatorTx: NovaTransaction | null = null;
    if (targetId !== currentUser.id) {
      creatorTx = {
        id: `tx-recv-${Date.now()}`,
        userId: targetId,
        type: "creator_earning",
        title: `Ganancia 77%: ${gift.name} (${gift.novas} NOVAS de @${donorDisplay})`,
        amountNovas: gift.novas,
        amountUsd: +creatorShareUsd.toFixed(2),
        creatorShareUsd: +creatorShareUsd.toFixed(2),
        platformShareUsd: +platformShareUsd.toFixed(2),
        processorShareUsd: +processorShareUsd.toFixed(2),
        createdAt: new Date().toISOString(),
        status: "completado",
      };
      newTxList.push(creatorTx);
    }
    setTransactions((prev) => [...newTxList, ...prev]);

    // Guardar en Supabase para donante y creador
    void saveDonationToSupabaseIfConfigured(newTx, targetId);
    if (creatorTx) {
      void saveDonationToSupabaseIfConfigured(creatorTx, targetId);
    }

    const alertEvent: DonationAlertEvent = {
      id: `alert-${Date.now()}`,
      donorName: donorDisplay,
      amountNovas: gift.novas,
      tier: gift.animationTier || getDonationAnimationTier(gift.novas),
      giftId: gift.id,
      giftName: gift.name,
      giftIconUrl: gift.pngUrl,
      signatureAnimation: gift.signatureAnimation,
      animationDescription: gift.animationDescription,
      particleSymbols: gift.particleSymbols,
      eventTitle: gift.gameEffectLabel,
      timestamp: new Date().toISOString(),
    };

    // 1. Encolar alerta localmente
    enqueueDonationAlert(alertEvent);

    // 2. BUG 3: Transmitir alerta por el canal de datos WebRTC de LiveKit Cloud (cruza entre dispositivos en ~30ms)
    void import("@/lib/media/livekitRoom").then(
      ({ broadcastLiveKitDonationAlert }) =>
        broadcastLiveKitDonationAlert(alertEvent)
    );

    // 3. Sincronizar en el servidor (/api/live/sync) para persistencia y respaldo entre dispositivos
    void fetch("/api/live/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "DONATION_ALERT",
        alert: alertEvent,
      }),
    }).catch(() => {});

    // 4. Transmitir alerta a todas las demás ventanas del mismo navegador
    syncChannelRef.current?.postMessage({
      type: "DONATION_ALERT",
      alert: alertEvent,
    });

    return { ok: true };
  };

  const purchasePackage = (pkg: NovaPackage) => {
    const totalNovas = pkg.novas + pkg.bonusNovas;
    const nextProfiles = profiles.map((p) =>
      p.id === currentUser.id
        ? { ...p, novaBalance: p.novaBalance + totalNovas }
        : p
    );
    setProfiles(nextProfiles);
    broadcastSharedState(nextProfiles, activeLiveSession, broadcastHistory);

    const tx: NovaTransaction = {
      id: `tx-${Date.now()}`,
      userId: currentUser.id,
      type: "package_purchase",
      title: `Compra Paquete ${pkg.name} (${totalNovas.toLocaleString(
        "en-US"
      )} NOVAS • 1 solo cobro Stripe)`,
      amountNovas: totalNovas,
      amountUsd: pkg.priceUsd,
      createdAt: new Date().toISOString(),
      status: "completado",
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  const addTestNovas = (amount: number) => {
    const nextProfiles = profiles.map((p) =>
      p.id === currentUser.id
        ? { ...p, novaBalance: p.novaBalance + amount }
        : p
    );
    setProfiles(nextProfiles);
    broadcastSharedState(nextProfiles, activeLiveSession, broadcastHistory);
  };

  const linkStripeConnect = () => {
    const nextProfiles = profiles.map((p) =>
      p.id === currentUser.id ? { ...p, stripeConnectLinked: true } : p
    );
    setProfiles(nextProfiles);
    broadcastSharedState(nextProfiles, activeLiveSession, broadcastHistory);
  };

  const withdrawCreatorEarnings = (): {
    ok: boolean;
    withdrawnUsd?: number;
    error?: string;
  } => {
    if (!currentUser.stripeConnectLinked) {
      return {
        ok: false,
        error: "Primero vincula tu cuenta de Stripe Connect Express.",
      };
    }
    if (
      currentUser.availableWithdrawUsd < NOVA_ECONOMY_RULES.MIN_WITHDRAWAL_USD
    ) {
      return {
        ok: false,
        error: `El retiro mínimo es de $${NOVA_ECONOMY_RULES.MIN_WITHDRAWAL_USD}.00 USD. Actualmente tienes $${currentUser.availableWithdrawUsd.toFixed(
          2
        )} USD disponibles.`,
      };
    }

    const amountToWithdraw = currentUser.availableWithdrawUsd;
    const nextProfiles = profiles.map((p) =>
      p.id === currentUser.id ? { ...p, availableWithdrawUsd: 0 } : p
    );
    setProfiles(nextProfiles);
    broadcastSharedState(nextProfiles, activeLiveSession, broadcastHistory);

    const tx: NovaTransaction = {
      id: `tx-${Date.now()}`,
      userId: currentUser.id,
      type: "creator_withdrawal",
      title: `Retiro de Creador vía Stripe Connect (Acumulado al 77%)`,
      amountUsd: amountToWithdraw,
      creatorShareUsd: amountToWithdraw,
      createdAt: new Date().toISOString(),
      status: "completado",
    };
    setTransactions((prev) => [tx, ...prev]);

    return { ok: true, withdrawnUsd: amountToWithdraw };
  };

  const simulateGainFollowerForCreator = (creatorId: string) => {
    const nextProfiles = profiles.map((p) => {
      if (p.id !== creatorId) return p;
      const nextFollowers = p.followersCount + 1;
      const nextTier = evaluateCreatorTier(
        nextFollowers,
        p.creatorEarningsUsd,
        p.accountAgeDays
      );
      const graduatedNow = p.tier === "cantera" && nextTier === "titular";
      const updated: UserProfile = {
        ...p,
        followersCount: nextFollowers,
        tier: nextTier,
        justGraduated: graduatedNow ? true : p.justGraduated,
      };
      if (graduatedNow) {
        setGraduationCelebrationUser(updated);
      }
      return updated;
    });
    setProfiles(nextProfiles);
    broadcastSharedState(nextProfiles, activeLiveSession, broadcastHistory);
  };

  const simulateGainFollower = () => {
    simulateGainFollowerForCreator(currentUser.id);
  };

  const resetAstroCaosTo99 = () => {
    const nextProfiles = profiles.map((p) =>
      p.id === "user-cantera-casi-graduado"
        ? {
            ...p,
            followersCount: 99,
            creatorEarningsUsd: 98.5,
            tier: "cantera" as const,
            justGraduated: false,
          }
        : p
    );
    setProfiles(nextProfiles);
    setGraduationCelebrationUser(null);
    broadcastSharedState(nextProfiles, activeLiveSession, broadcastHistory);
  };

  const triggerPasaleTuGente = (
    fromTitularId: string,
    toCanteraId: string,
    customMessage?: string
  ) => {
    const titular = profiles.find((p) => p.id === fromTitularId);
    const cantera = profiles.find((p) => p.id === toCanteraId);
    if (!titular || !cantera) return;

    const viewersPassed = Math.max(
      45,
      Math.round(titular.followersCount * 0.15)
    );

    const rec: PasaleTuGenteRecommendation = {
      id: `raid-${Date.now()}`,
      fromTitularId: titular.id,
      fromTitularName: titular.displayName,
      fromTitularUsername: titular.username,
      fromTitularAvatar: titular.avatarUrl,
      toCanteraId: cantera.id,
      toCanteraName: cantera.displayName,
      toCanteraUsername: cantera.username,
      toCanteraAvatar: cantera.avatarUrl,
      viewersPassed,
      message:
        customMessage?.trim() ||
        `¡Vayan todos a apoyar a @${cantera.username} en La Cantera! Su sala está brutal.`,
      createdAt: new Date().toISOString(),
    };

    setActiveRecommendation(rec);

    const nextProfiles = profiles.map((p) =>
      p.id === cantera.id
        ? {
            ...p,
            recommendedByTitular: `@${titular.username}`,
          }
        : p
    );
    setProfiles(nextProfiles);
    broadcastSharedState(nextProfiles, activeLiveSession, broadcastHistory);
  };

  const blockUsername = (username: string) => {
    const clean = username.trim().replace(/^@+/, "");
    if (!clean) return;
    setBlockedUsernames((prev) =>
      prev.includes(clean) ? prev : [...prev, clean]
    );
  };

  const unblockUsername = (username: string) => {
    setBlockedUsernames((prev) => prev.filter((u) => u !== username));
  };

  const submitReport = (
    targetUsername: string,
    reason: ModerationReport["reason"],
    details: string
  ) => {
    const newReport: ModerationReport = {
      id: `rep-${Date.now()}`,
      reporterId: currentUser.id,
      targetUserId: targetUsername,
      targetUsername,
      reason,
      details,
      createdAt: new Date().toISOString(),
    };
    setReports((prev) => [newReport, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        profiles,
        transactions,
        activeDonationAlert,
        enqueueDonationAlert,
        dismissDonationAlert,
        graduationCelebrationUser,
        dismissGraduationCelebration: () => setGraduationCelebrationUser(null),
        activeRecommendation,
        dismissRecommendation: () => setActiveRecommendation(null),
        triggerPasaleTuGente,
        windowInstanceId,
        isHostWindow,
        activeLiveSession,
        broadcastHistory,
        startLiveBroadcast,
        endLiveBroadcast,
        joinLiveVoiceRoom,
        leaveLiveVoiceRoom,
        toggleParticipantMic,
        toggleHostMuteParticipant,
        setParticipantSpeakingState,
        openLiveRaceLobby,
        joinLiveRace,
        startLiveRaceCountdown,
        boostMyRacer,
        closeLiveRaceToRoom,
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
        openDefenseLobby,
        joinDefenseGame,
        startDefenseMatch,
        sendDefenseShot,
        defenseRematchAction,
        closeDefenseToRoom,
        getMyDefenseSeat,
        openTriviaLobby,
        joinTriviaGame,
        startTriviaMatch,
        submitTriviaAnswer,
        triviaRematchAction,
        closeTriviaToRoom,
        getMyTriviaSeat,
        pingTriviaTimerSync,
        isProfileModalOpen,
        setIsProfileModalOpen,
        createCustomProfile,
        updateCurrentProfile,
        switchProfile,
        sendGift,
        purchasePackage,
        addTestNovas,
        linkStripeConnect,
        withdrawCreatorEarnings,
        simulateGainFollower,
        simulateGainFollowerForCreator,
        resetAstroCaosTo99,
        blockedUsernames,
        blockUsername,
        unblockUsername,
        reports,
        submitReport,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp debe usarse dentro de AppProvider");
  }
  return ctx;
}
