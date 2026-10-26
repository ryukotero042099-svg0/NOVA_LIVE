"use client";

import React, { useState } from "react";
import { UserPlus, Sparkles, ShieldCheck, X, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";

const AVATAR_OPTIONS = ["🚀", "🌟", "⚡", "👑", "🦊", "🐉", "🎮", "🛸"];

export function ProfileCreatorModal() {
  const {
    currentUser,
    profiles,
    isProfileModalOpen,
    setIsProfileModalOpen,
    createCustomProfile,
    switchProfile,
  } = useApp();

  const [username, setUsername] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("🚀");
  const [bio, setBio] = useState<string>(
    "Jugando en vivo dentro de NOVA. ¡Entra a mi partida con 1 toque!"
  );
  const [createdBanner, setCreatedBanner] = useState<boolean>(false);

  if (!isProfileModalOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    createCustomProfile({
      username,
      displayName: displayName || username,
      email,
      avatarUrl,
      bio,
    });
    setUsername("");
    setDisplayName("");
    setEmail("");
    setCreatedBanner(true);
    setTimeout(() => {
      setCreatedBanner(false);
      setIsProfileModalOpen(false);
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-card-cyan relative w-full max-w-lg rounded-3xl p-5 sm:p-6 space-y-5 my-8">
        <button
          type="button"
          onClick={() => setIsProfileModalOpen(false)}
          className="absolute right-4 top-4 rounded-xl border border-neon-cyan/40 bg-space-900/80 p-1.5 text-cyan-200 hover:text-white"
          aria-label="Cerrar ventana de perfil"
        >
          <X className="h-4 w-4" />
        </button>

        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-cyan bg-neon-cyan/20 px-3 py-0.5 text-xs font-black text-neon-cyan">
            <UserPlus className="h-3.5 w-3.5" />
            CUENTAS Y CREACIÓN DE PERFIL (PASO 2)
          </span>
          <h2 className="mt-2 text-xl sm:text-2xl font-black text-white text-glow-cyan">
            Crear Tu Perfil en NOVA o Cambiar de Cuenta
          </h2>
          <p className="text-xs text-cyan-100/90 mt-1">
            Toda cuenta nueva entra automáticamente a{" "}
            <strong className="text-neon-cyan">LA CANTERA</strong> (verificada
            por antigüedad y audiencia) y recibe{" "}
            <strong className="text-white">500 NOVAS de prueba</strong>.
          </p>
        </div>

        {/* Selector Rápido de Perfiles Activos */}
        <div className="space-y-2">
          <p className="text-xs font-extrabold uppercase tracking-wider text-cyan-200">
            Cuentas disponibles en este dispositivo (1 clic para cambiar):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {profiles.map((prof) => {
              const active = prof.id === currentUser.id;
              return (
                <button
                  key={prof.id}
                  type="button"
                  onClick={() => switchProfile(prof.id)}
                  className={`flex items-center gap-2 rounded-2xl border p-2.5 text-left transition ${
                    active
                      ? "border-neon-cyan bg-neon-cyan/20 shadow-neon-cyan"
                      : "border-white/15 bg-space-900/70 hover:border-neon-cyan/50"
                  }`}
                >
                  <span className="text-xl">{prof.avatarUrl}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-white truncate">
                      @{prof.username}
                    </p>
                    <span
                      className={`inline-block rounded px-1.5 py-0.2 text-[9px] font-black uppercase ${
                        prof.tier === "titular"
                          ? "bg-neon-violet/40 text-fuchsia-100"
                          : "bg-neon-cyan/30 text-neon-cyan"
                      }`}
                    >
                      {prof.tier === "titular" ? "TITULAR" : "LA CANTERA"}
                    </span>
                  </div>
                  {active && <Check className="h-4 w-4 text-neon-cyan shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Formulario para Crear un Nuevo Perfil */}
        <form onSubmit={handleCreate} className="space-y-3.5 border-t border-neon-cyan/25 pt-4">
          <p className="text-xs font-extrabold uppercase tracking-wider text-neon-cyan">
            Crear un Perfil Nuevo desde Cero:
          </p>

          {/* Selector de Avatar Espacial */}
          <div>
            <label className="block text-xs font-bold text-cyan-100 mb-1.5">
              Elige tu emblema / avatar:
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatarUrl(emoji)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition ${
                    avatarUrl === emoji
                      ? "border-neon-cyan bg-neon-cyan/25 shadow-neon-cyan scale-110"
                      : "border-white/15 bg-space-900/80 hover:border-neon-cyan/50"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-cyan-100 mb-1">
                Tu @usuario único *
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej. Ryuko_Nova"
                className="w-full rounded-xl border border-neon-cyan/50 bg-[#060518] px-3 py-2 text-xs font-bold text-white focus:border-neon-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-cyan-100 mb-1">
                Nombre visible
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ej. Ryuko Streamer"
                className="w-full rounded-xl border border-neon-cyan/50 bg-[#060518] px-3 py-2 text-xs font-bold text-white focus:border-neon-cyan focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-cyan-100 mb-1">
              Correo electrónico (Supabase Auth)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu-correo@ejemplo.com"
              className="w-full rounded-xl border border-neon-cyan/50 bg-[#060518] px-3 py-2 text-xs font-bold text-white focus:border-neon-cyan focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-cyan-100 mb-1">
              Biografía de tu canal / sala
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-xl border border-neon-cyan/50 bg-[#060518] px-3 py-2 text-xs font-bold text-white focus:border-neon-cyan focus:outline-none"
            />
          </div>

          <div className="rounded-2xl border border-neon-cyan/35 bg-neon-cyan/10 p-3 flex items-start gap-2.5 text-xs text-cyan-100">
            <ShieldCheck className="h-4 w-4 text-neon-cyan shrink-0 mt-0.5" />
            <span>
              <strong>Regla Anti-Trampa de La Cantera:</strong> Tu cuenta inicia
              con antigüedad día 1, 0 seguidores y \$0 USD ganados. Al llegar a
              100 seguidores o \$100 USD pasarás automáticamente a{" "}
              <strong>Los Titulares</strong>.
            </span>
          </div>

          {createdBanner && (
            <div className="rounded-xl bg-neon-emerald/25 border border-neon-emerald px-3 py-2 text-center text-xs font-black text-neon-emerald">
              ¡Perfil creado con éxito + 500 NOVAS de prueba acreditadas!
            </div>
          )}

          <button
            type="submit"
            className="btn-neon-gradient w-full rounded-2xl py-3 text-xs sm:text-sm flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>Crear Mi Perfil Ahora (+500 NOVAS de Prueba)</span>
          </button>
        </form>
      </div>
    </div>
  );
}
