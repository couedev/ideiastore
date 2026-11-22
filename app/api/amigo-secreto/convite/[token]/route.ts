import { NextResponse } from "next/server";
import { supabaseAdminFetch } from "../../../../../lib/supabase-admin";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };

type ParticipantRow = { nome: string; amigo_secreto_id: string; sorteado_id: string };
type NameRow = { nome: string };
type GroupRow = { valor_presente: string };

export async function GET(_request: Request, context: RouteContext<"/api/amigo-secreto/convite/[token]">) {
  const { token } = await context.params;
  if (!uuidPattern.test(token)) return NextResponse.json({ error: "Convite inválido." }, { status: 404, headers });

  try {
    const params = new URLSearchParams({ select: "nome,amigo_secreto_id,sorteado_id", link_token: `eq.${token}`, limit: "1" });
    const response = await supabaseAdminFetch(`/rest/v1/amigo_secreto_participantes?${params}`);
    if (!response.ok) throw new Error(`Consulta de convite retornou ${response.status}.`);
    const rows = await response.json() as ParticipantRow[];
    const participant = rows[0];
    if (!participant) return NextResponse.json({ error: "Convite não encontrado." }, { status: 404, headers });

    const recipientParams = new URLSearchParams({
      select: "nome",
      id: `eq.${participant.sorteado_id}`,
      amigo_secreto_id: `eq.${participant.amigo_secreto_id}`,
      limit: "1",
    });
    const groupParams = new URLSearchParams({ select: "valor_presente", id: `eq.${participant.amigo_secreto_id}`, limit: "1" });
    const [recipientResponse, groupResponse] = await Promise.all([
      supabaseAdminFetch(`/rest/v1/amigo_secreto_participantes?${recipientParams}`),
      supabaseAdminFetch(`/rest/v1/amigos_secretos?${groupParams}`),
    ]);
    if (!recipientResponse.ok || !groupResponse.ok) throw new Error("Não foi possível consultar o resultado do convite.");
    const [recipients, groups] = await Promise.all([
      recipientResponse.json() as Promise<NameRow[]>,
      groupResponse.json() as Promise<GroupRow[]>,
    ]);
    if (!recipients[0] || !groups[0]) throw new Error("Sorteio incompleto no banco de dados.");

    return NextResponse.json({ name: participant.nome, recipient: recipients[0].nome, budget: groups[0].valor_presente }, { headers });
  } catch (error) {
    console.error("Falha ao carregar convite do Amigo Secreto", error);
    return NextResponse.json({ error: "Não foi possível abrir seu convite agora." }, { status: 503, headers });
  }
}
