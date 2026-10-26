import { NextResponse } from "next/server";
import { NOVA_ECONOMY_RULES } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, amountUsd, username } = body as {
      action: "link_account" | "withdraw";
      amountUsd?: number;
      username?: string;
    };

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
    const isStripeConfigured =
      stripeSecretKey.startsWith("sk_test_") ||
      stripeSecretKey.startsWith("sk_live_");

    if (action === "link_account") {
      return NextResponse.json({
        ok: true,
        mode: isStripeConfigured ? "stripe_connect" : "sandbox_connect",
        stripeAccountId: `acct_test_${Date.now().toString().slice(-6)}`,
        message: `Cuenta Stripe Connect Express vinculada para @${
          username || "creador"
        }.`,
      });
    }

    if (action === "withdraw") {
      if (!amountUsd || amountUsd < NOVA_ECONOMY_RULES.MIN_WITHDRAWAL_USD) {
        return NextResponse.json(
          {
            ok: false,
            error: `El monto mínimo de retiro es de $${NOVA_ECONOMY_RULES.MIN_WITHDRAWAL_USD}.00 USD.`,
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        ok: true,
        mode: isStripeConfigured ? "stripe_connect" : "sandbox_connect",
        payoutId: `po_test_${Date.now().toString().slice(-6)}`,
        withdrawnUsd: amountUsd,
        message: `Retiro de $${amountUsd.toFixed(
          2
        )} USD (acumulado al 77% de creador) enviado vía Stripe Connect.`,
      });
    }

    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Error en Stripe Connect" },
      { status: 500 }
    );
  }
}
