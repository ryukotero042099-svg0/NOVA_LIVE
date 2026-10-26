"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  Smartphone,
  Maximize2,
  UserPlus,
  Radio,
  Moon,
  Sun,
} from "lucide-react";
import { BottomNav } from "./BottomNav";
import { useApp } from "@/context/AppContext";
import { DonationOverlay } from "@/components/live/DonationOverlay";
import { ProfileCreatorModal } from "@/components/auth/ProfileCreatorModal";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { currentUser, setIsProfileModalOpen } = useApp();
  const [verticalMobileFrame, setVerticalMobileFrame] =
    useState<boolean>(false);
  const [calmMode, setCalmMode] = useState<boolean>(false);
  const [glowIntensity, setGlowIntensity] = useState<number>(100);

  useEffect(() => {
    try {
      const savedCalm = localStorage.getItem("nova_calm_mode");
      const savedGlow = localStorage.getItem("nova_glow_intensity");
      if (savedCalm === "true") setCalmMode(true);
      if (savedGlow) setGlowIntensity(Number(savedGlow) || 100);
    } catch {
      // Ignorar
    }
  }, []);

  const toggleCalmMode = () => {
    setCalmMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("nova_calm_mode", String(next));
      } catch {
        // Ignorar
      }
      return next;
    });
  };

  const cycleGlowIntensity = () => {
    setGlowIntensity((prev) => {
      const next = prev === 100 ? 75 : prev === 75 ? 55 : 100;
      try {
        localStorage.setItem("nova_glow_intensity", String(next));
      } catch {
        // Ignorar
      }
      return next;
    });
  };

  return (
    <div
      className={`cosmic-backdrop cosmic-grid min-h-screen text-white flex flex-col ${
        calmMode ? "calm-mode" : ""
      }`}
      style={{
        filter:
          glowIntensity < 100 ? `brightness(${glowIntensity / 100})` : undefined,
      }}
    >
      {/* Overlay Global de Animaciones de Donación y Graduación */}
      <DonationOverlay />
      {/* Modal de Creación / Cambio de Perfil */}
      <ProfileCreatorModal />

      {/* Cabecera Superior Luminosa */}
      <header className="sticky top-0 z-40 border-b border-neon-cyan/35 bg-[#060518]/90 backdrop-blur-xl shadow-[0_4px_28px_rgba(0,245,255,0.16)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-2.5 sm:px-5">
          {/* Marca NOVA Oficial: Símbolo a la izquierda + Frase en texto real a la derecha */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group select-none">
            <img
              src="/nova-symbol.png"
              alt="Símbolo Oficial NOVA"
              className="h-10 w-10 sm:h-11 sm:w-11 object-contain drop-shadow-[0_0_14px_rgba(0,240,255,0.55)] transition-transform duration-200 group-hover:scale-105 shrink-0"
            />
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xl sm:text-2xl font-black tracking-widest text-white text-glow-cyan">
                  NOVA
                </span>
                <span className="hidden sm:inline-flex rounded-md border border-neon-violet/70 bg-neon-violet/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-fuchsia-200 shadow-neon-violet">
                  EN VIVO
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-cyan-100/90 flex items-center gap-1 mt-0.5">
                <span>ver</span>
                <span className="text-neon-cyan font-black">·</span>
                <span>jugar</span>
                <span className="text-amber-300 font-black">·</span>
                <span>convivir</span>
              </span>
            </div>
          </Link>

          {/* Controles derechos: Perfil Activo + Modo Calma / Intensidad + Saldo NOVA + Modo Vertical */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Botón de Perfil Activo / Crear Perfil */}
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className={`flex items-center gap-2 rounded-2xl border px-2.5 py-1.5 text-xs font-extrabold transition ${
                currentUser.tier === "titular"
                  ? "border-neon-violet/80 bg-neon-violet/20 text-fuchsia-100 shadow-neon-violet"
                  : "border-neon-cyan/70 bg-neon-cyan/15 text-cyan-100 shadow-neon-cyan"
              }`}
              title="Crear nuevo perfil o cambiar de cuenta"
            >
              <span className="text-base leading-none">
                {currentUser.avatarUrl}
              </span>
              <div className="text-left leading-tight hidden sm:block">
                <span className="block text-[11px] font-black text-white">
                  @{currentUser.username}
                </span>
                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-neon-cyan">
                  <Radio className="h-2.5 w-2.5" />
                  {currentUser.tier === "titular" ? "TITULAR" : "LA CANTERA"}
                </span>
              </div>
              <UserPlus className="h-3.5 w-3.5 text-neon-cyan ml-0.5" />
            </button>

            {/* Saldo de Moneda Interna NOVA en Tiempo Real */}
            <div className="flex items-center rounded-2xl border border-neon-violet/70 bg-gradient-to-r from-[#120d36] via-[#1f1147] to-[#120d36] p-1 pl-2.5 shadow-neon-violet">
              <div className="flex items-center gap-1.5 pr-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-neon-cyan to-neon-violet text-[11px] font-black text-slate-950 shadow-neon-cyan">
                  N
                </span>
                <div className="leading-none">
                  <span className="block text-sm font-black tracking-tight text-white text-glow-cyan">
                    {currentUser.novaBalance}
                  </span>
                  <span className="block text-[9px] font-extrabold uppercase tracking-wider text-neon-cyan">
                    NOVAS
                  </span>
                </div>
              </div>
              <Link
                href="/monedero"
                className="btn-neon-cyan flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-black"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
                <span className="hidden xs:inline">Recargar</span>
              </Link>
            </div>

            {/* Botones de Modo Calma y Ajuste de Intensidad */}
            <button
              type="button"
              onClick={toggleCalmMode}
              className={`hidden sm:flex items-center gap-1 rounded-xl border px-2.5 py-2 text-[11px] font-bold transition ${
                calmMode
                  ? "border-amber-300 bg-amber-300/20 text-amber-200"
                  : "border-white/15 bg-space-800/90 text-cyan-100 hover:border-neon-cyan"
              }`}
              title="Activar/Desactivar Modo Calma (sin parpadeos ni animaciones intensas)"
            >
              <Moon className="h-3.5 w-3.5 text-neon-cyan" />
              <span>{calmMode ? "Calma: ON" : "Modo Calma"}</span>
            </button>

            <button
              type="button"
              onClick={cycleGlowIntensity}
              className="hidden lg:flex items-center gap-1 rounded-xl border border-white/15 bg-space-800/90 px-2.5 py-2 text-[11px] font-bold text-cyan-100 hover:border-neon-cyan transition"
              title="Ajustar intensidad luminosa neón (100% / 75% / 55%)"
            >
              <Sun className="h-3.5 w-3.5 text-neon-cyan" />
              <span>Luz {glowIntensity}%</span>
            </button>

            {/* Conmutador de Vista Vertical Móvil (Vertical-First) vs. Expandida */}
            <button
              type="button"
              onClick={() => setVerticalMobileFrame((prev) => !prev)}
              className="hidden md:flex items-center gap-1.5 rounded-xl border border-neon-cyan/45 bg-space-800/90 px-2.5 py-2 text-xs font-bold text-cyan-100 hover:border-neon-cyan hover:shadow-neon-cyan transition"
              title="Alternar vista vertical móvil (430px) o pantalla expandida"
            >
              {verticalMobileFrame ? (
                <>
                  <Maximize2 className="h-3.5 w-3.5 text-neon-cyan" />
                  <span>Expandir</span>
                </>
              ) : (
                <>
                  <Smartphone className="h-3.5 w-3.5 text-neon-cyan" />
                  <span>Vertical</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="flex-1 pb-24 pt-4 px-3 sm:px-5">
        <div
          className={`mx-auto transition-all duration-300 ${
            verticalMobileFrame
              ? "max-w-[430px] rounded-[32px] border-2 border-neon-cyan/60 bg-[#07051b]/90 p-3 shadow-neon-cyan-lg"
              : "max-w-5xl"
          }`}
        >
          {children}
        </div>
      </main>

      {/* Barra de Navegación Inferior */}
      <BottomNav />
    </div>
  );
}
