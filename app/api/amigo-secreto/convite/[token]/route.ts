import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseConfig, supabaseAdminFetch } from "../../../../../lib/supabase-admin";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };

type ParticipantRow = { nome: string; posicao: number; amigo_secreto_id: string; sorteado_id: string };
type NameRow = { nome: string };
type GroupRow = { valor_presente: string; criador_id: string };

async function getViewerId() {
  const accessToken = (await cookies()).get("ideastore-access-token")?.value;
  if (!accessToken) return null;

  const { url, publishableKey } = getSupabaseConfig();
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: publishableKey, Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) throw new Error(`Consulta de sessão retornou ${response.status}.`);
  const viewer = await response.json().catch(() => null) as { id?: unknown } | null;
  return typeof viewer?.id === "string" ? viewer.id : null;
}

export async function GET(_request: Request, context: RouteContext<"/api/amigo-secreto/convite/[token]">) {
  const { token } = await context.params;
  if (!uuidPattern.test(token)) return NextResponse.json({ error: "Convite inválido." }, { status: 404, headers });

  try {
    const params = new URLSearchParams({ select: "nome,posicao,amigo_secreto_id,sorteado_id", link_token: `eq.${token}`, limit: "1" });
    const response = await supabaseAdminFetch(`/rest/v1/amigo_secreto_participantes?${params}`);
    if (!response.ok) throw new Error(`Consulta de convite retornou ${response.status}.`);
    const rows = await response.json() as ParticipantRow[];
    const participant = rows[0];
    if (!participant) return NextResponse.json({ error: "Convite não encontrado." }, { status: 404, headers });

    const groupParams = new URLSearchParams({ select: "valor_presente,criador_id", id: `eq.${participant.amigo_secreto_id}`, limit: "1" });
    const [groupResponse, viewerId] = await Promise.all([
      supabaseAdminFetch(`/rest/v1/amigos_secretos?${groupParams}`),
      getViewerId(),
    ]);
    if (!groupResponse.ok) throw new Error(`Consulta de grupo retornou ${groupResponse.status}.`);
    const groups = await groupResponse.json() as GroupRow[];
    const group = groups[0];
    if (!group) throw new Error("Grupo do convite não encontrado.");
    if (viewerId === group.criador_id && participant.posicao !== 0) {
      return NextResponse.json({ name: participant.nome, blocked: true }, { headers });
    }

    const recipientParams = new URLSearchParams({
      select: "nome",
      id: `eq.${participant.sorteado_id}`,
      amigo_secreto_id: `eq.${participant.amigo_secreto_id}`,
      limit: "1",
    });
    const recipientResponse = await supabaseAdminFetch(`/rest/v1/amigo_secreto_participantes?${recipientParams}`);
    if (!recipientResponse.ok) throw new Error(`Consulta de sorteado retornou ${recipientResponse.status}.`);
    const recipients = await recipientResponse.json() as NameRow[];
    if (!recipients[0]) throw new Error("Sorteio incompleto no banco de dados.");

    return NextResponse.json({ name: participant.nome, recipient: recipients[0].nome, budget: group.valor_presente }, { headers });
  } catch (error) {
    console.error("Falha ao carregar convite do Amigo Secreto", error);
    return NextResponse.json({ error: "Não foi possível abrir seu convite agora." }, { status: 503, headers });
  }
}
