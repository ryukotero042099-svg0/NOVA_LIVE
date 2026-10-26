"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Gift,
  Sparkles,
  Coins,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  NOVA_GIFT_CATALOG,
  type NovaGiftItem,
  type ActiveLiveSession,
} from "@/lib/types";

interface LiveRoomGiftModalProps {
  session: ActiveLiveSession;
  isOpen: boolean;
  onClose: () => void;
}

export function LiveRoomGiftModal({
  session,
  isOpen,
  onClose,
}: LiveRoomGiftModalProps) {
  const { currentUser, sendGift, addTestNovas } = useApp();
  const [selectedTier, setSelectedTier] = useState<
    "all" | "estrella" | "explosion" | "supernova"
  >("all");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredGifts = NOVA_GIFT_CATALOG.filter((gift) => {
    if (selectedTier === "all") return true;
    return gift.frameTier === selectedTier;
  });

  const handleSendGift = (gift: NovaGiftItem) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = sendGift(
      gift,
      currentUser.displayName || currentUser.username,
      session.hostDisplayName,
      session.hostId
    );

    if (result.ok) {
      setSuccessMessage(
        `¡Enviaste ${gift.name} (${gift.novas} NOVAS) a ${session.hostDisplayName}!`
      );
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1200);
    } else {
      setErrorMessage(result.error || "No se pudo enviar el regalo.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border-2 border-neon-cyan/60 bg-gradient-to-b from-space-900/95 via-space-950/95 to-[#060417]/98 shadow-[0_0_60px_rgba(0,240,255,0.35)] overflow-hidden">
        {/* Header del Modal */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 sm:px-6 py-4 bg-space-950/80">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-neon-cyan to-neon-magenta text-slate-950 shadow-neon-cyan">
              <Gift className="h-6 w-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white text-glow-cyan">
                  Enviar Regalo a {session.hostAvatar} {session.hostDisplayName}
                </h3>
                <span className="rounded-full bg-white/10 border border-white/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-neon-cyan">
                  @{session.hostUsername}
                </span>
              </div>
              <p className="text-xs text-cyan-200/80 mt-0.5">
                Reparto 77/20/3: El Creador recibe el{" "}
                <strong className="text-neon-emerald">77%</strong> del valor
                directo a sus ganancias.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Barra de Saldo del Usuario y Recarga de Prueba */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 sm:px-6 py-3 bg-[#0a0724]/70">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-amber-300" />
            <span className="text-xs font-bold text-slate-300">
              Tu saldo disponible:
            </span>
            <span className="text-sm font-black text-amber-300">
              {currentUser.novaBalance.toLocaleString()} NOVAS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                addTestNovas(1000);
                setErrorMessage(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/50 bg-amber-400/15 px-3 py-1.5 text-xs font-black text-amber-200 hover:bg-amber-400/25 transition cursor-pointer shadow-sm"
              title="Añadir 1,000 Novas de prueba a tu saldo"
            >
              <span>+1,000 Novas (Prueba)</span>
            </button>
            <Link
              href="/monedero"
              className="inline-flex items-center gap-1.5 rounded-xl border border-neon-cyan/40 bg-neon-cyan/10 px-3 py-1.5 text-xs font-bold text-cyan-200 hover:bg-neon-cyan/20 hover:text-white transition"
              title="Ir al Monedero para recargar Novas"
            >
              <span>Recargar en Monedero →</span>
            </Link>
          </div>
        </div>

        {/* Alertas de Éxito o Error */}
        {successMessage && (
          <div className="mx-5 sm:mx-6 mt-3 rounded-2xl border border-neon-emerald/60 bg-emerald-950/80 px-4 py-2.5 text-xs font-bold text-emerald-200 flex items-center gap-2 shadow-lg">
            <CheckCircle2 className="h-4 w-4 text-neon-emerald shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mx-5 sm:mx-6 mt-3 rounded-2xl border border-rose-500/60 bg-rose-950/80 px-4 py-2.5 text-xs font-bold text-rose-200 flex items-center gap-2 shadow-lg">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Filtros por Nivel de Regalo */}
        <div className="px-5 sm:px-6 pt-3 pb-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedTier("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
              selectedTier === "all"
                ? "bg-white text-slate-950 shadow-md"
                : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            Todos ({NOVA_GIFT_CATALOG.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTier("estrella")}
            className={`rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
              selectedTier === "estrella"
                ? "bg-neon-cyan text-slate-950 shadow-neon-cyan"
                : "border border-neon-cyan/30 bg-neon-cyan/10 text-cyan-200 hover:bg-neon-cyan/20"
            }`}
          >
            ★ Nivel Estrella (5–24 NOVAS)
          </button>
          <button
            type="button"
            onClick={() => setSelectedTier("explosion")}
            className={`rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
              selectedTier === "explosion"
                ? "bg-neon-violet text-white shadow-neon-violet"
                : "border border-neon-violet/30 bg-neon-violet/10 text-fuchsia-200 hover:bg-neon-violet/20"
            }`}
          >
            💥 Nivel Explosión (25–99 NOVAS)
          </button>
          <button
            type="button"
            onClick={() => setSelectedTier("supernova")}
            className={`rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
              selectedTier === "supernova"
                ? "bg-gradient-to-r from-neon-magenta to-amber-400 text-slate-950 font-black shadow-neon-gold"
                : "border border-amber-400/30 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20"
            }`}
          >
            🌌 Nivel Supernova (100–500 NOVAS)
          </button>
        </div>

        {/* Catálogo de Regalos en Cuadrícula Scrollable */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredGifts.map((gift) => {
              const canAfford = currentUser.novaBalance >= gift.novas;
              const isEstrella = gift.frameTier === "estrella";
              const isExplosion = gift.frameTier === "explosion";
              const isSupernova = gift.frameTier === "supernova";

              return (
                <div
                  key={gift.id}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-3 transition-all duration-200 ${
                    isSupernova
                      ? "border-amber-400/40 bg-gradient-to-b from-[#250d30]/80 to-space-950/90 hover:border-amber-400 shadow-sm"
                      : isExplosion
                      ? "border-neon-violet/40 bg-gradient-to-b from-[#1b0d35]/80 to-space-950/90 hover:border-neon-violet shadow-sm"
                      : "border-neon-cyan/30 bg-gradient-to-b from-[#0a1b2e]/80 to-space-950/90 hover:border-neon-cyan shadow-sm"
                  }`}
                >
                  {/* Insignia de Nivel */}
                  <div className="flex items-center justify-between text-[10px] font-black uppercase mb-1">
                    <span
                      className={`rounded-md px-1.5 py-0.5 ${
                        isSupernova
                          ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                          : isExplosion
                          ? "bg-neon-violet/20 text-fuchsia-300 border border-neon-violet/40"
                          : "bg-neon-cyan/20 text-cyan-300 border border-neon-cyan/40"
                      }`}
                    >
                      {isSupernova
                        ? "🌌 Supernova"
                        : isExplosion
                        ? "💥 Explosión"
                        : "★ Estrella"}
                    </span>
                    <span className="text-slate-400 text-[9px]">
                      {gift.collectionLabel}
                    </span>
                  </div>

                  {/* Icono del Regalo */}
                  <div className="my-2 flex h-20 items-center justify-center">
                    <img
                      src={gift.pngUrl}
                      alt={gift.name}
                      className="h-16 w-16 object-contain group-hover:scale-110 transition-transform duration-200"
                    />
                  </div>

                  {/* Info y Precio */}
                  <div className="space-y-1 text-center">
                    <p className="text-xs font-black text-white truncate">
                      {gift.name}
                    </p>
                    <p className="text-[11px] font-black text-amber-300">
                      {gift.novas} NOVAS
                    </p>
                    <p className="text-[10px] text-cyan-200/70 truncate" title={gift.gameEffectLabel}>
                      ⚡ {gift.gameEffectLabel}
                    </p>
                  </div>

                  {/* Botón de Enviar */}
                  <button
                    type="button"
                    onClick={() => handleSendGift(gift)}
                    disabled={!canAfford}
                    className={`mt-2.5 w-full rounded-xl py-2 text-xs font-black transition cursor-pointer flex items-center justify-center gap-1 ${
                      canAfford
                        ? isSupernova
                          ? "btn-neon-gradient text-white shadow-neon-magenta hover:brightness-110"
                          : isExplosion
                          ? "bg-neon-violet hover:bg-neon-violet/90 text-white shadow-neon-violet"
                          : "bg-neon-cyan hover:bg-neon-cyan/90 text-slate-950 shadow-neon-cyan"
                        : "border border-white/10 bg-white/5 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    {canAfford ? (
                      <>
                        <Gift className="h-3.5 w-3.5" />
                        <span>Regalar</span>
                      </>
                    ) : (
                      <span>Faltan Novas</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Informativo */}
        <div className="border-t border-white/10 px-5 sm:px-6 py-3 bg-space-950/90 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-neon-cyan" />
            <span>
              Animación sincronizada en todas las pantallas de La Sala en cola
              ordenada.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">
              77% Creador • 20% Plataforma • 3% Stripe
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
