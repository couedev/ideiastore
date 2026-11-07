import { supabaseAdminFetch } from "./supabase-admin";

type AuthUser = {
  id: string;
  email: string;
  email_confirmed_at?: string | null;
  confirmed_at?: string | null;
  user_metadata?: { name?: string };
};

export type StoreUser = {
  id: string;
  nome: string;
  email: string;
  convite_status: "none" | "pending" | "sending" | "sent" | "failed";
  convite_tentativas: number;
};

async function readJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`Supabase Auth respondeu ${response.status}.`);
  }
  return data as T;
}

async function getAuthUserById(id: string) {
  const response = await supabaseAdminFetch(`/auth/v1/admin/users/${encodeURIComponent(id)}`);
  if (response.status === 404) return null;
  const data = await readJson<{ user?: AuthUser } & AuthUser>(response);
  return data.user ?? data;
}

export async function isAuthUserEmailConfirmed(id: string) {
  const user = await getAuthUserById(id);
  return Boolean(user?.email_confirmed_at || user?.confirmed_at);
}

async function getAuthUserByEmail(email: string): Promise<AuthUser | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const pageSize = 1000;

  for (let page = 1; page <= 100; page += 1) {
    const params = new URLSearchParams({ page: String(page), per_page: String(pageSize) });
    const response = await supabaseAdminFetch(`/auth/v1/admin/users?${params}`);
    const data = await readJson<{ users: AuthUser[] }>(response);
    const match = data.users.find((user) => user.email?.trim().toLowerCase() === normalizedEmail);
    if (match) return match;
    if (data.users.length < pageSize) return null;
  }

  throw new Error("Não foi possível localizar a conta do comprador no Supabase Auth.");
}

async function createAuthUser(email: string, name: string): Promise<AuthUser> {
  const response = await supabaseAdminFetch("/auth/v1/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      email_confirm: false,
      user_metadata: { name },
    }),
  });

  if (response.ok) return readJson<AuthUser>(response);

  if (response.status === 422 || response.status === 409) {
    const existing = await getAuthUserByEmail(email);
    if (existing) return existing;
  }

  throw new Error(`Não foi possível criar a conta no Supabase Auth (${response.status}).`);
}

async function readStoreProfileByEmail(email: string) {
  const params = new URLSearchParams({
    select: "id,nome,email,convite_status,convite_tentativas",
    email: `eq.${email}`,
    limit: "2",
  });
  const response = await supabaseAdminFetch(`/rest/v1/usuarios?${params}`);
  const rows = await readJson<StoreUser[]>(response);
  if (rows.length > 1) throw new Error("Há mais de um perfil com o mesmo e-mail.");
  return rows[0] ?? null;
}

export async function getStoreUserById(id: string) {
  const params = new URLSearchParams({
    select: "id,nome,email,convite_status,convite_tentativas",
    id: `eq.${id}`,
    limit: "1",
  });
  const response = await supabaseAdminFetch(`/rest/v1/usuarios?${params}`);
  const rows = await readJson<StoreUser[]>(response);
  return rows[0] ?? null;
}

async function saveStoreProfile(
  profile: StoreUser | null,
  user: AuthUser,
  name: string,
  email: string,
) {
  const confirmed = Boolean(user.email_confirmed_at || user.confirmed_at);
  const initialStatus = confirmed ? "none" : "pending";

  if (profile) {
    const response = await supabaseAdminFetch(
      `/rest/v1/usuarios?id=eq.${encodeURIComponent(profile.id)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ nome: name, email }),
      },
    );
    if (!response.ok) throw new Error(`Não foi possível atualizar o perfil (${response.status}).`);

    if (!confirmed && profile.convite_status === "none") {
      const statusResponse = await supabaseAdminFetch(
        `/rest/v1/usuarios?id=eq.${encodeURIComponent(profile.id)}&convite_status=eq.none`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({ convite_status: "pending" }),
        },
      );
      if (!statusResponse.ok) throw new Error("Não foi possível preparar o convite de ativação.");
    }

    return {
      ...profile,
      nome: name,
      email,
      convite_status: !confirmed && profile.convite_status === "none"
        ? "pending"
        : profile.convite_status,
    } satisfies StoreUser;
  }

  const response = await supabaseAdminFetch("/rest/v1/usuarios?on_conflict=id", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify([{
      id: user.id,
      nome: name,
      email,
      criado_em: new Date().toISOString(),
      convite_status: initialStatus,
      convite_tentativas: 0,
    }]),
  });
  const rows = await readJson<StoreUser[]>(response);
  if (rows[0]) return rows[0];

  const inserted = await readStoreProfileByEmail(email);
  if (!inserted) throw new Error("O perfil do comprador não foi salvo.");
  return inserted;
}

export async function findOrCreatePurchasedUser(email: string, name: string) {
  const profile = await readStoreProfileByEmail(email);
  let authUser: AuthUser | null = null;

  if (profile) authUser = await getAuthUserById(profile.id);
  if (!authUser) authUser = await getAuthUserByEmail(email);
  if (!authUser) authUser = await createAuthUser(email, name);

  if (profile && profile.id !== authUser.id) {
    throw new Error("O perfil e a conta de autenticação não correspondem.");
  }

  const savedProfile = await saveStoreProfile(profile, authUser, name, email);
  return { user: authUser, profile: savedProfile };
}

async function updateInviteState(
  userId: string,
  patch: Record<string, unknown>,
) {
  const response = await supabaseAdminFetch(
    `/rest/v1/usuarios?id=eq.${encodeURIComponent(userId)}&convite_status=eq.sending`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(patch),
    },
  );
  if (!response.ok) throw new Error(`Não foi possível atualizar o estado do convite (${response.status}).`);
}

async function createActivationLink(email: string, name: string) {
  const siteUrl = (process.env.SITE_URL || "https://ideiastore.online").replace(/\/$/, "");
  const payload = {
    type: "invite",
    email,
    redirect_to: `${siteUrl}/login/ativar`,
    data: { name },
  };

  let response = await supabaseAdminFetch("/auth/v1/admin/generate_link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    response = await supabaseAdminFetch("/auth/v1/admin/generate_link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, type: "recovery" }),
    });
  }

  const data = await readJson<{ action_link?: string }>(response);
  if (!data.action_link) throw new Error("O Supabase não retornou o link de ativação.");
  return data.action_link;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);
}

async function sendBrevoActivation(email: string, name: string, actionLink: string) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey || !senderEmail) throw new Error("Brevo API ou remetente não configurado.");

  const safeName = escapeHtml(name || "por aí");
  const safeLink = escapeHtml(actionLink);
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: "IdeaStore", email: senderEmail },
      to: [{ email, name }],
      subject: "Ative seu acesso à IdeaStore",
      htmlContent: `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f7f2f2;font-family:Arial,sans-serif;color:#2a2226"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:36px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fff;border-radius:20px;padding:40px 32px"><tr><td><p style="margin:0 0 12px;color:#c63e68;font-weight:bold;letter-spacing:1px;font-size:12px">IDEASTORE</p><h1 style="margin:0 0 16px;font-size:25px">Seu acesso está pronto, ${safeName}!</h1><p style="margin:0 0 26px;color:#766d72;line-height:1.6">Defina uma senha para ativar sua conta e acessar suas ideias para a loja.</p><p style="margin:0 0 28px"><a href="${safeLink}" style="display:inline-block;padding:15px 24px;border-radius:12px;background:#c93c68;color:#fff;text-decoration:none;font-weight:bold">Ativar minha conta</a></p><p style="margin:0;color:#8c8388;font-size:12px;line-height:1.6">Se o botão não abrir, use este link:<br><a href="${safeLink}" style="color:#c93c68;word-break:break-all">${safeLink}</a></p><p style="margin:28px 0 0;color:#aaa1a6;font-size:11px">Se você não fez essa compra, pode ignorar este e-mail.</p></td></tr></table></td></tr></table></body></html>`,
      textContent: `Olá, ${name || ""}! Ative sua conta IdeaStore e defina uma senha neste link: ${actionLink}`,
    }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Brevo respondeu ${response.status}.`);
}

export async function sendPendingActivation(user: StoreUser) {
  const now = new Date();
  const staleLease = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
  const leaseUntil = new Date(now.getTime() + 10 * 60 * 1000).toISOString();
  const params = new URLSearchParams({
    select: "id,nome,email,convite_status,convite_tentativas",
    id: `eq.${user.id}`,
    or: `(convite_status.in.(pending,failed),and(convite_status.eq.sending,convite_lease_ate.lt.${staleLease}))`,
  });

  const statusResponse = await supabaseAdminFetch(`/rest/v1/usuarios?${params}`);
  const eligible = await readJson<StoreUser[]>(statusResponse);
  const current = eligible[0];
  if (!current) return "already-handled" as const;

  const claimParams = new URLSearchParams({
    id: `eq.${user.id}`,
    or: `(convite_status.in.(pending,failed),and(convite_status.eq.sending,convite_lease_ate.lt.${staleLease}))`,
    select: "id",
  });
  const claimResponse = await supabaseAdminFetch(`/rest/v1/usuarios?${claimParams}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      convite_status: "sending",
      convite_lease_ate: leaseUntil,
      convite_tentativas: (current.convite_tentativas || 0) + 1,
      convite_ultimo_erro: null,
    }),
  });
  const claim = await readJson<Array<{ id: string }>>(claimResponse);
  if (!claim.length) return "already-handled" as const;

  try {
    const actionLink = await createActivationLink(user.email, user.nome);
    await sendBrevoActivation(user.email, user.nome, actionLink);
    await updateInviteState(user.id, {
      convite_status: "sent",
      convite_lease_ate: null,
      convite_ultimo_erro: null,
    });
    return "sent" as const;
  } catch (error) {
    console.error("Falha ao preparar ou enviar convite de ativação.", {
      userId: user.id,
      message: error instanceof Error ? error.message : "erro desconhecido",
    });
    await updateInviteState(user.id, {
      convite_status: "failed",
      convite_lease_ate: null,
      convite_ultimo_erro: error instanceof Error ? error.message.slice(0, 500) : "Falha no envio.",
    });
    return "failed" as const;
  }
}
