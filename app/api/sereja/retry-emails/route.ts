import { NextResponse } from "next/server";
import { isAuthUserEmailConfirmed, sendPendingActivation, type StoreUser } from "../../../../lib/sereja-activation";
import { hasPaidPurchase, supabaseAdminFetch } from "../../../../lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "Retry não configurado." }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const expiredLease = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const params = new URLSearchParams({
    select: "id,nome,email,convite_status,convite_tentativas",
    or: `(convite_status.in.(pending,failed),and(convite_status.eq.sending,convite_lease_ate.lt.${expiredLease}))`,
    order: "convite_tentativas.asc",
    limit: "50",
  });

  try {
    const response = await supabaseAdminFetch(`/rest/v1/usuarios?${params}`);
    if (!response.ok) throw new Error(`Supabase respondeu ${response.status}.`);
    const profiles = (await response.json()) as StoreUser[];
    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const profile of profiles) {
      if (!(await hasPaidPurchase(profile.id))) {
        skipped += 1;
        continue;
      }

      if (await isAuthUserEmailConfirmed(profile.id)) {
        const update = await supabaseAdminFetch(
          `/rest/v1/usuarios?id=eq.${encodeURIComponent(profile.id)}&convite_status=neq.sent`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
            body: JSON.stringify({
              convite_status: "sent",
              convite_lease_ate: null,
              convite_ultimo_erro: null,
            }),
          },
        );
        if (!update.ok) throw new Error("Não foi possível corrigir o estado do convite.");
        skipped += 1;
        continue;
      }

      const result = await sendPendingActivation(profile);
      if (result === "sent") sent += 1;
      else if (result === "failed") failed += 1;
      else skipped += 1;
    }

    return NextResponse.json({ processed: profiles.length, sent, failed, skipped });
  } catch (error) {
    console.error("Falha ao reprocessar convites Sereja", {
      message: error instanceof Error ? error.message : "erro desconhecido",
    });
    return NextResponse.json({ error: "Falha temporária no reprocessamento." }, { status: 503 });
  }
}
