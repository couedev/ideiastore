import type { Metadata } from "next";
import { Suspense } from "react";
import InvitePreview from "./invite-preview";

export const metadata: Metadata = {
  title: "Seu convite | Amigo Secreto Natalino",
  description: "Abra seu convite individual para o Amigo Secreto Natalino.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

async function InviteContent({ params }: { params: PageProps<"/amigo-secreto/[token]">["params"] }) {
  const { token } = await params;
  return <InvitePreview token={token} />;
}

export default function AmigoSecretoConvitePage({ params }: PageProps<"/amigo-secreto/[token]">) {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[#F8F5EA] px-5 text-[#15362C]">Abrindo seu convite...</main>}>
      <InviteContent params={params} />
    </Suspense>
  );
}
