import { NextResponse, type NextRequest } from "next/server";
import { hasPaidPurchase } from "./lib/supabase-admin";

const accessCookie = "ideastore-access-token";
const refreshCookie = "ideastore-refresh-token";

type AuthResult = {
  ok: boolean;
  unavailable?: boolean;
  hasPurchase?: boolean;
  userId?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
};

async function validateSession(
  accessToken: string | undefined,
  refreshToken: string | undefined,
  url: string,
  publishableKey: string,
): Promise<AuthResult> {
  if (accessToken) {
    const userResponse = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey: publishableKey, Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }).catch(() => null);

    if (userResponse?.ok) {
      const user = await userResponse.json().catch(() => null);
      return typeof user?.id === "string" ? { ok: true, userId: user.id } : { ok: false };
    }
    if (!userResponse || userResponse.status >= 500) return { ok: false, unavailable: true };
  }
  if (!refreshToken) return { ok: false };

  const refreshResponse = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: publishableKey, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  }).catch(() => null);

  if (!refreshResponse) return { ok: false, unavailable: true };
  if (!refreshResponse.ok) {
    return refreshResponse.status >= 500
      ? { ok: false, unavailable: true }
      : { ok: false };
  }
  const session = await refreshResponse.json().catch(() => null);
  if (!session?.access_token || !session?.refresh_token) return { ok: false };

  const refreshedUser = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: publishableKey, Authorization: `Bearer ${session.access_token}` },
    cache: "no-store",
  }).catch(() => null);

  if (!refreshedUser || refreshedUser.status >= 500) {
    return { ok: false, unavailable: true };
  }
  if (!refreshedUser.ok) return { ok: false };
  const user = await refreshedUser.json().catch(() => null);
  if (typeof user?.id !== "string") return { ok: false };
  return {
    ok: true,
    userId: user.id,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresIn: Number(session.expires_in) > 0 ? Number(session.expires_in) : 3600,
  };
}

function applySessionCookies(
  response: NextResponse,
  session: AuthResult,
  hadAccessToken: boolean,
  hadRefreshToken: boolean,
) {
  if (session.accessToken && session.refreshToken) {
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };
    response.cookies.set(accessCookie, session.accessToken, {
      ...options,
      maxAge: session.expiresIn ?? 3600,
    });
    response.cookies.set(refreshCookie, session.refreshToken, {
      ...options,
      maxAge: 60 * 60 * 24 * 30,
    });
  } else if (!session.ok && !session.unavailable && (hadAccessToken || hadRefreshToken)) {
    response.cookies.delete(accessCookie);
    response.cookies.delete(refreshCookie);
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const accessToken = request.cookies.get(accessCookie)?.value;
  const refreshToken = request.cookies.get(refreshCookie)?.value;
  const isApp = request.nextUrl.pathname.startsWith("/aplicativo");

  let session: AuthResult = { ok: false };
  if ((accessToken || refreshToken) && url && publishableKey) {
    session = await validateSession(accessToken, refreshToken, url, publishableKey);
  } else if ((accessToken || refreshToken) && (!url || !publishableKey)) {
    session.unavailable = true;
  }

  if (session.ok && session.userId) {
    try {
      session.hasPurchase = await hasPaidPurchase(session.userId);
    } catch {
      session.unavailable = true;
    }
  }

  if (isApp && (!session.ok || !session.hasPurchase)) {
    const loginUrl = new URL("/login", request.url);
    if (session.ok) {
      loginUrl.searchParams.set("acesso", session.unavailable ? "verificar" : "compra");
    }
    return applySessionCookies(
      NextResponse.redirect(loginUrl), session, !!accessToken, !!refreshToken,
    );
  }

  if (!isApp && session.ok && session.hasPurchase) {
    return applySessionCookies(
      NextResponse.redirect(new URL("/aplicativo", request.url)), session, !!accessToken, !!refreshToken,
    );
  }

  return applySessionCookies(NextResponse.next(), session, !!accessToken, !!refreshToken);
}

export const config = { matcher: ["/login", "/aplicativo/:path*"] };
