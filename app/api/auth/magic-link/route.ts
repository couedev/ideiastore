import { NextResponse } from "next/server";
import { hasPaidPurchase } from "../../../../lib/supabase-admin";

const accessCookie = "ideastore-access-token";
const refreshCookie = "ideastore-refresh-token";

type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  user?: { id?: string };
};

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
}

export async function POST(request: Request) {
  const requestOrigin = request.headers.get("origin");
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) {
    return json({ error: "Invalid request." }, 403);
  }

  const body = await request.json().catch(() => null) as { tokenHash?: unknown } | null;
  const tokenHash = typeof body?.tokenHash === "string" ? body.tokenHash : "";
  if (!tokenHash || tokenHash.length > 512) {
    return json({ error: "This access link is invalid or expired." }, 400);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) {
    return json({ error: "Authentication is temporarily unavailable." }, 503);
  }

  try {
    const verifyResponse = await fetch(`${supabaseUrl}/auth/v1/verify`, {
      method: "POST",
      headers: {
        apikey: publishableKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token_hash: tokenHash, type: "magiclink" }),
      cache: "no-store",
    });
    const session = await verifyResponse.json().catch(() => null) as AuthSession | null;
    if (!verifyResponse.ok || !session?.access_token || !session.refresh_token) {
      return json({ error: "This access link expired or was already used. Request a new link." }, 401);
    }

    let userId = session.user?.id;
    if (!userId) {
      const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });
      const user = await userResponse.json().catch(() => null);
      if (!userResponse.ok || typeof user?.id !== "string") {
        return json({ error: "This access link could not be verified." }, 401);
      }
      userId = user.id;
    }

    if (typeof userId !== "string") {
      return json({ error: "This access link could not be verified." }, 401);
    }

    if (!(await hasPaidPurchase(userId))) {
      return json({ error: "No approved purchase was found for this account." }, 403);
    }

    const response = json({ success: true });
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };
    response.cookies.set(accessCookie, session.access_token, {
      ...options,
      maxAge: typeof session.expires_in === "number" ? session.expires_in : 3600,
    });
    response.cookies.set(refreshCookie, session.refresh_token, {
      ...options,
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch {
    return json({ error: "Authentication is temporarily unavailable." }, 503);
  }
}
