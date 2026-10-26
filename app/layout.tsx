import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "NOVA LIVE — Streaming en Vivo con Juegos Integrados",
  description:
    "Plataforma de streaming en español donde los juegos corren dentro de la app, la audiencia altera la partida con NOVAS o entra a jugar con un toque.",
  icons: {
    icon: "/logo-nova-icono-v3-sin-arco.png",
    shortcut: "/logo-nova-icono-v3-sin-arco.png",
    apple: "/logo-nova-icono-v3-sin-arco.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased selection:bg-neon-cyan selection:text-slate-950">
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
