import { NextResponse } from "next/server";
import { requestMagicLinkForEmail } from "../../../../lib/sereja-activation";

const genericMessage = "If this email has an approved IdeaStore purchase, an access link will be sent.";

export async function POST(request: Request) {
  const requestOrigin = request.headers.get("origin");
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as { email?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 320) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    await requestMagicLinkForEmail(email);
    return NextResponse.json(
      { message: genericMessage },
      { status: 202, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { message: genericMessage },
      { status: 202, headers: { "Cache-Control": "no-store" } },
    );
  }
}
