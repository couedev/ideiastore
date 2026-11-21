export type DrawInput = { names: string[]; budget: string };
export type DrawInputResult = { ok: true; value: DrawInput } | { ok: false; error: string };

export function parseDrawInput(body: unknown): DrawInputResult {
  if (!body || typeof body !== "object") return { ok: false, error: "Dados do sorteio inválidos." };
  const candidate = body as { names?: unknown; budget?: unknown };
  if (!Array.isArray(candidate.names) || candidate.names.length < 2 || candidate.names.length > 99
    || !candidate.names.every((name) => typeof name === "string")) {
    return { ok: false, error: "Informe de 2 a 99 participantes." };
  }

  const names = (candidate.names as string[])
    .map((name) => name.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim());
  if (names.some((name) => !name || name.length > 60)) {
    return { ok: false, error: "Cada nome deve ter entre 1 e 60 caracteres." };
  }
  if (new Set(names.map((name) => name.toLocaleLowerCase("pt-BR"))).size !== names.length) {
    return { ok: false, error: "Cada participante precisa ter um nome diferente." };
  }

  const budget = typeof candidate.budget === "string" ? candidate.budget.trim() : "";
  if (budget.length > 80) return { ok: false, error: "Valor do presente inválido." };
  return { ok: true, value: { names, budget } };
}
