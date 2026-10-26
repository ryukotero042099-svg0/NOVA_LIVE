# NOVA LIVE — Plataforma de Streaming en Vivo con Juegos Integrados (Paso 1)

## Concepto y Regla Crítica de Arquitectura
- **Streaming + Juegos In-App (Cero Espejo de Pantalla):** El streamer transmite en vivo desde dentro de la misma aplicación web y los juegos corren como módulos nativos (`HTML5 Canvas`) dentro de la misma sesión.
- **Interacción en Tiempo Real con NOVAS:** Los espectadores gastan la moneda cerrada **NOVA** en eventos que alteran la partida en vivo o tocan **ENTRAR A JUGAR** para sumarse instantáneamente a la partida del anfitrión.

## Contenido de este paquete (Paso 1 de la Fase 1)
1. **Sistema de Diseño Espacial Muy Luminoso (`tailwind.config.ts`, `app/globals.css`):**
   - Fondo espacial profundo (`#04030c` / `#09071c`) con nebulosas luminosas en **cian (`#00f5ff`)**, **violeta (`#b829ff`)** y **magenta (`#ff2a85`)**.
   - Tarjetas de cristal con luz propia (`.glass-card`, `.glass-card-cyan`, `.glass-card-violet`, `.glass-card-magenta`) y botones con resplandor neón.
   - Diseño **Vertical-First** (pensado para gaming móvil) con conmutador de vista vertical/expandida en cabecera.
2. **Tipos del Dominio y Reglas Oficiales (`lib/types/index.ts`):**
   - **Paquetes NOVA:** *Órbita* (100 Novas), *Nova* (500 + 50 Novas) y *Supernova* (1500 + 250 Novas).
   - **Niveles de Animación de Donación (siempre con el nombre de quien dona):**
     - **Estrella Fugaz:** desde **5 Novas** (5 – 24 Novas).
     - **Explosión Nova:** desde **25 Novas** (25 – 99 Novas).
     - **Supernova:** desde **100 Novas** (100+ Novas).
   - **Reparto Transparente:** 94% creador / 3% plataforma / ~3% procesador en gasto de Novas; 95% / 5% en suscripciones; retiros desde $20 USD vía Stripe Connect.
3. **Navegación Base y Vistas Esqueleto (`components/layout/AppShell.tsx`, `BottomNav.tsx`, `app/*`):**
   - **Inicio (`/`):** Estructura lado a lado permanente (**Los Titulares** y **La Cantera**), paquetes NOVA y probador interactivo en vivo de las 3 animaciones de donación (5, 25 y 100 Novas).
   - **La Sala (`/la-sala`)**, **Juegos (`/juegos`)**, **Monedero (`/monedero`)** y **Perfil (`/perfil`)**.

## Cómo ejecutar en local
```bash
npm install
npm run dev
# Abrir http://localhost:3005
```
