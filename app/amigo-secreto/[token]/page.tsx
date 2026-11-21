import type { Metadata } from "next";
import InvitePreview from "./invite-preview";

export const metadata: Metadata = {
  title: "Seu convite | Amigo Secreto Natalino",
  description: "Abra seu convite individual para o Amigo Secreto Natalino.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function AmigoSecretoConvitePage({ params }: PageProps<"/amigo-secreto/[token]">) {
  const { token } = await params;
  return <InvitePreview token={token} />;
}
