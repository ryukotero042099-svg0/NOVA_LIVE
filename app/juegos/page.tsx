import React from "react";
import { Gamepad2, Car, Ghost, Trophy } from "lucide-react";

export default function JuegosBasePage() {
  return (
    <div className="space-y-4">
      <div className="glass-card-magenta rounded-3xl p-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-neon-magenta bg-neon-magenta/20 px-3 py-1 text-xs font-black text-pink-200 shadow-neon-magenta">
          <Gamepad2 className="h-4 w-4 text-neon-magenta" />
          <span>MÓDULOS DE JUEGO IN-APP • ESQUELETO (PASO 1)</span>
        </div>
        <h1 className="mt-3 text-2xl font-black text-white text-glow-magenta">
          Los 3 Juegos del Lanzamiento (Cero Espejo de Pantalla)
        </h1>
        <p className="mt-1 text-sm text-pink-100/90">
          Cada juego corre como un módulo web HTML5/Canvas dentro de la misma aplicación.
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card-cyan rounded-2xl p-4 space-y-2">
            <Car className="h-7 w-7 text-neon-cyan" />
            <h2 className="text-base font-black text-white">1. La Sala: Carreras</h2>
            <p className="text-xs text-cyan-100/85">
              Equipos grandes, chat de voz y pista neón donde la audiencia lanza lluvia y meteoritos con NOVAS.
            </p>
          </div>
          <div className="glass-card-violet rounded-2xl p-4 space-y-2">
            <Ghost className="h-7 w-7 text-neon-violet" />
            <h2 className="text-base font-black text-white">2. Historia / Terror</h2>
            <p className="text-xs text-fuchsia-100/85">
              El streamer juega una historia de terror y los espectadores disparan sustos y decisiones con NOVAS.
            </p>
          </div>
          <div className="glass-card rounded-2xl p-4 space-y-2">
            <Trophy className="h-7 w-7 text-neon-magenta" />
            <h2 className="text-base font-black text-white">3. Fútbol: Penales</h2>
            <p className="text-xs text-pink-100/85">
              Penales por turnos con el streamer como anfitrión y retadores que entran desde el chat con un toque.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
