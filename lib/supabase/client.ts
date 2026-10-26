import { type BroadcastHistoryLog, type NovaTransaction } from "@/lib/types";

/**
 * Conector de Supabase para NOVA LIVE
 * Soporta conexión directa con un proyecto de Supabase mediante variables de entorno
 * (.env.local: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY)
 * y mantiene sincronización inmediata en modo prueba local para desarrollo sin fricción.
 */

export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  isCloudConfigured: Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ),
};

export async function syncProfileToSupabaseIfConfigured(profile: unknown) {
  if (!SUPABASE_CONFIG.isCloudConfigured) {
    return { mode: "sandbox-local" as const, synced: true };
  }
  try {
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/profiles`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_CONFIG.anonKey,
        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify(profile),
    });
    return { mode: "supabase-cloud" as const, synced: res.ok };
  } catch {
    return { mode: "sandbox-local" as const, synced: false };
  }
}

export async function saveBroadcastToSupabaseIfConfigured(
  log: BroadcastHistoryLog
) {
  if (!SUPABASE_CONFIG.isCloudConfigured) {
    return { mode: "sandbox-local" as const, saved: true };
  }
  try {
    const payload = {
      id: log.id,
      host_id: log.hostId,
      host_username: log.hostUsername,
      host_display_name: log.hostDisplayName,
      title: log.title,
      started_at: log.startedAt,
      ended_at: log.endedAt,
      duration_seconds: log.durationSeconds,
      peak_viewers: log.peakViewers,
      provider_mode: log.providerMode,
    };

    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/live_broadcasts`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_CONFIG.anonKey,
        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify(payload),
    });
    return { mode: "supabase-cloud" as const, saved: res.ok };
  } catch {
    return { mode: "sandbox-local" as const, saved: false };
  }
}

export async function saveDonationToSupabaseIfConfigured(
  tx: NovaTransaction,
  recipientCreatorId?: string
) {
  if (!SUPABASE_CONFIG.isCloudConfigured) {
    return { mode: "sandbox-local" as const, saved: true };
  }
  try {
    const payload = {
      id: tx.id,
      user_id: tx.userId,
      recipient_id: recipientCreatorId || null,
      type: tx.type,
      title: tx.title,
      amount_novas: tx.amountNovas || 0,
      amount_usd: tx.amountUsd,
      creator_share_usd: tx.creatorShareUsd || 0,
      platform_share_usd: tx.platformShareUsd || 0,
      processor_share_usd: tx.processorShareUsd || 0,
      created_at: tx.createdAt,
      status: tx.status,
    };

    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/nova_transactions`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_CONFIG.anonKey,
        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify(payload),
    });
    return { mode: "supabase-cloud" as const, saved: res.ok };
  } catch {
    return { mode: "sandbox-local" as const, saved: false };
  }
}
