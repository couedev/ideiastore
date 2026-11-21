import { NextResponse } from "next/server";
import { parseDrawInput } from "../../../../lib/amigo-secreto-input";
import { supabaseAdminFetch } from "../../../../lib/supabase-admin";

const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return json({ error: "Origem inválida." }, 403);

  try {
    const raw = await request.text();
    if (raw.length > 12000) return json({ error: "Lista de participantes muito grande." }, 413);
    const parsed = parseDrawInput(JSON.parse(raw));
    if (!parsed.ok) return json({ error: parsed.error }, 400);

    // Rascunhos sem pagamento expiram; a limpeza não interfere em compras aprovadas.
    const cleanupParams = new URLSearchParams({ expira_em: `lt.${new Date().toISOString()}` });
    const cleanup = await supabaseAdminFetch(`/rest/v1/amigo_secreto_rascunhos?${cleanupParams}`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    });
    if (!cleanup.ok) throw new Error(`Limpeza de rascunhos retornou ${cleanup.status}.`);

    const response = await supabaseAdminFetch("/rest/v1/amigo_secreto_rascunhos?select=id", {
      method: "POST",
      headers: { "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({ nomes: parsed.value.names, valor_presente: parsed.value.budget }),
    });
    if (!response.ok) throw new Error(`Criação de rascunho retornou ${response.status}.`);
    const rows = await response.json() as Array<{ id?: unknown }>;
    const externalRef = rows[0]?.id;
    if (typeof externalRef !== "string") throw new Error("O rascunho não retornou um identificador.");
    return json({ externalRef }, 201);
  } catch (error) {
    if (error instanceof SyntaxError) return json({ error: "Dados do quiz inválidos." }, 400);
    console.error("Falha ao preparar checkout do Amigo Secreto", error);
    return json({ error: "Não foi possível preparar seu checkout. Tente novamente." }, 503);
  }
}
