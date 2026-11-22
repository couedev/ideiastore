"use client";

import { useEffect, useRef, useState } from "react";
import { CandyCane, Gift, RefreshCw, Volume2 } from "lucide-react";
import ScratchDemo from "../../secretonatalino/scratch-demo";

type Invite = { name: string; recipient: string; budget: string };

export default function InvitePreview({ token }: { token: string }) {
  const [invite, setInvite] = useState<Invite | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const [musicNeedsTap, setMusicNeedsTap] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const musicStarted = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/amigo-secreto/convite/${encodeURIComponent(token)}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok || typeof data?.name !== "string" || typeof data?.recipient !== "string" || typeof data?.budget !== "string") {
          throw new Error(data?.error || "Convite indisponível.");
        }
        if (!controller.signal.aborted) setInvite(data as Invite);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Convite indisponível.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [token, retry]);

  function playMusicOnce() {
    const audio = audioRef.current;
    if (!audio || musicStarted.current) return;
    audio.volume = 0.5;
    audio.currentTime = 0;
    void audio.play()
      .then(() => {
        musicStarted.current = true;
        setMusicNeedsTap(false);
      })
      .catch(() => setMusicNeedsTap(true));
  }

  function tryAgain() {
    setError("");
    setLoading(true);
    setRetry((current) => current + 1);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F8F5EA] px-4 py-10 text-[#15362C] sm:px-6">
      <audio ref={audioRef} src="/music/musica-natal.mp3" preload="auto" />
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

        {!loading && invite && (
          <>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{invite.name}, chegou a hora da surpresa!</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#15362C]/75">Raspe o cartão para descobrir quem você tirou no Amigo Secreto Natalino.</p>
            {invite.budget && <p className="mt-3 text-sm font-semibold text-[#721218]">Valor combinado para o presente: {invite.budget}</p>}
            <div className="mx-auto mt-7 w-full max-w-[420px]">
              <ScratchDemo name={invite.recipient} onReveal={playMusicOnce} demoOnly={false} />
            </div>
            {musicNeedsTap && (
              <button type="button" onClick={playMusicOnce} className="mx-auto mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#15362C]/20 bg-white px-5 text-sm font-semibold text-[#15362C]">
                <Volume2 size={17} aria-hidden="true" /> Tocar música de Natal
              </button>
            )}
            <p className="mt-6 text-xs leading-5 text-[#15362C]/60">Guarde a surpresa até a troca de presentes!</p>
          </>
        )}
      </div>
    </main>
  );
}
