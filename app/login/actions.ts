"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type LoginState = { error: string };

const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function signIn(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!email || !password || !/^\S+@\S+\.\S+$/.test(email)) {
    return { error: "Confira seu e-mail e sua senha." };
  }

  if (!url || !publishableKey) {
    console.error("Supabase URL ou chave publishable não configurada.");
    return { error: "O acesso está temporariamente indisponível. Tente novamente." };
  }

  let response: Response;
  try {
    response = await fetch(`${url.replace(/\/$/, "")}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: publishableKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    return { error: "Não foi possível conectar. Verifique sua internet e tente novamente." };
  }

  const session = await response.json().catch(() => null);
  if (!response.ok || !session?.access_token || !session?.refresh_token) {
    return { error: "E-mail ou senha incorretos. Confira seus dados e tente novamente." };
  }

  const cookieStore = await cookies();
  cookieStore.set("ideastore-access-token", session.access_token, {
    ...sessionCookieOptions,
    maxAge: Number(session.expires_in) || 3600,
  });
  cookieStore.set("ideastore-refresh-token", session.refresh_token, {
    ...sessionCookieOptions,
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect("/aplicativo");
}

export async function signOut() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("ideastore-access-token")?.value;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (accessToken && url && publishableKey) {
    await fetch(`${url.replace(/\/$/, "")}/auth/v1/logout`, {
      method: "POST",
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }).catch(() => undefined);
  }

  cookieStore.delete("ideastore-access-token");
  cookieStore.delete("ideastore-refresh-token");
  redirect("/login");
}
