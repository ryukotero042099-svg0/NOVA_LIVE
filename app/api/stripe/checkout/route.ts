import { NextResponse } from "next/server";
import { NOVA_PACKAGES } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { packageId, userId } = body as {
      packageId: string;
      userId: string;
    };

    const selectedPkg = NOVA_PACKAGES.find((p) => p.id === packageId);
    if (!selectedPkg) {
      return NextResponse.json(
        { error: "Paquete NOVA no encontrado" },
        { status: 400 }
      );
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
    const isStripeConfigured =
      stripeSecretKey.startsWith("sk_test_") ||
      stripeSecretKey.startsWith("sk_live_");

    // Si el usuario configuró su llave sk_test_ o sk_live_, creamos sesión real en Stripe Checkout API
    if (isStripeConfigured) {
      const origin =
        request.headers.get("origin") ||
        request.headers.get("referer") ||
        "http://localhost:3005";
      const baseUrl = origin.replace(/\/+$/, "");

      const params = new URLSearchParams();
      params.append("mode", "payment");
      params.append(
        "success_url",
        `${baseUrl}/monedero?checkout=success`
      );
      params.append(
        "cancel_url",
        `${baseUrl}/monedero?checkout=cancel`
      );
      params.append("line_items[0][price_data][currency]", "usd");
      params.append(
        "line_items[0][price_data][product_data][name]",
        `Paquete ${selectedPkg.name} (${
          selectedPkg.novas + selectedPkg.bonusNovas
        } NOVAS)`
      );
      params.append(
        "line_items[0][price_data][unit_amount]",
        String(Math.round(selectedPkg.priceUsd * 100))
      );
      params.append("line_items[0][quantity]", "1");
      params.append("metadata[userId]", userId || "anon");
      params.append("metadata[packageId]", selectedPkg.id);

      const stripeRes = await fetch(
        "https://api.stripe.com/v1/checkout/sessions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${stripeSecretKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        }
      );

      if (stripeRes.ok) {
        const session = await stripeRes.json();
        return NextResponse.json({
          mode: "stripe_checkout",
          checkoutUrl: session.url,
          package: selectedPkg,
        });
      }
    }

    // Modo Prueba Instantáneo (Sandbox local sin exponer llaves)
    return NextResponse.json({
      mode: "sandbox_instant",
      creditedNovas: selectedPkg.novas + selectedPkg.bonusNovas,
      chargedUsd: selectedPkg.priceUsd,
      package: selectedPkg,
      message: `Paquete ${selectedPkg.name} acreditado en Modo Prueba (Un solo cobro por paquete).`,
    });
  } catch {
    return NextResponse.json(
      { error: "Error procesando el paquete NOVA" },
      { status: 500 }
    );
  }
}
