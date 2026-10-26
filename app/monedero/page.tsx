"use client";

import React, { useState } from "react";
import {
  Wallet,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  Lock,
  CreditCard,
  Calculator,
  AlertCircle,
} from "lucide-react";
import {
  NOVA_PACKAGES,
  NOVA_ECONOMY_RULES,
  NOVA_GIFT_CATALOG,
  type NovaPackage,
} from "@/lib/types";
import { useApp } from "@/context/AppContext";

export default function MonederoPageStep3() {
  const {
    currentUser,
    transactions,
    purchasePackage,
    sendGift,
    linkStripeConnect,
    withdrawCreatorEarnings,
  } = useApp();

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingPkgId, setLoadingPkgId] = useState<string | null>(null);

  // Regalos de referencia para verificar el cálculo exacto del 77% al donar (Galaxia unificada en 250 Novas)
  const testGiftsFor77Check = [
    NOVA_GIFT_CATALOG.find((g) => g.id === "07-supernova")!, // 100 Novas = $1.00 USD -> $0.77 Creador (77%)
    NOVA_GIFT_CATALOG.find((g) => g.id === "09-galaxia")!, // 250 Novas = $2.50 USD -> $1.93 Creador (77%)
    NOVA_GIFT_CATALOG.find((g) => g.id === "27-ave-fenix")!, // 500 Novas = $5.00 USD -> $3.85 Creador (77%)
  ];

  const handleBuyPackage = async (pkg: NovaPackage) => {
    setErrorMessage(null);
    setLoadingPkgId(pkg.id);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          userId: currentUser.id,
        }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      purchasePackage(pkg);
      setStatusMessage(
        `¡Paquete ${pkg.name} (+${
          pkg.novas + pkg.bonusNovas
        } NOVAS) acreditado! Un solo cobro de $${pkg.priceUsd.toFixed(
          2
        )} USD procesado en Modo Prueba.`
      );
    } catch {
      purchasePackage(pkg);
      setStatusMessage(
        `¡Paquete ${pkg.name} (+${
          pkg.novas + pkg.bonusNovas
        } NOVAS) acreditado en Modo Prueba!`
      );
    } finally {
      setLoadingPkgId(null);
    }
  };

  const handleLinkStripeConnect = async () => {
    setErrorMessage(null);
    await fetch("/api/stripe/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "link_account",
        username: currentUser.username,
      }),
    });
    linkStripeConnect();
    setStatusMessage(
      `Cuenta de Stripe Connect Express vinculada en Modo Prueba para @${currentUser.username}.`
    );
  };

  const handleWithdraw = async () => {
    setErrorMessage(null);
    const result = withdrawCreatorEarnings();
    if (!result.ok) {
      setErrorMessage(result.error || "No se pudo completar el retiro.");
      return;
    }
    await fetch("/api/stripe/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "withdraw",
        amountUsd: result.withdrawnUsd,
        username: currentUser.username,
      }),
    });
    setStatusMessage(
      `¡Retiro exitoso de $${result.withdrawnUsd?.toFixed(
        2
      )} USD enviado a tu cuenta vía Stripe Connect (calculado al 77% de creador)!`
    );
  };

  const withdrawProgress = Math.min(
    100,
    Math.round(
      (currentUser.availableWithdrawUsd /
        NOVA_ECONOMY_RULES.MIN_WITHDRAWAL_USD) *
        100
    )
  );

  return (
    <div className="space-y-6">
      {/* Cabecera del Monedero + Resumen en Vivo */}
      <section className="glass-card-cyan rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-neon-cyan bg-neon-cyan/20 px-3 py-1 text-xs font-black text-neon-cyan shadow-neon-cyan">
              <Wallet className="h-4 w-4" />
              <span>PASO 3 ACTIVO • MONEDERO NOVA Y SELLO 77 / 20 / 3</span>
            </div>
            <h1 className="mt-2.5 text-2xl sm:text-3xl font-black text-white text-glow-cyan">
              Monedero NOVA y Ganancias del Creador (77%)
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-cyan-100/90 max-w-2xl">
              Moneda interna cerrada: se compra en paquetes con un solo cobro por
              Stripe, no se transfiere entre usuarios, no es cripto y no tiene
              apuestas ni azar.
            </p>
          </div>

          {/* Tarjeta de Saldo Actual */}
          <div className="rounded-2xl border-2 border-neon-cyan bg-[#06182c]/95 px-5 py-3.5 text-right shadow-neon-cyan">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-200 block">
              Tu Saldo Disponible
            </span>
            <span className="text-3xl font-black text-white text-glow-cyan">
              {currentUser.novaBalance}{" "}
              <span className="text-sm text-neon-cyan">NOVAS</span>
            </span>
            <span className="block text-[11px] font-bold text-neon-emerald mt-0.5">
              Ganancias Creador (77%): \$
              {currentUser.creatorEarningsUsd.toFixed(2)} USD
            </span>
          </div>
        </div>

        {statusMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-neon-emerald bg-neon-emerald/15 px-4 py-3 text-xs font-black text-neon-emerald">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-neon-magenta bg-neon-magenta/20 px-4 py-3 text-xs font-black text-pink-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-neon-magenta" />
            <span>{errorMessage}</span>
          </div>
        )}
      </section>

      {/* SELLO OFICIAL DE TRANSPARENCIA PÚBLICA 77 / 20 / 3 (Sin Letras Chicas) */}
      <section className="glass-card-violet rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-violet bg-neon-violet/25 px-3 py-0.5 text-xs font-black text-fuchsia-100">
              <ShieldCheck className="h-4 w-4 text-neon-cyan" />
              SELLO PÚBLICO SIN LETRAS CHICAS: 77 / 20 / 3
            </span>
            <h2 className="mt-2 text-lg sm:text-xl font-black text-white text-glow-violet">
              ¿Cómo se reparte cada \$100 USD de gasto en NOVAS?
            </h2>
          </div>
          <span className="rounded-xl border border-neon-cyan/50 bg-neon-cyan/15 px-3 py-1.5 text-xs font-black text-neon-cyan self-start">
            Suscripciones: 95% Creador / 5% Plataforma
          </span>
        </div>

        {/* Barra Visual Proporcional 77% / 20% / 3% */}
        <div className="space-y-2">
          <div className="flex h-6 w-full overflow-hidden rounded-2xl border border-white/25 bg-space-950 p-0.5">
            <div
              style={{ width: "77%" }}
              className="flex items-center justify-center rounded-l-xl bg-gradient-to-r from-neon-cyan to-emerald-400 text-[11px] font-black text-slate-950"
            >
              77% CREADOR (\$77)
            </div>
            <div
              style={{ width: "20%" }}
              className="flex items-center justify-center bg-neon-violet text-[11px] font-black text-white"
            >
              20% APP (\$20)
            </div>
            <div
              style={{ width: "3%" }}
              className="flex items-center justify-center rounded-r-xl bg-amber-400 text-[10px] font-black text-slate-950"
              title="3% Procesador de pagos Stripe"
            >
              3%
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="rounded-2xl border border-neon-cyan/50 bg-[#072034]/85 p-3.5">
              <p className="text-xs font-bold text-cyan-200">
                Para el Creador
              </p>
              <p className="text-2xl font-black text-neon-cyan text-glow-cyan">
                77% (\$77 de \$100)
              </p>
              <p className="text-[11px] text-cyan-100/85 mt-0.5">
                Se suma al instante a tu saldo retirable con cada donación o
                evento.
              </p>
            </div>

            <div className="rounded-2xl border border-neon-violet/50 bg-[#1e0b38]/85 p-3.5">
              <p className="text-xs font-bold text-fuchsia-200">
                Para la Plataforma NOVA
              </p>
              <p className="text-2xl font-black text-fuchsia-200 text-glow-violet">
                20% (\$20 de \$100)
              </p>
              <p className="text-[11px] text-fuchsia-100/85 mt-0.5">
                Mantiene el video en vivo WebRTC de baja latencia y servidores de
                juego.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-400/50 bg-[#281b08]/85 p-3.5">
              <p className="text-xs font-bold text-amber-200">
                Procesador de Pagos (Stripe)
              </p>
              <p className="text-2xl font-black text-amber-300">
                ~3% (\$3 de \$100)
              </p>
              <p className="text-[11px] text-amber-100/85 mt-0.5">
                Comisión bancaria por un solo cobro al comprar el paquete.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VERIFICADOR EN VIVO DEL CÁLCULO DEL 77% AL DONAR (Corazón del Paso 3) */}
      <section className="glass-card-magenta rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-400/20 px-3 py-0.5 text-xs font-black text-amber-200">
              <Calculator className="h-3.5 w-3.5" />
              CORAZÓN DEL PASO 3 • VERIFICADOR EN VIVO DEL 77%
            </span>
            <h2 className="mt-2 text-lg sm:text-xl font-black text-white text-glow-magenta">
              Prueba una Donación y Comprueba que el Creador Recibe Exactamente
              el 77%
            </h2>
            <p className="text-xs text-pink-100/90">
              Toca cualquiera de estos 3 regalos para disparar su animación y ver
              cómo el saldo del creador sube exactamente el{" "}
              <strong className="text-neon-emerald">77%</strong> del valor del
              regalo.
            </p>
          </div>
          <div className="rounded-2xl border border-neon-emerald/60 bg-emerald-950/60 px-4 py-2.5 text-right">
            <span className="block text-[10px] font-black uppercase text-emerald-200">
              Ganancia Acumulada Creador (77%)
            </span>
            <span className="text-2xl font-black text-neon-emerald">
              \${currentUser.creatorEarningsUsd.toFixed(2)} USD
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {testGiftsFor77Check.map((gift) => {
            const grossUsd = +(
              gift.novas * NOVA_ECONOMY_RULES.USD_PER_NOVA
            ).toFixed(2);
            const creator77 = +(
              (grossUsd * NOVA_ECONOMY_RULES.CREATOR_SHARE_PERCENT) /
              100
            ).toFixed(2);
            const platform20 = +(
              (grossUsd * NOVA_ECONOMY_RULES.PLATFORM_SHARE_PERCENT) /
              100
            ).toFixed(2);
            const processor3 = +(
              (grossUsd * NOVA_ECONOMY_RULES.PROCESSOR_SHARE_PERCENT) /
              100
            ).toFixed(2);

            return (
              <button
                key={gift.id}
                type="button"
                onClick={() => {
                  const res = sendGift(
                    gift,
                    currentUser.username,
                    `@${currentUser.username}`
                  );
                  if (!res.ok && res.error) {
                    setErrorMessage(res.error);
                  } else {
                    setStatusMessage(
                      `Donaste ${gift.name} (${
                        gift.novas
                      } NOVAS = $${grossUsd.toFixed(
                        2
                      )} USD) → El creador recibió exactamente +$${creator77.toFixed(
                        2
                      )} USD (77%) | Plataforma: $${platform20.toFixed(
                        2
                      )} (20%) | Stripe: $${processor3.toFixed(2)} (3%).`
                    );
                  }
                }}
                className="group rounded-2xl border border-amber-300/60 bg-[#230926]/90 p-4 text-left transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-neon-magenta"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={gift.pngUrl}
                    alt={gift.name}
                    className="h-14 w-14 object-contain group-hover:scale-110 transition"
                  />
                  <div>
                    <p className="text-sm font-black text-white">{gift.name}</p>
                    <span className="inline-block rounded-full bg-amber-300 px-2.5 py-0.5 text-[11px] font-black text-slate-950 mt-0.5">
                      {gift.novas} NOVAS (\${grossUsd.toFixed(2)} USD)
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-1 rounded-xl bg-black/40 p-2.5 text-xs border border-white/10">
                  <div className="flex justify-between font-black text-neon-emerald">
                    <span>77% Creador:</span>
                    <span>+\${creator77.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-fuchsia-200 font-semibold">
                    <span>20% Plataforma:</span>
                    <span>\${platform20.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-amber-200/90 font-semibold">
                    <span>3% Stripe:</span>
                    <span>\${processor3.toFixed(2)} USD</span>
                  </div>
                </div>

                <span className="mt-2.5 block text-center text-xs font-black text-neon-cyan underline">
                  Donar y sumar +\${creator77.toFixed(2)} USD (77%) →
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Tienda con los 5 Paquetes Oficiales NOVA (500/$4.99, 1,050/$9.99, 2,200/$19.99, 5,750/$49.99, 12,000/$99.99) */}
      <section className="glass-card rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-neon-cyan" />
              <span>
                Los 5 Paquetes Oficiales de NOVAS (Stripe Checkout Test)
              </span>
            </h2>
            <p className="text-xs text-cyan-200/85">
              Un solo cobro por paquete (nunca por cada regalo): 500/\$4.99 •
              1,050/\$9.99 • 2,200/\$19.99 • 5,750/\$49.99 • 12,000/\$99.99.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-xl border border-neon-cyan/40 bg-space-900 px-3 py-1 text-[11px] font-bold text-cyan-200">
            <Lock className="h-3.5 w-3.5 text-neon-cyan" />5 Paquetes Oficiales
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {NOVA_PACKAGES.map((pkg) => {
            const cardClass =
              pkg.glowVariant === "cyan"
                ? "glass-card-cyan"
                : pkg.glowVariant === "violet"
                ? "glass-card-violet"
                : pkg.glowVariant === "magenta"
                ? "glass-card-magenta"
                : "glass-card-magenta border-amber-300/80";

            return (
              <div
                key={pkg.id}
                className={`${cardClass} rounded-3xl p-4 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      {pkg.name}
                    </span>
                    {pkg.badge && (
                      <span className="rounded-full bg-white/15 border border-white/30 px-2 py-0.5 text-[9px] font-black text-neon-cyan">
                        {pkg.badge}
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white text-glow-cyan">
                      {pkg.novas.toLocaleString("en-US")}
                    </span>
                    <span className="text-[11px] font-black text-neon-cyan">
                      NOVAS
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] text-slate-200/90 leading-relaxed">
                    {pkg.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/15 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-cyan-200">
                      Precio:
                    </span>
                    <span className="text-base font-black text-white">
                      \${pkg.priceUsd.toFixed(2)} USD
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={loadingPkgId === pkg.id}
                    onClick={() => handleBuyPackage(pkg)}
                    className="btn-neon-cyan w-full rounded-xl py-2 text-xs font-black flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>
                      {loadingPkgId === pkg.id
                        ? "Procesando..."
                        : `Comprar \$${pkg.priceUsd.toFixed(2)}`}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Panel de Retiros del Creador desde $20 USD vía Stripe Connect */}
      <section className="glass-card rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-neon-emerald" />
              <span>
                Retiros del Creador vía Stripe Connect (Desde \$
                {NOVA_ECONOMY_RULES.MIN_WITHDRAWAL_USD} USD)
              </span>
            </h2>
            <p className="text-xs text-cyan-200/85">
              Todo tu saldo disponible proviene del{" "}
              <strong className="text-neon-emerald">77%</strong> de los regalos y
              eventos recibidos en tus salas.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {!currentUser.stripeConnectLinked ? (
              <button
                type="button"
                onClick={handleLinkStripeConnect}
                className="btn-neon-violet rounded-2xl px-4 py-2.5 text-xs font-black"
              >
                Vincular Stripe Connect (Modo Test)
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-2xl border border-neon-emerald/60 bg-neon-emerald/15 px-3.5 py-2 text-xs font-black text-neon-emerald">
                <CheckCircle2 className="h-4 w-4" />
                Stripe Connect Activo
              </span>
            )}

            <button
              type="button"
              onClick={handleWithdraw}
              className="btn-neon-gradient rounded-2xl px-4 py-2.5 text-xs font-black"
            >
              Retirar \${currentUser.availableWithdrawUsd.toFixed(2)} USD Ahora
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-neon-cyan/35 bg-space-900/85 p-4 space-y-2">
          <div className="flex justify-between text-xs font-black">
            <span className="text-cyan-200">
              Progreso hacia el mínimo de retiro (\$
              {NOVA_ECONOMY_RULES.MIN_WITHDRAWAL_USD}.00 USD)
            </span>
            <span className="text-neon-emerald">
              \${currentUser.availableWithdrawUsd.toFixed(2)} / \$
              {NOVA_ECONOMY_RULES.MIN_WITHDRAWAL_USD}.00 USD
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-space-950 border border-neon-cyan/30">
            <div
              className="h-full bg-gradient-to-r from-neon-cyan via-neon-emerald to-neon-violet transition-all duration-300"
              style={{ width: `${withdrawProgress}%` }}
            />
          </div>
        </div>
      </section>

      {/* Historial Contable Detallado con Desglose 77 / 20 / 3 */}
      <section className="glass-card rounded-3xl p-5 sm:p-6 space-y-3">
        <h2 className="text-base sm:text-lg font-black text-white">
          Historial Contable Transparente (Desglose 77% Creador / 20% App / 3%
          Stripe)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neon-cyan/30 text-cyan-200">
                <th className="py-2 pr-3">Concepto</th>
                <th className="py-2 px-2">NOVAS</th>
                <th className="py-2 px-2">Bruto USD</th>
                <th className="py-2 px-2 text-neon-emerald">77% Creador</th>
                <th className="py-2 px-2 text-fuchsia-200">20% App</th>
                <th className="py-2 pl-2 text-amber-200">3% Stripe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {transactions.slice(0, 12).map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5">
                  <td className="py-2.5 pr-3 font-bold text-white">
                    {tx.title}
                  </td>
                  <td className="py-2.5 px-2 font-black text-neon-cyan">
                    {tx.amountNovas !== undefined
                      ? tx.amountNovas > 0
                        ? `+${tx.amountNovas}`
                        : tx.amountNovas
                      : "—"}
                  </td>
                  <td className="py-2.5 px-2 font-bold text-slate-200">
                    \${tx.amountUsd.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-2 font-black text-neon-emerald">
                    {tx.creatorShareUsd !== undefined
                      ? `+$${tx.creatorShareUsd.toFixed(2)}`
                      : "—"}
                  </td>
                  <td className="py-2.5 px-2 font-semibold text-fuchsia-200">
                    {tx.platformShareUsd !== undefined
                      ? `$${tx.platformShareUsd.toFixed(2)}`
                      : "—"}
                  </td>
                  <td className="py-2.5 pl-2 font-semibold text-amber-200">
                    {tx.processorShareUsd !== undefined
                      ? `$${tx.processorShareUsd.toFixed(2)}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
