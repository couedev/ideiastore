"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasPaidPurchase } from "../../lib/supabase-admin";

export type LoginState = { error: string };
export type PasswordState = { status: "idle" | "error" | "success"; message: string };

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

  if (session.user?.user_metadata?.ideastore_password_created !== true) {
    const userMetadata = session.user?.user_metadata;
    await fetch(`${url.replace(/\/$/, "")}/auth/v1/user`, {
      method: "PUT",
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          ...(userMetadata && typeof userMetadata === "object" ? userMetadata : {}),
          ideastore_password_created: true,
        },
      }),
      cache: "no-store",
    }).catch(() => undefined);
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

export async function setPassword(
  _previousState: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");

  if (password.length < 8 || password.length > 128) {
    return { status: "error", message: "A senha deve ter entre 8 e 128 caracteres." };
  }
  if (password !== confirmation) {
    return { status: "error", message: "As senhas não coincidem." };
  }

  const accessToken = (await cookies()).get("ideastore-access-token")?.value;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!accessToken || !url || !publishableKey) {
    return { status: "error", message: "Sua sessão expirou. Entre novamente para definir a senha." };
  }

  const headers = {
    apikey: publishableKey,
    Authorization: `Bearer ${accessToken}`,
  };

  try {
    const userResponse = await fetch(`${url}/auth/v1/user`, {
      headers,
      cache: "no-store",
    });
    const user = await userResponse.json().catch(() => null);
    if (!userResponse.ok || typeof user?.id !== "string") {
      return { status: "error", message: "Sua sessão expirou. Entre novamente para definir a senha." };
    }

    if (!(await hasPaidPurchase(user.id))) {
      return { status: "error", message: "Não encontramos uma compra aprovada para esta conta." };
    }

    const updateResponse = await fetch(`${url}/auth/v1/user`, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        password,
        data: {
          ...(user.user_metadata && typeof user.user_metadata === "object" ? user.user_metadata : {}),
          ideastore_password_created: true,
        },
      }),
      cache: "no-store",
    });

    if (!updateResponse.ok) {
      const result = await updateResponse.json().catch(() => null);
      if (result?.code === "reauthentication_needed") {
        return { status: "error", message: "Entre novamente com um link de acesso recente e tente definir a senha." };
      }
      return { status: "error", message: "O Supabase recusou essa senha. Escolha uma senha mais forte e tente novamente." };
    }

    return { status: "success", message: "Senha salva. Agora você pode entrar com e-mail e senha ou com um link de acesso." };
  } catch {
    return { status: "error", message: "Não foi possível salvar a senha agora. Tente novamente." };
  }
}
