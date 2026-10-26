"use client";

import React, { useEffect } from "react";
import { Sparkles, Award, X, Heart } from "lucide-react";
import { useApp } from "@/context/AppContext";

function playSubtleChime(tier: "explosion_nova" | "supernova") {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    const now = ctx.currentTime;
    osc1.type = "sine";
    osc2.type = "sine";

    if (tier === "explosion_nova") {
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc2.frequency.setValueAtTime(659.25, now); // E5
    } else {
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc2.frequency.setValueAtTime(880.0, now); // A5
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.6);
    osc2.stop(now + 0.6);
  } catch {
    // Silencioso si el navegador bloquea audio antes de la primera interacción
  }
}

export function DonationOverlay() {
  const {
    activeDonationAlert,
    dismissDonationAlert,
    graduationCelebrationUser,
    dismissGraduationCelebration,
  } = useApp();

  // Control exacto de duración por nivel en cola ordenada:
  // 5–10 Novas: 2.6s | 25–50 Novas: 3.2s | 100–250 Novas: 4.8s
  useEffect(() => {
    if (!activeDonationAlert) return;

    if (
      activeDonationAlert.tier === "explosion_nova" ||
      activeDonationAlert.tier === "supernova"
    ) {
      playSubtleChime(activeDonationAlert.tier);
    }

    const duration =
      activeDonationAlert.tier === "supernova"
        ? 4800
        : activeDonationAlert.tier === "explosion_nova"
        ? 3200
        : 2600;

    const timer = setTimeout(() => {
      dismissDonationAlert();
    }, duration);

    return () => clearTimeout(timer);
  }, [activeDonationAlert, dismissDonationAlert]);

  return (
    <>
      {/* Motor Global de Animaciones de Regalos NOVA en Cola Ordenada */}
      {activeDonationAlert && (
        <React.Fragment key={activeDonationAlert.id}>
          {/* =================================================================
              NIVEL 1: ESTRELLA (5 a 24 Novas)
              Barra horizontal de lado a lado con icono, nombre del donante y regalo (2-3s)
              ================================================================= */}
          {activeDonationAlert.tier === "estrella_fugaz" && (
            <div className="fixed inset-x-0 top-16 z-50 flex justify-center px-2 sm:px-6 pointer-events-none">
              <div className="animate-alert-lifecycle pointer-events-auto relative overflow-hidden flex items-center justify-between gap-4 rounded-2xl sm:rounded-3xl border-2 border-neon-cyan bg-gradient-to-r from-[#06243a]/98 via-[#0b1738]/98 to-[#180e38]/98 px-5 py-3 shadow-[0_0_35px_rgba(0,240,255,0.45)] max-w-4xl w-full">
                {/* Partículas flotantes sutiles */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-85">
                  <span className="absolute left-4 top-2 text-base animate-bounce">
                    {activeDonationAlert.particleSymbols[0]}
                  </span>
                  <span className="absolute right-16 top-2 text-sm animate-pulse">
                    {activeDonationAlert.particleSymbols[1]}
                  </span>
                  <span className="absolute right-8 bottom-2 text-base animate-bounce">
                    {activeDonationAlert.particleSymbols[2]}
                  </span>
                </div>

                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* Ícono animado */}
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
                    <img
                      src={activeDonationAlert.giftIconUrl}
                      alt={activeDonationAlert.giftName}
                      className={`h-14 w-14 object-contain ${activeDonationAlert.signatureAnimation}`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-block rounded-full border border-neon-cyan bg-neon-cyan/25 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-neon-cyan">
                        ★ NIVEL ESTRELLA • {activeDonationAlert.amountNovas} NOVAS
                      </span>
                      <span className="text-[10px] font-extrabold text-neon-emerald">
                        ⚡ {activeDonationAlert.eventTitle}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm sm:text-base font-black text-white text-glow-cyan truncate">
                      @{activeDonationAlert.donorName}{" "}
                      <span className="font-bold text-cyan-200">
                        envió {activeDonationAlert.giftName}
                      </span>
                    </p>
                    <p className="text-[11px] font-medium text-cyan-100/80 truncate">
                      {activeDonationAlert.animationDescription}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={dismissDonationAlert}
                  className="rounded-full p-1.5 text-cyan-200 hover:bg-white/10 shrink-0 cursor-pointer"
                  aria-label="Cerrar alerta"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* =================================================================
              NIVEL 2: EXPLOSIÓN NOVA (25 a 99 Novas)
              Ventana al centro con partículas animadas del regalo, marco brillante y sonido sutil (~3s)
              ================================================================= */}
          {activeDonationAlert.tier === "explosion_nova" && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="animate-alert-lifecycle pointer-events-auto relative overflow-hidden flex flex-col sm:flex-row items-center gap-5 rounded-3xl border-2 border-neon-violet bg-gradient-to-r from-[#280b48]/98 via-[#180d3d]/98 to-[#09293d]/98 p-6 sm:p-7 shadow-[0_0_65px_rgba(182,36,255,0.7)] max-w-xl w-full">
                {/* Partículas animadas según el regalo */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <span className="absolute left-6 top-3 text-2xl animate-bounce">
                    {activeDonationAlert.particleSymbols[0]}
                  </span>
                  <span className="absolute left-20 bottom-3 text-lg animate-ping">
                    {activeDonationAlert.particleSymbols[1]}
                  </span>
                  <span className="absolute right-12 top-4 text-2xl animate-bounce">
                    {activeDonationAlert.particleSymbols[2]}
                  </span>
                  <span className="absolute right-6 bottom-4 text-xl animate-pulse">
                    {activeDonationAlert.particleSymbols[0]}
                  </span>
                </div>

                {/* Ícono animado con aura violeta */}
                <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 shrink-0 items-center justify-center">
                  <div className="absolute inset-1 rounded-full bg-neon-violet/35 blur-xl animate-pulse" />
                  <img
                    src={activeDonationAlert.giftIconUrl}
                    alt={activeDonationAlert.giftName}
                    className={`relative h-24 w-24 sm:h-28 sm:w-28 object-contain ${activeDonationAlert.signatureAnimation}`}
                  />
                </div>

                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <span className="inline-block rounded-full border border-neon-violet bg-neon-violet/35 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-fuchsia-100">
                    💥 EXPLOSIÓN NOVA • {activeDonationAlert.amountNovas} NOVAS
                  </span>
                  <h4 className="mt-1 text-lg sm:text-xl font-black text-white text-glow-violet">
                    ¡@{activeDonationAlert.donorName} lanzó{" "}
                    {activeDonationAlert.giftName}!
                  </h4>
                  <p className="mt-0.5 text-xs font-bold text-fuchsia-200">
                    {activeDonationAlert.animationDescription}
                  </p>
                  <p className="mt-1.5 text-xs font-black text-neon-cyan">
                    ⚡ Efecto en vivo: {activeDonationAlert.eventTitle}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={dismissDonationAlert}
                  className="absolute right-3 top-3 rounded-full p-1.5 text-fuchsia-200 hover:bg-white/10 shrink-0 cursor-pointer"
                  aria-label="Cerrar alerta"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* =================================================================
              NIVEL 3: SUPERNOVA (100 a 250+ Novas)
              Toma pantalla completa con lluvia de partículas doradas, efecto cósmico,
              mensaje gigante de agradecimiento y nombre del donante brillando (4-5s)
              ================================================================= */}
          {activeDonationAlert.tier === "supernova" && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md pointer-events-auto">
              <div className="animate-alert-lifecycle relative w-full max-w-2xl overflow-hidden rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-[#3d0a35]/95 via-[#1f0a42]/95 to-[#062a3e]/95 p-6 sm:p-9 text-center shadow-[0_0_90px_rgba(255,42,133,0.85)]">
                <button
                  type="button"
                  onClick={dismissDonationAlert}
                  className="absolute right-4 top-4 z-10 rounded-full bg-white/15 p-2 text-white hover:bg-white/25 cursor-pointer"
                  aria-label="Cerrar alerta"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Lluvia de partículas doradas y cósmicas del regalo */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <span className="absolute left-8 top-8 text-2xl animate-bounce">
                    {activeDonationAlert.particleSymbols[0]}
                  </span>
                  <span className="absolute right-14 top-10 text-2xl animate-bounce">
                    {activeDonationAlert.particleSymbols[1]}
                  </span>
                  <span className="absolute left-16 bottom-10 text-2xl animate-pulse">
                    {activeDonationAlert.particleSymbols[2]}
                  </span>
                  <span className="absolute right-12 bottom-10 text-2xl animate-bounce">
                    ✨
                  </span>
                  <span className="absolute left-1/4 top-12 text-xl animate-pulse">
                    ⭐
                  </span>
                  <span className="absolute right-1/4 bottom-12 text-xl animate-bounce">
                    🌟
                  </span>
                </div>

                {/* Ícono gigante en el centro con aura cósmica */}
                <div className="relative mx-auto flex h-36 w-36 sm:h-40 sm:w-40 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-magenta via-amber-400 to-neon-cyan opacity-40 blur-2xl animate-pulse" />
                  <img
                    src={activeDonationAlert.giftIconUrl}
                    alt={activeDonationAlert.giftName}
                    className={`relative h-36 w-36 sm:h-40 sm:w-40 object-contain ${activeDonationAlert.signatureAnimation}`}
                  />
                </div>

                <span className="mt-3 inline-block rounded-full border border-amber-300 bg-gradient-to-r from-neon-magenta via-neon-violet to-amber-500 px-4 py-1 text-xs font-black uppercase tracking-widest text-white shadow-neon-magenta">
                  🌌 SUPERNOVA EN PANTALLA • {activeDonationAlert.amountNovas} NOVAS
                </span>

                <h3 className="mt-2 text-2xl sm:text-3xl font-black text-amber-300 flex items-center justify-center gap-2">
                  <Heart className="h-6 w-6 text-rose-500 fill-rose-500 inline" />
                  <span>¡GRACIAS POR EL APOYO GIGANTE!</span>
                </h3>

                <h4 className="mt-1 text-xl sm:text-3xl font-black tracking-wide text-white text-glow-magenta">
                  ¡@{activeDonationAlert.donorName.toUpperCase()} DESATÓ{" "}
                  {activeDonationAlert.giftName.toUpperCase()}!
                </h4>

                <p className="mt-1 text-xs sm:text-sm font-bold text-amber-200">
                  {activeDonationAlert.animationDescription}
                </p>

                <p className="mt-2 inline-block rounded-xl bg-black/40 border border-amber-300/40 px-3.5 py-1 text-xs font-extrabold text-neon-cyan">
                  ⚡ {activeDonationAlert.eventTitle}
                </p>
              </div>
            </div>
          )}
        </React.Fragment>
      )}

      {/* Ceremonia de Graduación de La Cantera a Los Titulares */}
      {graduationCelebrationUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="glass-card-magenta animate-alert-lifecycle relative max-w-lg w-full rounded-3xl p-6 sm:p-7 text-center space-y-4 border-2 border-amber-300 shadow-[0_0_95px_rgba(255,207,51,0.85)]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <span className="absolute left-6 top-6 text-2xl animate-bounce">
                🎓
              </span>
              <span className="absolute right-8 top-6 text-2xl animate-bounce">
                👑
              </span>
              <span className="absolute left-10 bottom-10 text-2xl animate-pulse">
                ✨
              </span>
              <span className="absolute right-10 bottom-10 text-2xl animate-bounce">
                🚀
              </span>
            </div>

            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-neon-cyan via-neon-violet to-amber-400 text-5xl shadow-neon-gold">
              {graduationCelebrationUser.avatarUrl || (
                <Award className="h-12 w-12 text-slate-950" />
              )}
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/25 border border-amber-300 px-4 py-1 text-xs font-black uppercase tracking-widest text-amber-200">
              <Sparkles className="h-4 w-4" />
              ¡GRADUACIÓN OFICIAL A LOS TITULARES!
            </span>

            <h3 className="text-2xl sm:text-3xl font-black text-white text-glow-magenta">
              ¡{graduationCelebrationUser.displayName} (@
              {graduationCelebrationUser.username}) SE GRADUÓ!
            </h3>

            <p className="text-sm text-pink-100/95 leading-relaxed">
              Alcanzó la meta de{" "}
              <strong className="text-amber-300">
                {graduationCelebrationUser.followersCount}/100 seguidores
              </strong>{" "}
              (y{" "}
              <strong className="text-neon-emerald">
                ${graduationCelebrationUser.creatorEarningsUsd.toFixed(2)} USD
              </strong>{" "}
              ganados). Su tarjeta ya se movió en vivo de{" "}
              <strong className="text-neon-cyan">LA CANTERA</strong> a la
              columna de <strong className="text-white">LOS TITULARES</strong>.
            </p>

            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-amber-300/40 bg-black/50 p-3.5 text-xs">
              <div>
                <span className="text-cyan-200 block font-bold">
                  Seguidores Alcanzados
                </span>
                <span className="text-xl font-black text-white">
                  {graduationCelebrationUser.followersCount} / 100
                </span>
              </div>
              <div>
                <span className="text-cyan-200 block font-bold">
                  Total Ganado (77%)
                </span>
                <span className="text-xl font-black text-neon-emerald">
                  ${graduationCelebrationUser.creatorEarningsUsd.toFixed(2)} USD
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={dismissGraduationCelebration}
              className="btn-neon-gradient w-full rounded-2xl py-3.5 text-sm font-black cursor-pointer"
            >
              ¡Ver su Tarjeta en LOS TITULARES!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
