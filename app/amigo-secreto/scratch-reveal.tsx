"use client";

import { useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import ScratchDemo from "../secretonatalino/scratch-demo";

export default function ScratchReveal({ recipient }: { recipient: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const musicStarted = useRef(false);
  const [musicNeedsTap, setMusicNeedsTap] = useState(false);

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

  return (
    <div className="flex w-full flex-col items-center">
      <audio ref={audioRef} src="/music/musica-natal.mp3" preload="auto" />
      <ScratchDemo name={recipient} onReveal={playMusicOnce} demoOnly={false} />
      {musicNeedsTap && (
        <button type="button" onClick={playMusicOnce} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#15362C]/20 bg-white px-5 text-sm font-semibold text-[#15362C]">
          <Volume2 size={17} aria-hidden="true" /> Tocar música de Natal
        </button>
      )}
    </div>
  );
}
