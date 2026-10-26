"use client";

import React from "react";
import Link from "next/link";
import {
  Gamepad2,
  Flag,
  Ghost,
  Shield,
  HelpCircle,
  Play,
  Volume2,
  Users,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function JuegosBasePage() {
  const {
    openLiveRaceLobby,
    openImpostorLobby,
    openDefenseLobby,
    openTriviaLobby,
  } = useApp();

  return (
    <div className="space-y-6">
      {/* Cabecera del Panel de Juegos */}
      <div className="glass-card-magenta rounded-3xl p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-neon-magenta bg-neon-magenta/20 px-3.5 py-1 text-xs font-black text-pink-200 shadow-neon-magenta">
          <Gamepad2 className="h-4 w-4 text-neon-magenta" />
          <span>MINIJUEGOS MULTIJUGADOR INTEGRADOS • EN VIVO</span>
        </div>
        <h1 className="mt-3 text-2xl sm:text-3xl font-black text-white text-glow-magenta">
          Centro de Juegos en Vivo (Cero Espejo de Pantalla)
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-pink-100/90 max-w-2xl leading-relaxed">
          Cada juego corre sincronizado en tiempo real dentro de La Sala. Los anfitriones y espectadores
          juegan juntos desde el teléfono o PC mientras el video y el chat de voz continúan activos.
        </p>

        {/* Cuadrícula de Juegos Activos */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Carreras de Naves */}
          <div className="glass-card-cyan rounded-3xl p-5 flex flex-col justify-between space-y-4 border border-neon-cyan/50 shadow-neon-cyan">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 border border-neon-cyan text-neon-cyan">
                  <Flag className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-neon-cyan/20 border border-neon-cyan px-2.5 py-0.5 text-[10px] font-black uppercase text-neon-cyan">
                  ⚡ Velocidad
                </span>
              </div>
              <h2 className="text-lg font-black text-white text-glow-cyan">
                Carreras de Naves
              </h2>
              <p className="text-xs text-cyan-100/85 leading-relaxed">
                Pista neón con cuenta regresiva 3-2-1. Toca rápido para acelerar tu nave y cruzar la meta. Podio oficial 1°, 2° y 3°.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/la-sala"
                onClick={() => openLiveRaceLobby()}
                className="btn-neon-gradient w-full rounded-2xl py-3 px-4 text-xs font-black flex items-center justify-center gap-2 shadow-neon-cyan cursor-pointer transition hover:scale-[1.02]"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Jugar Carreras en La Sala</span>
              </Link>
            </div>
          </div>

          {/* 2. El Impostor */}
          <div className="glass-card-violet rounded-3xl p-5 flex flex-col justify-between space-y-4 border border-neon-violet/50 shadow-neon-violet">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-500/20 border border-neon-violet text-neon-violet">
                  <Ghost className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-neon-violet/20 border border-neon-violet px-2.5 py-0.5 text-[10px] font-black uppercase text-fuchsia-200">
                  🎙️ Voz y Deducción
                </span>
              </div>
              <h2 className="text-lg font-black text-white text-glow-violet">
                El Impostor Galáctico
              </h2>
              <p className="text-xs text-fuchsia-100/85 leading-relaxed">
                Juego por turnos de voz. Todos conocen la palabra secreta menos el impostor. Votación secreta y deducción en vivo.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/la-sala"
                onClick={() => openImpostorLobby()}
                className="btn-neon-violet w-full rounded-2xl py-3 px-4 text-xs font-black flex items-center justify-center gap-2 shadow-neon-violet cursor-pointer transition hover:scale-[1.02]"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Jugar El Impostor</span>
              </Link>
            </div>
          </div>

          {/* 3. Defiende la Nave */}
          <div className="glass-card-cyan rounded-3xl p-5 flex flex-col justify-between space-y-4 border border-neon-cyan/50 shadow-neon-cyan">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 border border-neon-emerald text-neon-emerald">
                  <Shield className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-neon-emerald/20 border border-neon-emerald px-2.5 py-0.5 text-[10px] font-black uppercase text-neon-emerald">
                  🛡️ Cooperativo
                </span>
              </div>
              <h2 className="text-lg font-black text-white text-glow-cyan">
                Defiende la Nave
              </h2>
              <p className="text-xs text-cyan-100/85 leading-relaxed">
                Oleadas de asteroides amenazan la nave espacial. Los jugadores coordinan disparos para mantener el escudo al 100%.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/la-sala"
                onClick={() => openDefenseLobby()}
                className="btn-neon-cyan w-full rounded-2xl py-3 px-4 text-xs font-black flex items-center justify-center gap-2 shadow-neon-cyan cursor-pointer transition hover:scale-[1.02]"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Jugar Defiende la Nave</span>
              </Link>
            </div>
          </div>

          {/* 4. Trivia Galáctica */}
          <div className="glass-card rounded-3xl p-5 flex flex-col justify-between space-y-4 border border-amber-400/50 shadow-lg">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-amber-400/20 border border-amber-400 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-200">
                  🧠 Conocimiento
                </span>
              </div>
              <h2 className="text-lg font-black text-white text-glow-amber">
                Trivia Galáctica
              </h2>
              <p className="text-xs text-amber-100/85 leading-relaxed">
                Preguntas de ciencia, espacio y videojuegos contrarreloj. Los puntos se suman en tiempo real en la tabla de clasificación.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/la-sala"
                onClick={() => openTriviaLobby()}
                className="rounded-2xl border border-amber-400 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black w-full py-3 px-4 text-xs flex items-center justify-center gap-2 shadow-amber-400/40 cursor-pointer transition hover:scale-[1.02]"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Jugar Trivia Galáctica</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
