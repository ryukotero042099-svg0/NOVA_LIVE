import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      roomName = "sala-principal-nova",
      participantId,
      identity,
      participantName,
      displayName,
      isHost = false,
    } = body as {
      roomName?: string;
      participantId?: string;
      identity?: string;
      participantName?: string;
      displayName?: string;
      isHost?: boolean;
    };

    const resolvedIdentity = participantId || identity || `user-${Date.now()}`;
    const resolvedName = participantName || displayName || "Usuario NOVA";

    // Las llaves se leen EXCLUSIVAMENTE en el servidor desde .env.local (nunca expuestas)
    const livekitUrl =
      process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL || "";
    const apiKey = process.env.LIVEKIT_API_KEY || "";
    const apiSecret = process.env.LIVEKIT_API_SECRET || "";

    const isLiveKitConfigured =
      Boolean(livekitUrl && apiKey && apiSecret) &&
      apiKey !== "devkey" &&
      !livekitUrl.includes("tu-proyecto") &&
      !apiSecret.includes("tu-secreto");

    if (isLiveKitConfigured) {
      const at = new AccessToken(apiKey, apiSecret, {
        identity: resolvedIdentity,
        name: resolvedName,
        ttl: "6h",
      });

      at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: Boolean(isHost), // SOLO el anfitrión tiene permiso de publicación (cámara/micrófono)
        canSubscribe: true,
        canPublishData: true,
      });

      const token = await at.toJwt();

      return NextResponse.json({
        mode: "livekit_cloud" as const,
        token,
        wsUrl: livekitUrl,
        roomName,
        message: "Conectado a LiveKit Cloud (WebRTC de calidad real).",
      });
    }

    return NextResponse.json({
      mode: "demo_webrtc" as const,
      token: null,
      wsUrl: null,
      roomName,
      message:
        "MODO DEMOSTRACIÓN ACTIVO: Sin llaves en .env.local — Sincronización demo activa.",
    });
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Error al generar credenciales de sala";
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const roomName = url.searchParams.get("room") || url.searchParams.get("roomName") || "sala-principal-nova";
  const participantId = url.searchParams.get("participantId") || url.searchParams.get("identity") || `user-${Date.now()}`;
  const participantName = url.searchParams.get("username") || url.searchParams.get("participantName") || "Usuario NOVA";
  const isHost = url.searchParams.get("isHost") === "true" || url.searchParams.get("role") === "host";

  // Reutiliza la misma lógica con request simulado
  const mockReq = new Request(request.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomName, participantId, participantName, isHost }),
  });
  return POST(mockReq);
}

