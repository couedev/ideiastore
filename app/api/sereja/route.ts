import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { findOrCreatePurchasedUser, getStoreUserById, isAuthUserEmailConfirmed, sendPendingActivation } from "../../../lib/sereja-activation";
import { supabaseAdminFetch } from "../../../lib/supabase-admin";

type SerejaPayload = {
  id?: unknown;
  type?: unknown;
  event?: unknown;
  sale_id?: unknown;
  payment?: { status?: unknown };
  data?: {
    sale?: {
      id?: unknown;
      status?: unknown;
      product_id?: unknown;
      buyer?: { name?: unknown; email?: unknown };
    };
  };
};

type Purchase = { id: string; usuario_id: string; status: string; sereja_event_id?: string | null };

function verifySerejaSignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature || !/^[\da-f]{64}$/i.test(signature)) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest();
  const received = Buffer.from(signature, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

async function findPurchase(field: "sereja_venda_id" | "sereja_event_id", value: string) {
  const params = new URLSearchParams({
    select: "id,usuario_id,status,sereja_event_id",
    [field]: `eq.${value}`,
    limit: "1",
  });
  const response = await supabaseAdminFetch(`/rest/v1/compras?${params}`);
  if (!response.ok) throw new Error(`Não foi possível consultar compras (${response.status}).`);
  const rows = (await response.json()) as Purchase[];
  return rows[0] ?? null;
}

async function savePaidPurchase(userId: string, saleId: string, eventId: string) {
  const params = new URLSearchParams({ on_conflict: "sereja_venda_id" });
  const response = await supabaseAdminFetch(`/rest/v1/compras?${params}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "resolution=ignore-duplicates,return=minimal",
    },
    body: JSON.stringify({
      usuario_id: userId,
      sereja_venda_id: saleId,
      sereja_event_id: eventId,
      status: "paid",
    }),
  });
  if (!response.ok) throw new Error(`Não foi possível registrar a compra (${response.status}).`);
}

async function updateReversedPurchase(saleId: string, status: "refunded" | "chargeback") {
  const params = new URLSearchParams({
    sereja_venda_id: `eq.${saleId}`,
    status: "eq.paid",
  });
  const response = await supabaseAdminFetch(`/rest/v1/compras?${params}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error(`Não foi possível atualizar o estorno (${response.status}).`);
}

function acceptedProductIds() {
  return (process.env.SEREJA_PRODUCT_IDS ?? "")
    .split(",")
    .map((productId) => productId.trim())
    .filter(Boolean);
}

export async function POST(request: Request) {
  const secret = process.env.SEREJA_WEBHOOK_SECRET;
  if (!secret) {
    console.error("SEREJA_WEBHOOK_SECRET não configurado.");
    return NextResponse.json({ error: "Webhook indisponível." }, { status: 503 });
  }

  const signature = request.headers.get("x-sereja-signature");
  const eventHeader = request.headers.get("x-sereja-event");
  const deliveryId = request.headers.get("x-sereja-delivery");
  const rawBody = await request.text();

  if (Buffer.byteLength(rawBody, "utf8") > 1024 * 1024) {
    return NextResponse.json({ error: "Payload muito grande." }, { status: 413 });
  }

  if (!verifySerejaSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  }

  let payload: SerejaPayload;
  try {
    payload = JSON.parse(rawBody) as SerejaPayload;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const payloadEvents = [payload.type, payload.event].filter((value): value is string => typeof value === "string");
  if (!eventHeader || !payloadEvents.length || payloadEvents.some((event) => event !== eventHeader)) {
    return NextResponse.json({ error: "Evento não corresponde ao cabeçalho." }, { status: 400 });
  }

  const sale = payload.data?.sale;
  const saleId = typeof sale?.id === "string" ? sale.id : typeof payload.sale_id === "string" ? payload.sale_id : "";
  const productId = typeof sale?.product_id === "string" ? sale.product_id : "";
  const saleStatus = typeof sale?.status === "string" ? sale.status : "";
  const paymentStatus = typeof payload.payment?.status === "string" ? payload.payment.status : "";
  const eventId = typeof payload.id === "string" ? payload.id : "";

  if (!saleId || saleId.length > 256 || !productId || productId.length > 256) {
    return NextResponse.json({ error: "Venda incompleta." }, { status: 400 });
  }

  const productIds = acceptedProductIds();
  if (!productIds.length) {
    console.error("SEREJA_PRODUCT_IDS não configurado.");
    return NextResponse.json({ error: "Produto do webhook não configurado." }, { status: 503 });
  }
  if (!productIds.includes(productId)) {
    console.warn("Webhook Sereja ignorado: product_id fora de SEREJA_PRODUCT_IDS.", {
      eventId,
      productId,
    });
    return NextResponse.json({ received: true, ignored: "produto não autorizado" });
  }

  if (saleStatus === "refunded" || saleStatus === "chargeback") {
    await updateReversedPurchase(saleId, saleStatus);
    return NextResponse.json({ received: true, reversed: true });
  }

  const saleIsPaid = saleStatus === "paid" || saleStatus === "pago";
  if (eventHeader !== "sale.paid" || paymentStatus !== "paid" || !saleIsPaid) {
    return NextResponse.json({ received: true, ignored: "pagamento não aprovado" });
  }

  if (!eventId || eventId.length > 256) {
    return NextResponse.json({ error: "Identificador do evento ausente ou inválido." }, { status: 400 });
  }

  const rawBuyerName = sale?.buyer?.name;
  const rawBuyerEmail = sale?.buyer?.email;
  const buyerName = typeof rawBuyerName === "string"
    ? rawBuyerName.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 200)
    : "";
  const buyerEmail = typeof rawBuyerEmail === "string" ? rawBuyerEmail.trim().toLowerCase() : "";
  if (!buyerName || buyerEmail.length > 320 || !/^\S+@\S+\.\S+$/.test(buyerEmail)) {
    return NextResponse.json({ error: "Dados do comprador inválidos." }, { status: 400 });
  }

  try {
    const duplicateEvent = await findPurchase("sereja_event_id", eventId);
    if (duplicateEvent) {
      if (duplicateEvent.status === "paid") {
        const profile = await getStoreUserById(duplicateEvent.usuario_id);
        if (profile && ["pending", "failed"].includes(profile.convite_status)
          && !(await isAuthUserEmailConfirmed(profile.id))) {
          const emailResult = await sendPendingActivation(profile);
          if (emailResult === "failed") {
            return NextResponse.json({ error: "Compra salva; envio do convite será repetido." }, { status: 503 });
          }
        }
      }
      return NextResponse.json({ received: true, duplicate: true });
    }

    const duplicateSale = await findPurchase("sereja_venda_id", saleId);
    if (duplicateSale) {
      if (duplicateSale.status === "paid") {
        const profile = await getStoreUserById(duplicateSale.usuario_id);
        if (profile && ["pending", "failed"].includes(profile.convite_status)
          && !(await isAuthUserEmailConfirmed(profile.id))) {
          const emailResult = await sendPendingActivation(profile);
          if (emailResult === "failed") {
            return NextResponse.json({ error: "Compra salva; envio do convite será repetido." }, { status: 503 });
          }
        }
      }
      return NextResponse.json({ received: true, duplicate: true });
    }

    const { user, profile } = await findOrCreatePurchasedUser(buyerEmail, buyerName);
    await savePaidPurchase(user.id, saleId, eventId);

    const savedPurchase = await findPurchase("sereja_venda_id", saleId);
    if (!savedPurchase || savedPurchase.status !== "paid") {
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (["pending", "failed"].includes(profile.convite_status)
      && !(user.email_confirmed_at || user.confirmed_at)) {
      const emailResult = await sendPendingActivation(profile);
      if (emailResult === "failed") {
        return NextResponse.json({ error: "Compra salva; envio do convite será repetido." }, { status: 503 });
      }
    }

    return NextResponse.json({ received: true, processed: true }, { status: 200 });
  } catch (error) {
    console.error("Falha ao processar webhook Sereja", {
      eventId,
      saleId,
      deliveryId,
      message: error instanceof Error ? error.message : "erro desconhecido",
    });
    return NextResponse.json({ error: "Falha temporária no processamento." }, { status: 503 });
  }
}
