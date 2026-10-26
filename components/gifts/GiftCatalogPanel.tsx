"use client";

import React, { useState } from "react";
import { Sparkles, Gift, Plus, AlertCircle, Layers } from "lucide-react";
import {
  NOVA_GIFT_CATALOG,
  type NovaGiftItem,
  type GiftLevelFrame,
  type GiftCollectionSet,
} from "@/lib/types";
import { useApp } from "@/context/AppContext";

interface GiftCatalogPanelProps {
  recipientName?: string;
  compact?: boolean;
  title?: string;
}

const COLLECTION_TABS: {
  id: "todos" | GiftCollectionSet;
  label: string;
  count: number;
}[] = [
  { id: "todos", label: "Todos los Regalos (27)", count: 27 },
  { id: "cosmico", label: "1. Cósmico NOVA (9)", count: 9 },
  { id: "diversion", label: "2. Diversión Neón (9)", count: 9 },
  { id: "leyendas", label: "3. Leyendas y Épicos (9)", count: 9 },
];

const LEVEL_GROUPS: {
  tier: GiftLevelFrame;
  title: string;
  subtitle: string;
  badgeClass: string;
  frameContainerClass: string;
  cardBorderClass: string;
  pillClass: string;
}[] = [
  {
    tier: "estrella",
    title: "Marco Nivel Estrella (Cian)",
    subtitle: "5 a 20 Novas • Animación Nivel Estrella con tu nombre",
    badgeClass:
      "border-neon-cyan bg-neon-cyan/20 text-neon-cyan shadow-neon-cyan",
    frameContainerClass:
      "rounded-3xl border-2 border-neon-cyan/75 bg-gradient-to-br from-[#062238]/85 via-[#07162c]/90 to-[#0a122c]/90 p-3.5 shadow-neon-cyan",
    cardBorderClass:
      "border-neon-cyan/60 bg-[#081c33]/90 hover:border-neon-cyan hover:shadow-neon-cyan",
    pillClass: "bg-neon-cyan text-slate-950",
  },
  {
    tier: "explosion",
    title: "Marco Nivel Explosión (Violeta)",
    subtitle: "25 a 90 Novas • Animación Explosión Nova en el en vivo",
    badgeClass:
      "border-neon-violet bg-neon-violet/25 text-fuchsia-100 shadow-neon-violet",
    frameContainerClass:
      "rounded-3xl border-2 border-neon-violet/80 bg-gradient-to-br from-[#230b42]/85 via-[#160b33]/90 to-[#091e36]/90 p-3.5 shadow-neon-violet",
    cardBorderClass:
      "border-neon-violet/60 bg-[#1a0b36]/90 hover:border-neon-violet hover:shadow-neon-violet",
    pillClass: "bg-neon-violet text-white",
  },
  {
    tier: "supernova",
    title: "Marco Nivel Supernova (Rosa / Dorado)",
    subtitle: "100 a 500 Novas • Espectáculo Supernova a pantalla casi completa",
    badgeClass:
      "border-neon-gold bg-gradient-to-r from-neon-magenta/40 to-amber-500/30 text-amber-200 shadow-neon-magenta",
    frameContainerClass:
      "rounded-3xl border-2 border-amber-400/85 bg-gradient-to-br from-[#38092f]/90 via-[#210938]/90 to-[#291807]/90 p-3.5 shadow-[0_0_28px_rgba(255,42,133,0.38)]",
    cardBorderClass:
      "border-amber-400/65 bg-[#290926]/90 hover:border-amber-300 hover:shadow-neon-magenta",
    pillClass:
      "bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 text-slate-950",
  },
];

export function GiftCatalogPanel({
  recipientName = "La Sala en Vivo",
  compact = false,
  title = "Panel Regalar — Los 27 Regalos Oficiales NOVA",
}: GiftCatalogPanelProps) {
  const { currentUser, sendGift, addTestNovas } = useApp();
  const [selectedSet, setSelectedSet] = useState<"todos" | GiftCollectionSet>(
    "todos"
  );
  const [customDonorName, setCustomDonorName] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastSentGift, setLastSentGift] = useState<NovaGiftItem | null>(null);

  const handleSendGift = (gift: NovaGiftItem) => {
    setErrorMsg(null);
    const res = sendGift(
      gift,
      customDonorName.trim() || currentUser.username,
      recipientName
    );
    if (!res.ok && res.error) {
      setErrorMsg(res.error);
      return;
    }
    setLastSentGift(gift);
  };

  const filteredCatalog =
    selectedSet === "todos"
      ? NOVA_GIFT_CATALOG
      : NOVA_GIFT_CATALOG.filter((g) => g.collectionSet === selectedSet);

  return (
    <div className="glass-card rounded-3xl p-4 sm:p-5 space-y-4">
      {/* Cabecera del Panel Regalar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neon-cyan/25 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-neon-cyan" />
            <h2 className="text-base sm:text-lg font-black text-white text-glow-cyan">
              {title}
            </h2>
          </div>
          <p className="text-xs font-semibold text-cyan-200/85 mt-0.5">
            Toca cualquiera de los <strong>27 regalos</strong> para disparar su
            animación exclusiva con tu nombre en{" "}
            <span className="font-black text-white">{recipientName}</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-neon-cyan/45 bg-[#07061c] px-2.5 py-1.5">
            <span className="text-[11px] font-bold text-cyan-200">
              Tu nombre:
            </span>
            <input
              type="text"
              value={customDonorName}
              onChange={(e) => setCustomDonorName(e.target.value)}
              placeholder={`@${currentUser.username}`}
              className="w-28 bg-transparent text-xs font-black text-white placeholder:text-cyan-300/60 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              addTestNovas(1000);
              setErrorMsg(null);
            }}
            className="btn-neon-cyan inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-black"
            title="Sumar 1,000 NOVAS gratis en modo prueba para probar todos los regalos"
          >
            <Plus className="h-3.5 w-3.5 stroke-[3]" />
            <span>+1,000 NOVAS Prueba</span>
          </button>
        </div>
      </div>

      {/* Pestañas para filtrar entre las 3 Láminas o ver los 27 juntos */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-bold text-cyan-200 mr-1">
          <Layers className="h-3.5 w-3.5 text-neon-cyan" />
          Colección:
        </span>
        {COLLECTION_TABS.map((tab) => {
          const active = selectedSet === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedSet(tab.id)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-black transition ${
                active
                  ? "border-neon-cyan bg-neon-cyan/20 text-neon-cyan shadow-neon-cyan"
                  : "border-white/15 bg-space-900/75 text-slate-200 hover:border-neon-cyan/40"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Aviso de saldo insuficiente si ocurre */}
      {errorMsg && (
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-neon-magenta bg-neon-magenta/20 px-4 py-2.5 text-xs font-bold text-pink-100">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-neon-magenta shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              addTestNovas(1000);
              setErrorMsg(null);
            }}
            className="btn-neon-cyan rounded-lg px-2.5 py-1 text-[11px] font-black shrink-0"
          >
            +1,000 NOVAS Gratis
          </button>
        </div>
      )}

      {/* Los 3 Marcos de Nivel con los Regalos Filtrados */}
      <div className="space-y-4">
        {LEVEL_GROUPS.map((group) => {
          const groupGifts = filteredCatalog.filter(
            (g) => g.frameTier === group.tier
          );
          if (groupGifts.length === 0) return null;

          return (
            <div key={group.tier} className={group.frameContainerClass}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-black uppercase tracking-wider ${group.badgeClass}`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {group.title} ({groupGifts.length})
                </span>
                <span className="text-[11px] font-bold text-slate-200/90">
                  {group.subtitle}
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-2.5 sm:gap-3.5">
                {groupGifts.map((gift) => (
                  <button
                    key={gift.id}
                    type="button"
                    onClick={() => handleSendGift(gift)}
                    className={`group relative flex flex-col items-center justify-between rounded-2xl border p-2.5 sm:p-3.5 text-center transition-all duration-200 hover:-translate-y-1 active:scale-95 ${group.cardBorderClass}`}
                  >
                    {/* Etiqueta de colección arriba */}
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-cyan-200">
                      {gift.collectionLabel}
                    </span>

                    {/* Imagen 512x512 transparente del ícono (al pasar el mouse previsualiza su animación) */}
                    <div
                      className={`relative my-1 flex items-center justify-center ${
                        compact
                          ? "h-16 w-16 sm:h-20 sm:w-20"
                          : "h-20 w-20 sm:h-24 sm:w-24"
                      }`}
                    >
                      <img
                        src={gift.pngUrl}
                        alt={gift.name}
                        className={`h-full w-full object-contain transition-transform duration-300 group-hover:${gift.signatureAnimation}`}
                      />
                    </div>

                    {/* Nombre del regalo */}
                    <span className="block text-xs sm:text-sm font-black text-white leading-tight">
                      {gift.name}
                    </span>

                    {/* Descripción de la animación propia */}
                    {!compact && (
                      <span className="mt-0.5 hidden sm:block text-[10px] font-semibold text-cyan-200/85 line-clamp-1">
                        {gift.animationDescription}
                      </span>
                    )}

                    {/* Precio en Novas debajo */}
                    <span
                      className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-[11px] sm:text-xs font-black shadow-sm ${group.pillClass}`}
                    >
                      <span>{gift.novas} NOVAS</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {lastSentGift && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-neon-cyan/50 bg-neon-cyan/10 px-4 py-2.5 text-xs text-cyan-100">
          <span>
            Último regalo:{" "}
            <strong className="text-white">{lastSentGift.name}</strong> (
            {lastSentGift.novas} NOVAS = \$
            {(lastSentGift.novas * 0.01).toFixed(2)} USD) →{" "}
            <strong className="text-neon-emerald">
              +\${(lastSentGift.novas * 0.01 * 0.77).toFixed(2)} USD al Creador
              (77%)
            </strong>{" "}
            • \${(lastSentGift.novas * 0.01 * 0.2).toFixed(2)} Plataforma (20%)
            • \${(lastSentGift.novas * 0.01 * 0.03).toFixed(2)} Stripe (3%)
          </span>
          <span className="font-black text-neon-emerald">
            ¡77% acreditado al creador!
          </span>
        </div>
      )}
    </div>
  );
}
