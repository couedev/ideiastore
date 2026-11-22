import { hasPaidPurchase, supabaseAdminFetch } from "./supabase-admin";

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
      user_metadata: { name, ideastore_password_created: false },
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

async function createMagicLink(email: string, name: string) {
  const configuredSiteUrl = process.env.SITE_URL?.trim();
  const siteUrl = configuredSiteUrl || (process.env.NODE_ENV === "production" ? "" : "http://localhost:3000");
  if (!siteUrl) throw new Error("SITE_URL must be configured in production.");
  const siteOrigin = new URL(siteUrl).origin;
  if (process.env.NODE_ENV === "production" && siteOrigin !== "https://ideiastore.online") {
    throw new Error("Production SITE_URL must be https://ideiastore.online.");
  }
  const payload = {
    type: "magiclink",
    email,
    data: { name },
  };

  const response = await supabaseAdminFetch("/auth/v1/admin/generate_link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await readJson<{
    action_link?: string;
    hashed_token?: string;
    verification_type?: string;
  }>(response);
  if (!data.action_link) throw new Error("O Supabase não retornou o link de ativação.");
  if (!data.hashed_token) throw new Error("Supabase did not return the activation token hash.");

  const verificationType = data.verification_type === "magiclink" ? "magiclink" : "";
  if (!verificationType) throw new Error("Supabase did not return a magic link verification type.");
  const activationUrl = new URL("/login/ativar", siteOrigin);
  activationUrl.searchParams.set("token_hash", data.hashed_token);
  activationUrl.searchParams.set("type", verificationType);
  return activationUrl.toString();
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

async function sendBrevoMagicLink(email: string, name: string, actionLink: string) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey || !senderEmail) throw new Error("Brevo API ou remetente não configurado.");

  const plainName = name.trim() || "por aí";
  const safeName = escapeHtml(plainName);
  const safeLink = escapeHtml(actionLink);
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: "Amigo Secreto Natalino", email: senderEmail },
      to: [{ email, name }],
      subject: "Seu acesso ao Amigo Secreto Natalino chegou!",
      htmlContent: `<!doctype html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Seu Amigo Secreto Natalino</title></head>
<body style="margin:0;padding:0;background-color:#F8F5EA;color:#15362C;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F5EA">
    <tr><td align="center" style="padding:32px 16px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border:1px solid #e3e9df;border-radius:18px">
        <tr><td style="border-top:6px solid #721218;padding:34px 30px 32px">
          <p style="margin:0 0 20px;color:#721218;font-size:12px;font-weight:700;letter-spacing:2px">AMIGO SECRETO NATALINO</p>
          <h1 style="margin:0 0 16px;color:#15362C;font-size:28px;line-height:1.2">Seu acesso está liberado, ${safeName}!</h1>
          <p style="margin:0 0 24px;color:#48675d;font-size:16px;line-height:1.6">Seu Natal ficou mais divertido. Abra o aplicativo para conferir a brincadeira e compartilhar um link individual com cada participante.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 26px;background-color:#F8F5EA;border-radius:12px">
            <tr><td style="padding:18px 20px;color:#15362C;font-size:14px;line-height:1.6"><strong>Como funciona:</strong> cada pessoa abre o próprio link e raspa o cartão para descobrir quem tirou.</td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" bgcolor="#15362C" style="border-radius:12px">
              <a href="${safeLink}" style="display:block;padding:17px 20px;color:#ffffff;font-size:14px;font-weight:700;letter-spacing:.4px;text-decoration:none">ABRIR MEU AMIGO SECRETO</a>
            </td></tr>
          </table>
          <p style="margin:24px 0 0;color:#62796f;font-size:12px;line-height:1.6">Se o botão não abrir, copie este link:<br><a href="${safeLink}" style="color:#721218;word-break:break-all">${safeLink}</a></p>
          <p style="margin:26px 0 0;padding-top:18px;border-top:1px solid #e3e9df;color:#72867c;font-size:11px;line-height:1.6">Este link é pessoal e temporário. Se você não solicitou este acesso, pode ignorar este e-mail.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      textContent: `Olá, ${plainName}!

Seu acesso ao Amigo Secreto Natalino está liberado. Abra o aplicativo para conferir a brincadeira e compartilhar um link individual com cada participante.

Acesse: ${actionLink}

Cada pessoa abre o próprio link e raspa o cartão para descobrir quem tirou.

Este link é pessoal e temporário. Se você não solicitou este acesso, pode ignorar este e-mail.`,
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
    const actionLink = await createMagicLink(user.email, user.nome);
    await sendBrevoMagicLink(user.email, user.nome, actionLink);
    await updateInviteState(user.id, {
      convite_status: "sent",
      convite_lease_ate: new Date(Date.now() + 60 * 1000).toISOString(),
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

export async function requestMagicLinkForEmail(email: string) {
  const profile = await readStoreProfileByEmail(email.trim().toLowerCase());
  if (!profile || !(await hasPaidPurchase(profile.id))) return "not-eligible" as const;

  if (profile.convite_status === "none" || profile.convite_status === "sent") {
    const claimParams = new URLSearchParams({
      id: `eq.${profile.id}`,
      select: "id",
    });
    if (profile.convite_status === "none") {
      claimParams.set("convite_status", "eq.none");
    } else {
      claimParams.set("convite_status", "eq.sent");
      claimParams.set("or", `(convite_lease_ate.is.null,convite_lease_ate.lt.${new Date().toISOString()})`);
    }

    const claimResponse = await supabaseAdminFetch(`/rest/v1/usuarios?${claimParams}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        convite_status: "pending",
        convite_lease_ate: null,
        convite_ultimo_erro: null,
      }),
    });
    const claim = await readJson<Array<{ id: string }>>(claimResponse);
    if (!claim.length) return "already-handled" as const;
  }

  if (profile.convite_status === "sending") return "already-handled" as const;
  const currentProfile = await getStoreUserById(profile.id);
  if (!currentProfile) return "not-eligible" as const;
  return sendPendingActivation(currentProfile);
}
