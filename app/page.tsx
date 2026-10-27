"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flame,
  Rocket,
  Users,
  CheckCircle2,
  Shield,
  UserPlus,
  Send,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Award,
  DollarSign,
  Clock,
  X,
  Radio,
  Film,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NOVA_ECONOMY_RULES, type UserProfile } from "@/lib/types";
import { GiftCatalogPanel } from "@/components/gifts/GiftCatalogPanel";
import { PasaleTuGenteModal } from "@/components/discovery/PasaleTuGenteModal";

export default function HomePageStep4() {
  const router = useRouter();
  const {
    currentUser,
    profiles,
    setIsProfileModalOpen,
    simulateGainFollowerForCreator,
    activeRecommendation,
    dismissRecommendation,
    selectLiveSession,
  } = useApp();

  const [titularForRaid, setTitularForRaid] = useState<UserProfile | null>(
    null
  );

  const titularesList = profiles.filter((p) => p.tier === "titular");
  const canteraList = profiles.filter((p) => p.tier === "cantera");

  return (
    <div className="space-y-6">
      {/* Modal de "Pásale tu gente" */}
      <PasaleTuGenteModal
        fromTitular={titularForRaid}
        onClose={() => setTitularForRaid(null)}
      />

      {/* Banner Principal de Bienvenida con Símbolo Oficial y Frase Separados */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-neon-cyan/50 bg-gradient-to-r from-[#060417]/95 via-[#0b0826]/95 to-[#150a2e]/95 p-5 sm:p-6 shadow-[0_0_50px_rgba(0,240,255,0.22)]">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <img
              src="/nova-symbol.png"
              alt="Símbolo Oficial NOVA"
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-[0_0_25px_rgba(0,240,255,0.5)] shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-2xl sm:text-3xl font-black tracking-widest text-white text-glow-cyan leading-none">
                  NOVA
                </span>
                <span className="text-xs sm:text-sm font-bold tracking-wider text-cyan-200/95 flex items-center gap-1.5 border-l border-white/20 pl-2.5">
                  <span>ver</span>
                  <span className="text-neon-cyan font-black">·</span>
                  <span>jugar</span>
                  <span className="text-amber-300 font-black">·</span>
                  <span>convivir</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-cyan-100/90 max-w-xl pt-1">
                Streaming en vivo donde la audiencia juega dentro de la transmisión, altera la partida con NOVAS y apoya con reparto transparente 77/20/3.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
            <Link
              href="/reels"
              className="btn-glass px-4 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 border border-neon-magenta/60 text-fuchsia-200 hover:text-white hover:bg-neon-magenta/20 transition cursor-pointer"
            >
              <Film className="h-4 w-4 text-neon-magenta" />
              <span>Ver Reels</span>
            </Link>
            <Link
              href="/la-sala"
              className="btn-neon-gradient px-5 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-neon-cyan cursor-pointer"
            >
              <Radio className="h-4 w-4" />
              <span>🔴 Entrar a La Sala En Vivo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* AVISO DESTACADO EN INICIO: Cuando un Titular usa "Pásale tu gente" */}
      {activeRecommendation && (
        <section className="glass-card-magenta animate-alert-lifecycle relative overflow-hidden rounded-3xl border-2 border-amber-300 p-4 sm:p-5 shadow-[0_0_45px_rgba(255,42,133,0.55)]">
          <button
            type="button"
            onClick={dismissRecommendation}
            className="absolute right-3.5 top-3.5 rounded-full bg-white/15 p-1.5 text-white hover:bg-white/25"
            aria-label="Cerrar aviso"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pr-6">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-300 bg-space-950 text-3xl shadow-neon-gold">
                {activeRecommendation.toCanteraAvatar}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950">
                    <Send className="h-3 w-3" />
                    ¡PÁSALE TU GENTE ACTIVO!
                  </span>
                  <span className="text-xs font-extrabold text-amber-200">
                    +{activeRecommendation.viewersPassed} espectadores enviados
                  </span>
                </div>
                <h2 className="mt-1 text-base sm:text-lg font-black text-white text-glow-magenta">
                  {activeRecommendation.fromTitularAvatar}{" "}
                  {activeRecommendation.fromTitularName} (@
                  {activeRecommendation.fromTitularUsername}) recomienda a{" "}
                  <span className="text-neon-cyan underline">
                    {activeRecommendation.toCanteraName} (@
                    {activeRecommendation.toCanteraUsername})
                  </span>{" "}
                  en LA CANTERA
                </h2>
                <p className="text-xs font-semibold text-pink-100/95 mt-0.5">
                  &ldquo;{activeRecommendation.message}&rdquo;
                </p>
              </div>
            </div>

            <Link
              href="/la-sala"
              className="btn-neon-cyan shrink-0 rounded-2xl px-4 py-2.5 text-xs font-black text-center"
            >
              Entrar a la Sala de @{activeRecommendation.toCanteraUsername} →
            </Link>
          </div>
        </section>
      )}

      {/* Barra de Control Rápido del Paso 4 (Probar Graduación de Astro Caos 99/100 y Crear Perfil) */}
      <section className="glass-card-cyan relative overflow-hidden rounded-3xl p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/70 bg-neon-cyan/15 px-3 py-1 text-xs font-extrabold text-neon-cyan shadow-neon-cyan">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                PASO 4 ACTIVO • DESCUBRIMIENTO JUSTO 50% / 50% PERMANENTE
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white text-glow-cyan">
              Inicio: LOS TITULARES y LA CANTERA Lado a Lado
            </h1>
            <p className="text-xs sm:text-sm font-medium text-cyan-100/90">
              Regla Anti-Trampa activa: <strong className="text-white">La Cantera</strong> es exclusiva para cuentas nuevas (&lt;{NOVA_ECONOMY_RULES.CANTERA_MAX_ACCOUNT_DAYS} días), con menos de{" "}
              <strong className="text-neon-cyan">100 seguidores</strong> y menos de{" "}
              <strong className="text-neon-emerald">\$100 USD</strong> ganados.
            </p>
          </div>

          {/* Botones de Acción Directa: Crear Perfil y Salir En Vivo */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="btn-neon-cyan inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2.5 text-xs font-black shadow-neon-cyan"
            >
              <UserPlus className="h-4 w-4" />
              <span>+ Crear Perfil</span>
            </button>
            <Link
              href="/la-sala"
              className="btn-neon-gradient inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2.5 text-xs font-black shadow-neon-cyan"
            >
              <Radio className="h-4 w-4" />
              <span>Transmitir en Vivo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          PANTALLA DE INICIO: DOS SECCIONES LADO A LADO, 50% Y 50% PERMANENTE
          Ninguna sección puede ocupar más que la otra ni esconderse (grid-cols-2 fijo)
          ===================================================================== */}
      <section aria-label="Descubrimiento Justo 50/50">
        <div className="grid grid-cols-2 gap-3 sm:gap-5 items-stretch">
          {/* =================================================================
              COLUMNA IZQUIERDA (50% PERMANENTE): LOS TITULARES
              ================================================================= */}
          <div className="glass-card-violet rounded-3xl p-3 sm:p-5 flex flex-col justify-between min-w-0">
            <div className="space-y-3.5">
              {/* Cabecera de LOS TITULARES */}
              <div className="border-b border-neon-violet/35 pb-3">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-violet bg-neon-violet/25 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-black text-fuchsia-100 shadow-neon-violet">
                    <Flame className="h-3.5 w-3.5 text-neon-violet shrink-0" />
                    <span>LOS TITULARES (50%)</span>
                  </span>
                  <span className="rounded-lg bg-neon-violet/20 px-2 py-0.5 text-[10px] sm:text-xs font-black text-fuchsia-200">
                    {titularesList.length} Creadores
                  </span>
                </div>
                <p className="mt-2 text-[11px] sm:text-xs text-fuchsia-100/90 leading-snug">
                  Creadores establecidos o graduados al alcanzar{" "}
                  <strong className="text-white">100 seguidores</strong> o{" "}
                  <strong className="text-white">\$100 USD</strong>.
                </p>
              </div>

              {/* Lista de Tarjetas de LOS TITULARES */}
              <div className="space-y-3">
                {titularesList.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-neon-violet/30 bg-[#0e0724]/60 p-6 text-center space-y-2">
                    <Award className="h-8 w-8 text-fuchsia-300 mx-auto" />
                    <p className="text-xs font-bold text-white">
                      Aún no hay Titulares graduados
                    </p>
                    <p className="text-[11px] text-fuchsia-200/80">
                      Los creadores de La Cantera que alcancen 100 seguidores o $100 USD se graduarán aquí automáticamente.
                    </p>
                  </div>
                ) : (
                  titularesList.map((creator) => (
                  <div
                    key={creator.id}
                    onClick={() => router.push("/la-sala")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        router.push("/la-sala");
                      }
                    }}
                    className={`rounded-2xl border p-3 sm:p-4 transition-all duration-300 space-y-2.5 cursor-pointer ${
                      creator.isLive
                        ? "border-2 border-rose-500/90 bg-gradient-to-br from-[#2b0c2e]/95 via-[#160b34]/95 to-[#0a1931]/95 shadow-[0_0_28px_rgba(244,63,94,0.35)]"
                        : creator.justGraduated
                        ? "border-2 border-amber-300 bg-gradient-to-br from-[#351042]/95 via-[#1c0c38]/95 to-[#2b1d07]/95 shadow-[0_0_35px_rgba(255,207,51,0.55)] animate-soft-pulse"
                        : "border-neon-violet/55 bg-[#120b2c]/90 shadow-neon-violet hover:border-neon-violet"
                    }`}
                  >
                    {/* Etiqueta superior de estado + Insignia EN VIVO con pulso suave */}
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase ${
                            creator.justGraduated
                              ? "bg-amber-300 text-slate-950"
                              : "bg-neon-magenta text-white"
                          }`}
                        >
                          {creator.justGraduated ? (
                            <>
                              <Award className="h-3 w-3" />
                              <span>¡RECIÉN GRADUADO A TITULAR!</span>
                            </>
                          ) : (
                            <span>ESTADO: TITULAR</span>
                          )}
                        </span>

                        {creator.isLive && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase text-white animate-soft-pulse">
                            ● EN VIVO
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-fuchsia-200/90 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {creator.accountAgeDays}d
                      </span>
                    </div>

                    {/* Foto/Avatar + Nombre + @usuario */}
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="flex h-11 w-11 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-2xl border border-neon-violet bg-space-950 text-2xl sm:text-3xl shadow-neon-violet">
                        {creator.avatarUrl}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs sm:text-base font-black text-white truncate">
                          {creator.displayName}
                        </h3>
                        <p className="text-[11px] sm:text-xs font-extrabold text-fuchsia-300 truncate">
                          @{creator.username}
                        </p>
                      </div>
                    </div>

                    {/* Métricas Reales: Seguidores y Total Ganado en USD */}
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2 rounded-xl border border-white/10 bg-black/35 p-2 text-[10px] sm:text-xs">
                      <div className="min-w-0">
                        <span className="text-fuchsia-200/80 block font-semibold truncate">
                          Seguidores
                        </span>
                        <span className="font-black text-white flex items-center gap-1">
                          <Users className="h-3 w-3 text-neon-violet shrink-0" />
                          {creator.followersCount.toLocaleString("en-US")}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-fuchsia-200/80 block font-semibold truncate">
                          Ganado (USD)
                        </span>
                        <span className="font-black text-neon-emerald flex items-center gap-0.5">
                          <DollarSign className="h-3 w-3 shrink-0" />
                          {creator.creatorEarningsUsd.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Botones de la tarjeta Titular: "Pásale tu gente" + Entrar */}
                    <div className="flex flex-col sm:flex-row gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTitularForRaid(creator);
                        }}
                        className="btn-neon-violet flex-1 rounded-xl px-2.5 py-2 text-[11px] sm:text-xs font-black flex items-center justify-center gap-1.5"
                      >
                        <Send className="h-3.5 w-3.5 shrink-0" />
                        <span>Pásale tu gente</span>
                      </button>
                      <Link
                        href={creator.isLive ? `/la-sala?host=${creator.username}` : "/la-sala"}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (creator.isLive) selectLiveSession(creator.id);
                        }}
                        className={`rounded-xl border px-2.5 py-2 text-center text-[11px] sm:text-xs font-black transition ${
                          creator.isLive
                            ? "border-rose-400 bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/40 animate-pulse"
                            : "border-neon-cyan/50 bg-neon-cyan/15 text-neon-cyan hover:bg-neon-cyan/25"
                        }`}
                      >
                        {creator.isLive ? "Entrar En Vivo" : "Ver Sala"}
                      </Link>
                    </div>
                  </div>
                )))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neon-violet/30 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-fuchsia-200">
              <span>Graduación automática a 100 seg. o \$100 USD</span>
              <Sparkles className="h-4 w-4 text-neon-violet shrink-0" />
            </div>
          </div>

          {/* =================================================================
              COLUMNA DERECHA (50% PERMANENTE): LA CANTERA
              ================================================================= */}
          <div className="glass-card-cyan rounded-3xl p-3 sm:p-5 flex flex-col justify-between min-w-0">
            <div className="space-y-3.5">
              {/* Cabecera de LA CANTERA */}
              <div className="border-b border-neon-cyan/35 pb-3">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-cyan bg-neon-cyan/20 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-black text-cyan-100 shadow-neon-cyan">
                    <Rocket className="h-3.5 w-3.5 text-neon-cyan shrink-0" />
                    <span>LA CANTERA (50%)</span>
                  </span>
                  <span className="rounded-lg bg-neon-cyan/20 px-2 py-0.5 text-[10px] sm:text-xs font-black text-neon-cyan">
                    {canteraList.length} Creadores
                  </span>
                </div>
                <p className="mt-2 text-[11px] sm:text-xs text-cyan-100/90 leading-snug">
                  Talentos nuevos (&lt;45 días, &lt;100 seguidores y &lt;\$100
                  USD) con el mismo espacio y respeto.
                </p>
              </div>

              {/* Lista de Tarjetas de LA CANTERA */}
              <div className="space-y-3">
                {canteraList.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-neon-cyan/30 bg-[#071b2e]/60 p-6 text-center space-y-2">
                    <Rocket className="h-8 w-8 text-cyan-300 mx-auto" />
                    <p className="text-xs font-bold text-white">
                      No hay creadores nuevos aún
                    </p>
                    <p className="text-[11px] text-cyan-200/80">
                      Crea un perfil para ser el primero en transmitir desde La Cantera.
                    </p>
                  </div>
                ) : (
                  canteraList.map((creator) => {
                  const isRecommended = Boolean(creator.recommendedByTitular);
                  const isCloseToGraduate =
                    creator.followersCount >= 95 ||
                    creator.creatorEarningsUsd >= 95;

                  return (
                    <div
                      key={creator.id}
                      onClick={() => router.push("/la-sala")}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          router.push("/la-sala");
                        }
                      }}
                      className={`rounded-2xl border p-3 sm:p-4 transition-all duration-300 space-y-2.5 cursor-pointer ${
                        creator.isLive
                          ? "border-2 border-rose-500/90 bg-gradient-to-br from-[#2b0c2e]/95 via-[#082238]/95 to-[#071b2e]/95 shadow-[0_0_28px_rgba(244,63,94,0.35)]"
                          : isRecommended
                          ? "border-2 border-amber-300 bg-gradient-to-br from-[#07293d]/95 via-[#18123c]/95 to-[#2c1908]/95 shadow-[0_0_30px_rgba(255,207,51,0.45)]"
                          : isCloseToGraduate
                          ? "border-2 border-neon-cyan bg-[#082238]/95 shadow-neon-cyan"
                          : "border-neon-cyan/55 bg-[#071b2e]/90 shadow-neon-cyan hover:border-neon-cyan"
                      }`}
                    >
                      {/* Insignia si fue recomendado por "Pásale tu gente" */}
                      {isRecommended && (
                        <div className="rounded-xl bg-amber-300/20 border border-amber-300 px-2.5 py-1 text-[10px] font-black text-amber-200 flex items-center gap-1">
                          <Send className="h-3 w-3 text-amber-300 shrink-0" />
                          <span className="truncate">
                            DESTACADO POR {creator.recommendedByTitular}
                          </span>
                        </div>
                      )}

                      {/* Etiqueta superior de estado + Insignia EN VIVO con pulso suave */}
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded-md bg-neon-cyan px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase text-slate-950">
                            ESTADO: CANTERA • DÍA {creator.accountAgeDays}
                          </span>
                          {creator.isLive && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase text-white animate-soft-pulse">
                              ● EN VIVO
                            </span>
                          )}
                        </div>
                        {isCloseToGraduate && (
                          <span className="rounded-md bg-amber-400/25 border border-amber-300 px-1.5 py-0.5 text-[9px] font-black text-amber-200">
                            ¡A 1 PASO DE GRADUARSE!
                          </span>
                        )}
                      </div>

                      {/* Foto/Avatar + Nombre + @usuario */}
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="flex h-11 w-11 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-2xl border border-neon-cyan bg-space-950 text-2xl sm:text-3xl shadow-neon-cyan">
                          {creator.avatarUrl}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs sm:text-base font-black text-white truncate">
                            {creator.displayName}
                          </h3>
                          <p className="text-[11px] sm:text-xs font-extrabold text-neon-cyan truncate">
                            @{creator.username}
                          </p>
                        </div>
                      </div>

                      {/* Métricas Reales: Seguidores (/100) y Total Ganado en USD (/$100) */}
                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 rounded-xl border border-white/10 bg-black/35 p-2 text-[10px] sm:text-xs">
                        <div className="min-w-0">
                          <span className="text-cyan-200/80 block font-semibold truncate">
                            Seguidores
                          </span>
                          <span className="font-black text-white flex items-center gap-1">
                            <Users className="h-3 w-3 text-neon-cyan shrink-0" />
                            {creator.followersCount} / 100
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-cyan-200/80 block font-semibold truncate">
                            Ganado (USD)
                          </span>
                          <span className="font-black text-neon-emerald flex items-center gap-0.5">
                            <DollarSign className="h-3 w-3 shrink-0" />
                            {creator.creatorEarningsUsd.toFixed(2)} / \$100
                          </span>
                        </div>
                      </div>

                      {/* Botones: Simular +1 Seguidor (para probar graduación en vivo) + Entrar a Sala */}
                      <div className="flex flex-col sm:flex-row gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            simulateGainFollowerForCreator(creator.id);
                          }}
                          className={`flex-1 rounded-xl px-2.5 py-2 text-[11px] sm:text-xs font-black flex items-center justify-center gap-1 transition ${
                            isCloseToGraduate
                              ? "btn-neon-gradient"
                              : "btn-neon-cyan"
                          }`}
                        >
                          <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            +1 Seguidor{" "}
                            {isCloseToGraduate ? "(¡Graduar!)" : ""}
                          </span>
                        </button>
                        <Link
                          href={creator.isLive ? `/la-sala?host=${creator.username}` : "/la-sala"}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (creator.isLive) selectLiveSession(creator.id);
                          }}
                          className={`rounded-xl border px-2.5 py-2 text-center text-[11px] sm:text-xs font-black transition ${
                            creator.isLive
                              ? "border-rose-400 bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/40 animate-pulse"
                              : "border-neon-emerald/60 bg-neon-emerald/15 text-neon-emerald hover:bg-neon-emerald/25"
                          }`}
                        >
                          {creator.isLive ? "Entrar En Vivo" : "Unirse"}
                        </Link>
                      </div>
                    </div>
                  );
                }))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neon-cyan/30 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-cyan-200">
              <span>
                Regla Anti-Trampa: &lt;45d + &lt;100 seg. + &lt;\$100 USD
              </span>
              <Shield className="h-4 w-4 text-neon-cyan shrink-0" />
            </div>
          </div>
        </div>
      </section>

      {/* Panel Regalar con los 27 Regalos Oficiales (Galaxia unificada en 250 Novas) */}
      <GiftCatalogPanel
        recipientName={`@${currentUser.username} (Sala en Vivo)`}
        title="Panel Regalar — Los 27 Regalos Oficiales NOVA (Galaxia = 250 Novas)"
      />
    </div>
  );
}
