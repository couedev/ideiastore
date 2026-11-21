"use client";

import { useEffect, useState } from "react";
import { CandyCane, Gift } from "lucide-react";

export default function InvitePreview({ token }: { token: string }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void fetch(`/api/amigo-secreto/convite/${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok || typeof data?.name !== "string") throw new Error(data?.error || "Convite indisponível.");
        if (active) setName(data.name);
      })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Convite indisponível."); });
    return () => { active = false; };
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F5EA] px-5 py-10 text-[#15362C]">
      <section className="w-full max-w-md rounded-[2rem] border border-[#15362C]/10 bg-white p-8 text-center shadow-[0_24px_80px_rgba(21,54,44,0.10)] sm:p-10">
        <span className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-[#15362C] text-[#F8F5EA]"><Gift size={31} aria-hidden="true" /></span>
        <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#721218]"><CandyCane size={15} aria-hidden="true" /> Convite individual</p>
        {error ? <><h1 className="text-2xl font-bold">Não encontramos este convite</h1><p className="mt-3 text-sm leading-6 text-[#15362C]/70" role="alert">{error} Peça um novo link ao organizador.</p></> : name ? <><h1 className="text-3xl font-bold tracking-tight">{name}, seu Amigo Secreto está chegando!</h1><p className="mt-4 text-sm leading-6 text-[#15362C]/70">Seu link está pronto. Em breve, você poderá raspar esta tela para descobrir quem tirou.</p></> : <p className="text-sm text-[#15362C]/70">Abrindo seu convite...</p>}
      </section>
    </main>
  );
}
