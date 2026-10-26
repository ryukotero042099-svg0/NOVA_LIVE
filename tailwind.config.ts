import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: "#04030c",
          900: "#070617",
          800: "#0d0b28",
          700: "#15123d",
        },
        neon: {
          cyan: "#00f5ff",
          sky: "#38bdf8",
          violet: "#b829ff",
          purple: "#9333ea",
          magenta: "#ff2a85",
          gold: "#ffcf33",
          emerald: "#00ff9d",
        },
      },
      boxShadow: {
        "neon-cyan": "0 0 18px rgba(0, 245, 255, 0.55), 0 0 36px rgba(0, 245, 255, 0.25)",
        "neon-cyan-lg": "0 0 25px rgba(0, 245, 255, 0.8), 0 0 55px rgba(0, 245, 255, 0.4)",
        "neon-violet": "0 0 18px rgba(184, 41, 255, 0.55), 0 0 36px rgba(184, 41, 255, 0.25)",
        "neon-violet-lg": "0 0 25px rgba(184, 41, 255, 0.85), 0 0 55px rgba(184, 41, 255, 0.45)",
        "neon-magenta": "0 0 20px rgba(255, 42, 133, 0.65), 0 0 42px rgba(255, 42, 133, 0.3)",
        "neon-gold": "0 0 22px rgba(255, 207, 51, 0.7), 0 0 48px rgba(255, 42, 133, 0.45)",
        "glass-glow": "inset 0 1px 1px rgba(255, 255, 255, 0.25), 0 8px 32px rgba(0, 245, 255, 0.14)",
      },
      animation: {
        "pulse-glow": "pulseGlow 2.6s ease-in-out infinite",
        "shooting-star": "shootingStar 2.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "nova-explosion": "novaExplosion 2.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "supernova-wave": "supernovaWave 3.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "float-slow": "floatSlow 4s ease-in-out infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": {
            filter: "drop-shadow(0 0 8px rgba(0, 245, 255, 0.65))",
          },
          "50%": {
            filter: "drop-shadow(0 0 18px rgba(184, 41, 255, 0.9))",
          },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
