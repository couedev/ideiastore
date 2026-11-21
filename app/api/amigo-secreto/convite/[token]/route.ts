import { NextResponse } from "next/server";
import { supabaseAdminFetch } from "../../../../../lib/supabase-admin";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };

export async function GET(_request: Request, context: RouteContext<"/api/amigo-secreto/convite/[token]">) {
  const { token } = await context.params;
  if (!uuidPattern.test(token)) return NextResponse.json({ error: "Convite inválido." }, { status: 404, headers });

  try {
    const params = new URLSearchParams({ select: "nome", link_token: `eq.${token}`, limit: "1" });
    const response = await supabaseAdminFetch(`/rest/v1/amigo_secreto_participantes?${params}`);
    if (!response.ok) throw new Error(`Consulta de convite retornou ${response.status}.`);
    const rows = await response.json() as Array<{ nome: string }>;
    if (!rows[0]) return NextResponse.json({ error: "Convite não encontrado." }, { status: 404, headers });
    return NextResponse.json({ name: rows[0].nome }, { headers });
  } catch (error) {
    console.error("Falha ao carregar convite do Amigo Secreto", error);
    return NextResponse.json({ error: "Não foi possível abrir seu convite agora." }, { status: 503, headers });
  }
}
