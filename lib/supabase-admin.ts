const supabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");

export function getSupabaseConfig() {
  const url = supabaseUrl();
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !secretKey || !publishableKey) {
    throw new Error("Configuração do Supabase incompleta.");
  }

  return { url, secretKey, publishableKey };
}

export function adminHeaders(extra?: HeadersInit) {
  const { secretKey } = getSupabaseConfig();
  const headers = new Headers(extra);
  headers.set("apikey", secretKey);
  return headers;
}

export async function supabaseAdminFetch(path: string, init: RequestInit = {}) {
  const { url } = getSupabaseConfig();
  return fetch(`${url}${path}`, {
    ...init,
    headers: adminHeaders(init.headers),
    cache: "no-store",
  });
}

export async function hasPaidPurchase(userId: string) {
  const params = new URLSearchParams({
    select: "id",
    usuario_id: `eq.${userId}`,
    status: "eq.paid",
    limit: "1",
  });

  const response = await supabaseAdminFetch(`/rest/v1/compras?${params}`);
  if (!response.ok) throw new Error("Não foi possível verificar a compra do usuário.");

  const rows = (await response.json()) as Array<{ id: string }>;
  return rows.length > 0;
}
