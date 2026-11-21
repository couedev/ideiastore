import { cookies } from "next/headers";
import { getStoreUserById } from "./sereja-activation";
import { getSupabaseConfig, hasPaidPurchase } from "./supabase-admin";

export class AmigoSecretoAccessError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function requirePaidCreator() {
  const token = (await cookies()).get("ideastore-access-token")?.value;
  if (!token) throw new AmigoSecretoAccessError("Entre na sua conta para continuar.", 401);

  const { url, publishableKey } = getSupabaseConfig();
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: publishableKey, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const user = await response.json().catch(() => null) as { id?: unknown } | null;
  if (!response.ok || typeof user?.id !== "string") {
    throw new AmigoSecretoAccessError("Sua sessão expirou. Entre novamente.", 401);
  }

  if (!(await hasPaidPurchase(user.id))) {
    throw new AmigoSecretoAccessError("Não encontramos uma compra aprovada para esta conta.", 403);
  }

  const profile = await getStoreUserById(user.id);
  if (!profile) throw new AmigoSecretoAccessError("Não encontramos seu cadastro de comprador.", 503);
  return { id: profile.id, name: profile.nome };
}
