"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Film,
  Heart,
  MessageCircle,
  Share2,
  Gift,
  Plus,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Radio,
  Gamepad2,
  Sparkles,
  ChevronUp,
  ChevronDown,
  X,
  Send,
  Upload,
  Check,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NOVA_GIFT_CATALOG, type NovaGiftItem } from "@/lib/types";

export interface NovaReel {
  id: string;
  creatorId: string;
  creatorUsername: string;
  creatorDisplayName: string;
  creatorAvatar: string;
  title: string;
  description: string;
  gameTag: "Carrera Galáctica" | "El Impostor" | "Defiende la Nave" | "Trivia Galáctica" | "Charla Libre";
  videoUrl?: string;
  accentColor: string;
  gradient: string;
  likesCount: number;
  commentsCount: number;
  novasTipsCount: number;
  sharesCount: number;
  createdAt: string;
}

const INITIAL_REELS: NovaReel[] = [
  {
    id: "reel-1",
    creatorId: "user-luna",
    creatorUsername: "Luna_Gamer",
    creatorDisplayName: "Luna Gamer",
    creatorAvatar: "🎮",
    title: "¡Remontada brutal en Carrera Galáctica a 120 FPS! 🏎️⚡",
    description: "Estaba en 4to lugar y con el turbo en la última curva ganamos la carrera en vivo con 40 espectadores gritando.",
    gameTag: "Carrera Galáctica",
    accentColor: "#00f5ff",
    gradient: "from-[#081b29] via-[#04101e] to-[#010811]",
    likesCount: 1420,
    commentsCount: 89,
    novasTipsCount: 350,
    sharesCount: 124,
    createdAt: "Hace 2 horas",
  },
  {
    id: "reel-2",
    creatorId: "user-dani",
    creatorUsername: "dani",
    creatorDisplayName: "Dani",
    creatorAvatar: "🚀",
    title: "Descubriendo al impostor en el último segundo con voto unánime 🕵️🛸",
    description: "Nadie sospechaba del tripulante azul hasta que dio la pista incorrecta. ¡Ronda perfecta en La Sala!",
    gameTag: "El Impostor",
    accentColor: "#a855f7",
    gradient: "from-[#1e082b] via-[#12041d] to-[#07010e]",
    likesCount: 980,
    commentsCount: 47,
    novasTipsCount: 220,
    sharesCount: 76,
    createdAt: "Hace 4 horas",
  },
  {
    id: "reel-3",
    creatorId: "user-kael",
    creatorUsername: "Kael_Stream",
    creatorDisplayName: "Kael Stream",
    creatorAvatar: "⚡",
    title: "Disparo cuádruple en Defiende la Nave salvando la estación 🛡️💥",
    description: "El asteroide titánico estaba a 3 metros del escudo central y todos coordinaron el fuego cruzado.",
    gameTag: "Defiende la Nave",
    accentColor: "#ec4899",
    gradient: "from-[#29081a] via-[#1a0311] to-[#0a0107]",
    likesCount: 2150,
    commentsCount: 134,
    novasTipsCount: 840,
    sharesCount: 310,
    createdAt: "Ayer",
  },
  {
    id: "reel-4",
    creatorId: "user-drack",
    creatorUsername: "Drack",
    creatorDisplayName: "Dracky",
    creatorAvatar: "👑",
    title: "¡Graduación de La Cantera a Creador Titular en vivo! 🎉🚀",
    description: "Superamos los requisitos económicos del 77/20/3 frente a toda la comunidad. ¡Gracias a todos los que apoyan!",
    gameTag: "Charla Libre",
    accentColor: "#eab308",
    gradient: "from-[#241e04] via-[#151102] to-[#080701]",
    likesCount: 3410,
    commentsCount: 256,
    novasTipsCount: 1500,
    sharesCount: 520,
    createdAt: "Hace 2 días",
  },
];

const STORAGE_KEY_REELS = "nova_live_reels_v2";

export default function ReelsPage() {
  const { currentUser, activeLiveSessions, sendGift } = useApp();

  const [reels, setReels] = useState<NovaReel[]>(INITIAL_REELS);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});
  const [doubleTapHeart, setDoubleTapHeart] = useState<{ id: string; x: number; y: number } | null>(null);

  // Modales
  const [isCommentsOpen, setIsCommentsOpen] = useState<boolean>(false);
  const [commentsMap, setCommentsMap] = useState<Record<string, { id: string; user: string; text: string; time: string }[]>>({
    "reel-1": [
      { id: "c1", user: "Mateo_Cantera", text: "¡Qué final tan tenso hermano! 🔥", time: "1h" },
      { id: "c2", user: "Valeria_Titan", text: "Ese boost en la curva fue legendario.", time: "45m" },
    ],
    "reel-2": [
      { id: "c3", user: "Astro_Racer", text: "Sabía que era él desde la primera pista jajaja", time: "2h" },
    ],
  });
  const [newCommentText, setNewCommentText] = useState<string>("");

  const [isTipModalOpen, setIsTipModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Formulario de subir clip
  const [uploadTitle, setUploadTitle] = useState<string>("");
  const [uploadDescription, setUploadDescription] = useState<string>("");
  const [uploadGameTag, setUploadGameTag] = useState<NovaReel["gameTag"]>("Carrera Galáctica");
  const [uploadVideoFile, setUploadVideoFile] = useState<string | null>(null);

  // Carga inicial
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_REELS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReels(parsed);
        }
      }
    } catch {
      // Ignorar
    }
  }, []);

  const saveReels = (next: NovaReel[]) => {
    setReels(next);
    try {
      localStorage.setItem(STORAGE_KEY_REELS, JSON.stringify(next));
    } catch {
      // Ignorar
    }
  };

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 2500);
  };

  const currentReel = reels[activeIndex] || reels[0];

  // Comprobar si el creador de este reel está transmitiendo en vivo en este instante
  const isCreatorCurrentlyLive = activeLiveSessions.some(
    (s) =>
      s.hostId === currentReel?.creatorId ||
      s.hostUsername.toLowerCase() === currentReel?.creatorUsername.toLowerCase()
  );

  // Navegación entre clips
  const handleNext = () => {
    if (activeIndex < reels.length - 1) {
      setActiveIndex((prev) => prev + 1);
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
      setIsPlaying(true);
    }
  };

  // Teclado (flechas arriba/abajo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCommentsOpen || isUploadModalOpen || isTipModalOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((v) => !v);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, reels.length, isCommentsOpen, isUploadModalOpen, isTipModalOpen]);

  // Dar like cósmico
  const handleToggleLike = (reelId: string) => {
    const isLiked = likedReels[reelId];
    setLikedReels((prev) => ({ ...prev, [reelId]: !isLiked }));
    const updated = reels.map((r) =>
      r.id === reelId
        ? { ...r, likesCount: isLiked ? r.likesCount - 1 : r.likesCount + 1 }
        : r
    );
    saveReels(updated);
  };

  // Doble toque en pantalla
  const handleDoubleTap = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setDoubleTapHeart({ id: currentReel.id, x, y });
    setTimeout(() => setDoubleTapHeart(null), 850);

    if (!likedReels[currentReel.id]) {
      handleToggleLike(currentReel.id);
    }
  };

  // Compartir clip
  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentReel.title,
          text: `Mira este clip de @${currentReel.creatorUsername} en NOVA Live: ${currentReel.title}`,
          url: shareUrl,
        });
        showToast("¡Enlace compartido!");
        return;
      } catch {
        // Ignorar rechazo
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("¡Enlace del reel copiado al portapapeles!");
    } catch {
      showToast("Enlace listo para compartir");
    }
  };

  // Enviar comentario
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment = {
      id: `comm-${Date.now()}`,
      user: currentUser.username,
      text: newCommentText.trim(),
      time: "Ahora",
    };

    const curList = commentsMap[currentReel.id] || [];
    setCommentsMap((prev) => ({
      ...prev,
      [currentReel.id]: [newComment, ...curList],
    }));
    setNewCommentText("");

    const updated = reels.map((r) =>
      r.id === currentReel.id ? { ...r, commentsCount: r.commentsCount + 1 } : r
    );
    saveReels(updated);
  };

  // Enviar propina en Novas al clip
  const handleSendReelTip = (novas: number) => {
    const baseGift =
      NOVA_GIFT_CATALOG.find((g) => g.novas <= novas) || NOVA_GIFT_CATALOG[0];
    const giftToSend: NovaGiftItem = {
      ...baseGift,
      id: `tip-reel-${Date.now()}`,
      name: `Propina ${novas} NOVAS`,
      novas,
    };

    const res = sendGift(
      giftToSend,
      currentUser.username,
      currentReel.creatorDisplayName,
      currentReel.creatorId
    );

    if (res.ok) {
      const updated = reels.map((r) =>
        r.id === currentReel.id
          ? { ...r, novasTipsCount: r.novasTipsCount + novas }
          : r
      );
      saveReels(updated);
      setIsTipModalOpen(false);
      showToast(`¡Enviaste ${novas} NOVAS de propina a @${currentReel.creatorUsername}!`);
    } else {
      showToast(res.error || "Saldo insuficiente");
    }
  };

  // Subir nuevo reel
  const handleUploadReel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      showToast("Por favor escribe un título para el clip");
      return;
    }

    const newReel: NovaReel = {
      id: `reel-${Date.now()}`,
      creatorId: currentUser.id,
      creatorUsername: currentUser.username,
      creatorDisplayName: currentUser.displayName,
      creatorAvatar: currentUser.avatarUrl,
      title: uploadTitle.trim(),
      description: uploadDescription.trim() || "Clip oficial compartido en NOVA.",
      gameTag: uploadGameTag,
      videoUrl: uploadVideoFile || undefined,
      accentColor: "#00f5ff",
      gradient: "from-[#081b29] via-[#0b1021] to-[#02050e]",
      likesCount: 1,
      commentsCount: 0,
      novasTipsCount: 0,
      sharesCount: 0,
      createdAt: "Recién subido",
    };

    const next = [newReel, ...reels];
    saveReels(next);
    setActiveIndex(0);
    setIsUploadModalOpen(false);
    setUploadTitle("");
    setUploadDescription("");
    setUploadVideoFile(null);
    showToast("🎉 ¡Tu Reel ha sido publicado en el feed!");
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center py-2 sm:py-4 px-2 select-none">
      {/* Toast Notification */}
      {toastNotice && (
        <div className="fixed top-20 z-50 left-1/2 -translate-x-1/2 rounded-2xl border border-neon-cyan/70 bg-space-950/95 px-5 py-2.5 text-xs font-black text-neon-cyan shadow-[0_0_25px_rgba(0,245,255,0.4)] animate-bounce">
          {toastNotice}
        </div>
      )}

      {/* Contenedor Vertical de Pantalla Completa del Reel (Estilo Móvil Inmersivo) */}
      <div className="relative w-full max-w-[420px] h-[80vh] min-h-[580px] max-h-[760px] rounded-3xl overflow-hidden border-2 border-neon-cyan/40 bg-space-950 shadow-[0_0_50px_rgba(0,245,255,0.25)] flex flex-col justify-between">
        
        {/* Fondo Visual Galáctico del Clip con Animación Fluida */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${currentReel.gradient} transition-all duration-500`}
          onDoubleClick={handleDoubleTap}
        >
          {/* Si tiene archivo de video cargado por el usuario, reproducirlo */}
          {currentReel.videoUrl ? (
            <video
              src={currentReel.videoUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            /* Animación Cósmica Simulada en Vivo (Efecto Galáctico de Alta Energía) */
            <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
              <div
                className="absolute w-96 h-96 rounded-full blur-3xl opacity-35 animate-soft-pulse pointer-events-none"
                style={{ backgroundColor: currentReel.accentColor }}
              />
              <div className="relative z-10 text-center px-6 space-y-3">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl border border-white/20 bg-space-900/60 backdrop-blur-md shadow-neon-cyan">
                  <span className="text-5xl">{currentReel.creatorAvatar}</span>
                </div>
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-black uppercase text-cyan-200">
                    <Gamepad2 className="h-3.5 w-3.5 text-neon-cyan" />
                    <span>{currentReel.gameTag}</span>
                  </span>
                  <p className="text-xs text-cyan-100/70 italic">
                    Reproducción de Clip en Calidad HD • NOVA 60 FPS
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Animación del Corazón Cósmico Gigante en Doble Toque */}
          {doubleTapHeart && (
            <div
              className="absolute z-40 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-ping duration-700"
              style={{ left: doubleTapHeart.x, top: doubleTapHeart.y }}
            >
              <Heart className="h-24 w-24 fill-rose-500 text-rose-400 drop-shadow-[0_0_30px_rgba(244,63,94,0.9)]" />
            </div>
          )}
        </div>

        {/* ===================================================================
            BARRA SUPERIOR: PESTAÑA REELS + AUDIO MUTE + BOTÓN SUBIR CLIP
            =================================================================== */}
        <div className="relative z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-magenta/60 bg-neon-magenta/20 px-3 py-1 text-xs font-black text-pink-300 shadow-neon-magenta">
              <Film className="h-3.5 w-3.5" />
              <span>NOVA REELS</span>
            </span>
            <span className="text-[11px] font-extrabold text-white/70">
              {activeIndex + 1}/{reels.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Silenciar / Activar Audio */}
            <button
              type="button"
              onClick={() => setIsMuted((v) => !v)}
              className="p-2 rounded-full border border-white/15 bg-black/50 text-white hover:text-neon-cyan backdrop-blur-md transition"
              title={isMuted ? "Activar audio" : "Silenciar"}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>

            {/* Subir Nuevo Clip */}
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-neon-cyan/70 bg-neon-cyan/20 px-3 py-1 text-xs font-black text-neon-cyan shadow-neon-cyan hover:bg-neon-cyan/30 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Subir Clip</span>
            </button>
          </div>
        </div>

        {/* ===================================================================
            LADO DERECHO: DOCK FLOTANTE DE ACCIONES (LIKE, CHAT, DONAR, SHARE)
            =================================================================== */}
        <div className="relative z-20 self-end mr-3 flex flex-col items-center gap-4 mb-20">
          {/* Avatar del Creador con Insignia de En Vivo si está transmitiendo */}
          <div className="relative group cursor-pointer">
            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl backdrop-blur-md ${
              isCreatorCurrentlyLive
                ? "border-rose-500 bg-rose-950/70 shadow-[0_0_15px_rgba(244,63,94,0.8)] animate-soft-pulse"
                : "border-neon-cyan/80 bg-space-900/80"
            }`}>
              {currentReel.creatorAvatar}
            </div>
            {isCreatorCurrentlyLive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-rose-600 px-1.5 py-0.2 text-[8px] font-black uppercase text-white shadow-md">
                LIVE
              </span>
            )}
          </div>

          {/* Botón de Like Cósmico */}
          <button
            type="button"
            onClick={() => handleToggleLike(currentReel.id)}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className={`p-2.5 rounded-full border backdrop-blur-md transition-all duration-200 group-hover:scale-110 ${
              likedReels[currentReel.id]
                ? "border-rose-500 bg-rose-600/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.6)]"
                : "border-white/20 bg-black/40 text-white hover:text-rose-400"
            }`}>
              <Heart className={`h-6 w-6 ${likedReels[currentReel.id] ? "fill-current" : ""}`} />
            </div>
            <span className="text-[11px] font-black text-white drop-shadow">
              {currentReel.likesCount}
            </span>
          </button>

          {/* Botón de Comentarios */}
          <button
            type="button"
            onClick={() => setIsCommentsOpen(true)}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="p-2.5 rounded-full border border-white/20 bg-black/40 text-white group-hover:text-neon-cyan group-hover:scale-110 backdrop-blur-md transition">
              <MessageCircle className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-black text-white drop-shadow">
              {currentReel.commentsCount}
            </span>
          </button>

          {/* Botón de Enviar Novas al Reel */}
          <button
            type="button"
            onClick={() => setIsTipModalOpen(true)}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="p-2.5 rounded-full border border-amber-400/60 bg-amber-500/20 text-amber-300 group-hover:scale-110 shadow-[0_0_15px_rgba(251,191,36,0.4)] backdrop-blur-md transition">
              <Gift className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-black text-amber-300 drop-shadow">
              {currentReel.novasTipsCount} N
            </span>
          </button>

          {/* Botón de Compartir */}
          <button
            type="button"
            onClick={handleShare}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="p-2.5 rounded-full border border-white/20 bg-black/40 text-white group-hover:text-neon-emerald group-hover:scale-110 backdrop-blur-md transition">
              <Share2 className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-black text-white drop-shadow">
              {currentReel.sharesCount}
            </span>
          </button>
        </div>

        {/* ===================================================================
            PARTE INFERIOR: INFORMACIÓN DEL CREADOR + TÍTULO + LINK AL LIVE
            =================================================================== */}
        <div className="relative z-20 p-4 bg-gradient-to-t from-black/95 via-black/75 to-transparent space-y-2">
          {/* Creador y badge de En Vivo */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-black text-white text-glow-cyan">
              {currentReel.creatorDisplayName}
            </span>
            <span className="text-xs font-bold text-neon-cyan">
              @{currentReel.creatorUsername}
            </span>

            {/* Si el creador está en vivo en La Sala, enlace directo de 1 clic */}
            {isCreatorCurrentlyLive && (
              <Link
                href={`/la-sala?host=${currentReel.creatorUsername}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-black uppercase text-white shadow-[0_0_15px_rgba(244,63,94,0.7)] animate-soft-pulse hover:bg-rose-500 transition"
              >
                <Radio className="h-3 w-3" />
                <span>EN VIVO AHORA</span>
              </Link>
            )}
          </div>

          {/* Título y descripción */}
          <p className="text-xs sm:text-sm font-bold text-white line-clamp-2">
            {currentReel.title}
          </p>
          <p className="text-[11px] text-cyan-200/80 line-clamp-2 leading-tight">
            {currentReel.description}
          </p>

          {/* Controles de Navegación Rápida (Siguiente / Anterior) */}
          <div className="flex items-center justify-between pt-1 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                disabled={activeIndex === 0}
                className="p-1.5 rounded-xl border border-white/15 bg-white/10 text-white disabled:opacity-30 hover:border-neon-cyan transition cursor-pointer"
                title="Clip anterior"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={activeIndex === reels.length - 1}
                className="p-1.5 rounded-xl border border-white/15 bg-white/10 text-white disabled:opacity-30 hover:border-neon-cyan transition cursor-pointer"
                title="Siguiente clip"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <span className="text-[11px] text-slate-300 font-bold ml-1">
                Usa las flechas ↑ ↓ para navegar
              </span>
            </div>

            <span className="text-[10px] font-bold text-cyan-300 uppercase">
              {currentReel.createdAt}
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          MODAL SLIDE-UP: COMENTARIOS GALÁCTICOS
          ===================================================================== */}
      {isCommentsOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-neon-cyan/50 bg-space-950 p-4 sm:p-5 space-y-4 max-h-[80vh] flex flex-col shadow-[0_0_40px_rgba(0,245,255,0.3)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-neon-cyan" />
                <h3 className="text-sm font-black text-white">
                  Comentarios ({commentsMap[currentReel.id]?.length || 0})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCommentsOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Lista de comentarios */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-60 scrollbar-none">
              {(commentsMap[currentReel.id] || []).length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">
                  Sé el primero en comentar este clip cósmico.
                </p>
              ) : (
                (commentsMap[currentReel.id] || []).map((c) => (
                  <div key={c.id} className="rounded-2xl border border-white/10 bg-space-900/60 p-2.5 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-black text-cyan-200">
                      <span>@{c.user}</span>
                      <span className="text-slate-400 font-normal">{c.time}</span>
                    </div>
                    <p className="text-white mt-1 font-bold">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Input para nuevo comentario */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2 border-t border-white/10">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Escribe un comentario..."
                className="flex-1 rounded-xl border border-neon-cyan/40 bg-space-900 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-neon-cyan"
              />
              <button
                type="submit"
                className="btn-neon-gradient rounded-xl p-2.5 text-white flex items-center justify-center cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: ENVIAR PROPINA EN NOVAS AL REEL
          ===================================================================== */}
      {isTipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border border-amber-400/60 bg-space-950 p-5 space-y-4 shadow-[0_0_40px_rgba(251,191,36,0.35)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-black text-white">
                  Propina a @{currentReel.creatorUsername}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTipModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-amber-200/90">
              Recompensa este momento épico. El 77% va directo al creador con retiro a banco.
            </p>

            <div className="grid grid-cols-3 gap-2.5">
              {[25, 100, 500].map((novas) => (
                <button
                  key={novas}
                  type="button"
                  onClick={() => handleSendReelTip(novas)}
                  className="rounded-2xl border border-amber-400/50 bg-amber-500/15 p-3 flex flex-col items-center gap-1 hover:bg-amber-500/30 transition cursor-pointer"
                >
                  <span className="text-xl">⚡</span>
                  <span className="text-sm font-black text-white">{novas}</span>
                  <span className="text-[10px] font-bold text-amber-300">NOVAS</span>
                </button>
              ))}
            </div>

            <div className="text-center pt-1">
              <p className="text-[11px] text-slate-300">
                Tu saldo actual: <strong className="text-amber-300">{currentUser.novaBalance} NOVAS</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: SUBIR NUEVO CLIP / REEL
          ===================================================================== */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl border border-neon-cyan/60 bg-space-950 p-5 space-y-4 shadow-[0_0_40px_rgba(0,245,255,0.35)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Film className="h-5 w-5 text-neon-cyan" />
                <h3 className="text-sm sm:text-base font-black text-white">
                  Subir Nuevo Reel a NOVA
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadReel} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black text-cyan-200 mb-1">
                  Título del Clip:
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Ej: Jugada épica en el último segundo"
                  className="w-full rounded-xl border border-neon-cyan/40 bg-space-900 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-neon-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-cyan-200 mb-1">
                  Descripción o etiquetas:
                </label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Cuenta qué pasó en esta jugada..."
                  rows={2}
                  className="w-full rounded-xl border border-neon-cyan/40 bg-space-900 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-neon-cyan resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-cyan-200 mb-1">
                  Categoría del Juego:
                </label>
                <select
                  value={uploadGameTag}
                  onChange={(e) => setUploadGameTag(e.target.value as NovaReel["gameTag"])}
                  className="w-full rounded-xl border border-neon-cyan/40 bg-space-900 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-neon-cyan"
                >
                  <option value="Carrera Galáctica">🏎️ Carrera Galáctica</option>
                  <option value="El Impostor">🕵️ El Impostor</option>
                  <option value="Defiende la Nave">🛸 Defiende la Nave</option>
                  <option value="Trivia Galáctica">🧠 Trivia Galáctica</option>
                  <option value="Charla Libre">🌌 Charla Libre</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-cyan-200 mb-1">
                  Archivo de Video (desde tu teléfono o PC):
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setUploadVideoFile(url);
                    }
                  }}
                  className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-neon-cyan/20 file:text-neon-cyan hover:file:bg-neon-cyan/30 cursor-pointer"
                />
                <p className="text-[10px] text-cyan-200/60 mt-1">
                  * Si no seleccionas un video, se generará una tarjeta cósmica animada en tiempo real.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-neon-gradient w-full rounded-2xl py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-neon-cyan cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>Publicar Reel en NOVA</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
