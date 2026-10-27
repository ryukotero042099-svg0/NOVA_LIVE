"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  Radio,
  Film,
  Gamepad2,
  Wallet,
  UserCheck,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "cyan" | "violet" | "magenta";
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Inicio",
    sublabel: "Titulares • Cantera",
    icon: Flame,
    accent: "cyan",
  },
  {
    href: "/la-sala",
    label: "La Sala",
    sublabel: "Voz y Caos",
    icon: Radio,
    accent: "violet",
  },
  {
    href: "/reels",
    label: "Reels",
    sublabel: "Clips Cósmicos",
    icon: Film,
    accent: "magenta",
  },
  {
    href: "/juegos",
    label: "Juegos",
    sublabel: "HTML5 In-App",
    icon: Gamepad2,
    accent: "cyan",
  },
  {
    href: "/monedero",
    label: "Monedero",
    sublabel: "Saldo NOVA",
    icon: Wallet,
    accent: "violet",
  },
  {
    href: "/perfil",
    label: "Perfil",
    sublabel: "Panel Creador",
    icon: UserCheck,
    accent: "cyan",
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-neon-cyan/40 bg-[#07051a]/95 backdrop-blur-xl shadow-[0_-8px_32px_rgba(0,245,255,0.18)]"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          const activeStyles =
            item.accent === "cyan"
              ? "border-neon-cyan/80 bg-neon-cyan/15 text-neon-cyan shadow-neon-cyan"
              : item.accent === "violet"
              ? "border-neon-violet/80 bg-neon-violet/15 text-neon-violet shadow-neon-violet"
              : "border-neon-magenta/80 bg-neon-magenta/15 text-neon-magenta shadow-neon-magenta";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex flex-1 flex-col items-center justify-center rounded-2xl border px-2 py-1.5 transition-all duration-200 mx-0.5 ${
                isActive
                  ? activeStyles
                  : "border-transparent text-slate-200 hover:border-neon-cyan/30 hover:bg-white/5 hover:text-white"
              }`}
            >
              {isActive && (
                <span className="absolute -top-1 h-1 w-8 rounded-full bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-magenta shadow-neon-cyan" />
              )}
              <Icon
                className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "drop-shadow-[0_0_8px_currentColor]" : "text-neon-cyan/80"
                }`}
              />
              <span className="mt-1 text-xs font-extrabold tracking-wide">
                {item.label}
              </span>
              <span className="hidden sm:block text-[10px] font-medium text-cyan-200/80">
                {item.sublabel}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
