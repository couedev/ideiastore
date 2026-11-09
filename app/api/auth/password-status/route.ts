import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { hasPaidPurchase } from "../../../../lib/supabase-admin";

export async function GET() {
  const accessToken = (await cookies()).get("ideastore-access-token")?.value;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!accessToken || !url || !publishableKey) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }

  try {
    const userResponse = await fetch(`${url}/auth/v1/user`, {
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });
    const user = await userResponse.json().catch(() => null);

    if (!userResponse.ok || typeof user?.id !== "string") {
      return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
    }
    if (!(await hasPaidPurchase(user.id))) {
      return NextResponse.json({ error: "Compra não encontrada." }, { status: 403 });
    }

    return NextResponse.json(
      { needsPassword: user.user_metadata?.ideastore_password_created !== true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "Não foi possível verificar a conta." }, { status: 503 });
  }
}
