"use client";

import { useEffect, useState } from "react";
import { CandyCane, Check, Copy, Gift, RefreshCw } from "lucide-react";
import ScratchReveal from "../scratch-reveal";

type Invite = { blocked: true; name: string } | { blocked: false; name: string; recipient: string; budget: string };

export default function InvitePreview({ token }: { token: string }) {
  const [invite, setInvite] = useState<Invite | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const [copied, setCopied] = useState(false);
  const [manualLink, setManualLink] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/amigo-secreto/convite/${encodeURIComponent(token)}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok || typeof data?.name !== "string") {
          throw new Error(data?.error || "Convite indisponível.");
        }
        if (data.blocked === true) {
          if (!controller.signal.aborted) setInvite({ blocked: true, name: data.name });
          return;
        }
        if (typeof data.recipient !== "string" || typeof data.budget !== "string") {
          throw new Error("Convite indisponível.");
        }
        if (!controller.signal.aborted) setInvite({ blocked: false, name: data.name, recipient: data.recipient, budget: data.budget });
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Convite indisponível.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [token, retry]);

  async function copyInvitation() {
    const link = window.location.href;
    setCopied(false);
    setManualLink("");
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setManualLink(link);
    }
  }

  function tryAgain() {
    setError("");
    setInvite(null);
    setLoading(true);
    setRetry((current) => current + 1);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F8F5EA] px-4 py-10 text-[#15362C] sm:px-6">
      <div className="w-full max-w-lg text-center">
        <span className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-[#15362C] text-[#F8F5EA]"><Gift size={28} aria-hidden="true" /></span>
        <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#721218]"><CandyCane size={15} aria-hidden="true" /> Amigo Secreto Natalino</p>

        {loading && <p className="mt-5 text-sm text-[#15362C]/70" role="status">Abrindo seu convite...</p>}

        {!loading && error && (
          <div role="alert">
            <h1 className="text-2xl font-bold">Não conseguimos abrir seu convite</h1>
            <p className="mt-3 text-sm leading-6 text-[#15362C]/70">{error} Confira o link enviado pelo organizador.</p>
            <button type="button" onClick={tryAgain} className="mx-auto mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#15362C] px-5 font-semibold text-white"><RefreshCw size={16} aria-hidden="true" /> Tentar novamente</button>
          </div>
        )}

        {!loading && invite?.blocked && (
          <>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Apenas {invite.name} pode ver quem tirou no Amigo Secreto Natalino!</h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#15362C]/75">Este convite é individual. Envie o link para {invite.name} abrir e raspar o próprio cartão.</p>
            <button type="button" onClick={() => void copyInvitation()} className="mx-auto mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#15362C] px-6 text-sm font-bold text-white">
              {copied ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
              {copied ? "Link copiado!" : `Copiar link para ${invite.name}`}
            </button>
            {manualLink && (
              <div className="mt-5 text-left">
                <label htmlFor="participant-invite-link" className="mb-2 block text-xs font-semibold">Copie o link manualmente:</label>
                <input id="participant-invite-link" value={manualLink} readOnly onFocus={(event) => event.target.select()} className="w-full rounded-xl border border-[#15362C]/20 bg-white px-3 py-3 text-xs text-[#15362C]" />
              </div>
            )}
          </>
        )}

        {!loading && invite && !invite.blocked && (
          <>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{invite.name}, chegou a hora da surpresa!</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#15362C]/75">Raspe o cartão para descobrir quem você tirou no Amigo Secreto Natalino.</p>
            {invite.budget && <p className="mt-3 text-sm font-semibold text-[#721218]">Valor combinado para o presente: {invite.budget}</p>}
            <div className="mx-auto mt-7 w-full max-w-[420px]">
              <ScratchReveal recipient={invite.recipient} />
            </div>
            <p className="mt-6 text-xs leading-5 text-[#15362C]/60">Guarde a surpresa até a troca de presentes!</p>
          </>
        )}
      </div>
    </main>
  );
}
