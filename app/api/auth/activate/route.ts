import { NextResponse } from "next/server";
import { getSupabaseConfig } from "../../../../lib/supabase-admin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as {
    accessToken?: unknown;
    password?: unknown;
  } | null;
  const accessToken = typeof body?.accessToken === "string" ? body.accessToken : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!accessToken || password.length < 8 || password.length > 128) {
    return NextResponse.json({ error: "Link inválido ou senha fora do padrão." }, { status: 400 });
  }

  try {
    const { url, publishableKey } = getSupabaseConfig();
    const headers = {
      apikey: publishableKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };
    const userResponse = await fetch(`${url}/auth/v1/user`, {
      headers,
      cache: "no-store",
    });
    if (!userResponse.ok) {
      return NextResponse.json({ error: "Este link expirou. Solicite um novo convite." }, { status: 401 });
    }

    const updateResponse = await fetch(`${url}/auth/v1/user`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ password }),
      cache: "no-store",
    });
    if (!updateResponse.ok) {
      return NextResponse.json({ error: "Não foi possível definir a senha. Solicite um novo convite." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Serviço de autenticação temporariamente indisponível." }, { status: 503 });
  }
}
