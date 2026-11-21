import { NextResponse } from "next/server";
import { AmigoSecretoAccessError, requirePaidCreator } from "../../../lib/amigo-secreto-auth";
import { supabaseAdminFetch } from "../../../lib/supabase-admin";

type GroupRow = { id: string; valor_presente: string; criado_em: string };
type ParticipantRow = { id: string; posicao: number; nome: string; link_token: string; sorteado_id: string };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers });
}

function failure(error: unknown) {
  if (error instanceof AmigoSecretoAccessError) return json({ error: error.message }, error.status);
  console.error("Falha no Amigo Secreto", error);
  return json({ error: "Não foi possível carregar o sorteio agora. Tente novamente." }, 503);
}

export async function GET(request: Request) {
  try {
    const creator = await requirePaidCreator();
    const requestedGroup = new URL(request.url).searchParams.get("grupo");
    if (requestedGroup && !uuidPattern.test(requestedGroup)) return json({ error: "Grupo inválido." }, 400);

    const groupParams = new URLSearchParams({
      select: "id,valor_presente,criado_em",
      criador_id: `eq.${creator.id}`,
      order: "criado_em.desc",
      limit: "100",
    });
    const groupsResponse = await supabaseAdminFetch(`/rest/v1/amigos_secretos?${groupParams}`);
    if (!groupsResponse.ok) throw new Error(`Consulta de grupos retornou ${groupsResponse.status}.`);
    const groups = await groupsResponse.json() as GroupRow[];
    const group = requestedGroup ? groups.find((item) => item.id === requestedGroup) : groups[0];
    if (requestedGroup && !group) return json({ error: "Esse grupo não pertence à sua conta." }, 404);

    if (!group) return json({ creatorName: creator.name, groups: [], group: null });

    const participantParams = new URLSearchParams({
      select: "id,posicao,nome,link_token,sorteado_id",
      amigo_secreto_id: `eq.${group.id}`,
      order: "posicao.asc",
    });
    const participantsResponse = await supabaseAdminFetch(`/rest/v1/amigo_secreto_participantes?${participantParams}`);
    if (!participantsResponse.ok) throw new Error(`Consulta de participantes retornou ${participantsResponse.status}.`);
    const participants = await participantsResponse.json() as ParticipantRow[];
    const creatorParticipant = participants[0];
    const myRecipient = participants.find((item) => item.id === creatorParticipant?.sorteado_id);
    if (!creatorParticipant || creatorParticipant.posicao !== 0 || !myRecipient) {
      throw new Error("Sorteio incompleto no banco de dados.");
    }

    return json({
      creatorName: creator.name,
      groups: groups.map((item) => ({ id: item.id, budget: item.valor_presente, createdAt: item.criado_em })),
      group: {
        id: group.id,
        budget: group.valor_presente,
        createdAt: group.criado_em,
        myRecipient: myRecipient.nome,
        participants: participants.map((item) => ({
          id: item.id,
          position: item.posicao,
          name: item.nome,
          token: item.link_token,
        })),
      },
    });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return json({ error: "Origem inválida." }, 403);

  try {
    const creator = await requirePaidCreator();
    const raw = await request.text();
    if (raw.length > 12000) return json({ error: "Lista de participantes muito grande." }, 413);
    const body = JSON.parse(raw) as { names?: unknown; budget?: unknown };
    if (!Array.isArray(body.names) || body.names.length < 2 || body.names.length > 99
      || !body.names.every((name) => typeof name === "string")) {
      return json({ error: "Informe de 2 a 99 participantes." }, 400);
    }

    const names = (body.names as string[]).map((name) => name.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim());
    if (names.some((name) => !name || name.length > 60)) {
      return json({ error: "Cada nome deve ter entre 1 e 60 caracteres." }, 400);
    }
    if (new Set(names.map((name) => name.toLocaleLowerCase("pt-BR"))).size !== names.length) {
      return json({ error: "Cada participante precisa ter um nome diferente." }, 400);
    }

    const budget = typeof body.budget === "string" ? body.budget.trim() : "";
    if (budget.length > 80) return json({ error: "Valor do presente inválido." }, 400);

    const response = await supabaseAdminFetch("/rest/v1/rpc/criar_amigo_secreto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ p_criador_id: creator.id, p_nomes: names, p_valor_presente: budget }),
    });
    if (!response.ok) throw new Error(`Criação do sorteio retornou ${response.status}.`);
    const groupId = await response.json() as unknown;
    if (typeof groupId !== "string" || !uuidPattern.test(groupId)) throw new Error("Resposta inválida do sorteio.");
    return json({ groupId }, 201);
  } catch (error) {
    if (error instanceof SyntaxError) return json({ error: "Dados do sorteio inválidos." }, 400);
    return failure(error);
  }
}
