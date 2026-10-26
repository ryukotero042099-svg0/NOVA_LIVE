"use client";

import React, { useState } from "react";
import { Rocket, Users, Sparkles, X, Send } from "lucide-react";
import { type UserProfile } from "@/lib/types";
import { useApp } from "@/context/AppContext";

interface PasaleTuGenteModalProps {
  fromTitular: UserProfile | null;
  onClose: () => void;
}

export function PasaleTuGenteModal({
  fromTitular,
  onClose,
}: PasaleTuGenteModalProps) {
  const { profiles, triggerPasaleTuGente } = useApp();
  const canteraCreators = profiles.filter((p) => p.tier === "cantera");

  const [selectedCanteraId, setSelectedCanteraId] = useState<string>(
    canteraCreators[0]?.id || ""
  );
  const [message, setMessage] = useState<string>(
    "¡Les paso mi gente! Entren todos a apoyar este en vivo de La Cantera."
  );

  if (!fromTitular) return null;

  const targetId = selectedCanteraId || canteraCreators[0]?.id || "";

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId) return;
    triggerPasaleTuGente(fromTitular.id, targetId, message);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-card-violet relative w-full max-w-lg rounded-3xl p-6 space-y-4 border-2 border-neon-cyan shadow-neon-cyan-lg">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl border border-white/20 bg-space-900/80 p-1.5 text-cyan-200 hover:text-white"
          aria-label="Cerrar modal"
        >
          <X className="h-4 w-4" />
        </button>

        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-cyan bg-neon-cyan/20 px-3 py-0.5 text-xs font-black text-neon-cyan">
            <Rocket className="h-3.5 w-3.5" />
            BOTÓN SOLIDARIO • PÁSALE TU GENTE
          </span>
          <h3 className="mt-2 text-xl sm:text-2xl font-black text-white text-glow-cyan">
            {fromTitular.avatarUrl} {fromTitular.displayName} (@
            {fromTitular.username})
          </h3>
          <p className="text-xs text-cyan-100/90 mt-1">
            Elige a qué creador de{" "}
            <strong className="text-neon-cyan">LA CANTERA</strong> quieres
            recomendar y enviarle tu público. Tus seguidores verán el aviso
            destacado en su pantalla de Inicio.
          </p>
        </div>

        {canteraCreators.length === 0 ? (
          <div className="rounded-2xl border border-amber-400/50 bg-amber-950/30 p-4 text-xs font-bold text-amber-200">
            ¡Todos los creadores de prueba ya se graduaron a Los Titulares! Usa
            el botón &ldquo;Restablecer Astro Caos&rdquo; o crea un perfil nuevo
            para tener creadores en La Cantera.
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-cyan-200">
                Selecciona un creador de LA CANTERA:
              </label>
              <div className="space-y-2">
                {canteraCreators.map((c) => {
                  const isSelected = c.id === targetId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCanteraId(c.id)}
                      className={`w-full flex items-center justify-between rounded-2xl border p-3 text-left transition ${
                        isSelected
                          ? "border-neon-cyan bg-neon-cyan/20 shadow-neon-cyan"
                          : "border-white/15 bg-space-900/75 hover:border-neon-cyan/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-neon-cyan/50 bg-space-950 text-2xl">
                          {c.avatarUrl}
                        </span>
                        <div>
                          <p className="text-sm font-black text-white">
                            {c.displayName}{" "}
                            <span className="text-xs font-bold text-neon-cyan">
                              @{c.username}
                            </span>
                          </p>
                          <p className="text-[11px] text-cyan-200/85">
                            Antigüedad: {c.accountAgeDays} días •{" "}
                            {c.followersCount}/100 seg. • \$
                            {c.creatorEarningsUsd.toFixed(2)} USD
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-neon-cyan/25 px-2.5 py-1 text-[10px] font-black text-neon-cyan">
                        <Users className="h-3 w-3" />
                        Elegir
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-200 mb-1">
                Mensaje de recomendación para tus seguidores:
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-neon-cyan/50 bg-[#060518] px-3 py-2 text-xs font-bold text-white focus:border-neon-cyan focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="btn-neon-gradient w-full rounded-2xl py-3 text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              <Sparkles className="h-4 w-4" />
              <span>¡Pasarle Mi Gente y Destacar en Inicio!</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
