"use client";

import { useEffect, useState, type RefObject } from "react";
import { Volume2, VolumeX } from "lucide-react";
import styles from "./background-music.module.css";

type BackgroundMusicProps = {
  audioRef: RefObject<HTMLAudioElement | null>;
  enabled: boolean;
};

export default function BackgroundMusic({ audioRef, enabled }: BackgroundMusicProps) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.5;
    return () => audio.pause();
  }, [audioRef]);

  async function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setPlaying(false);
      }
    } else {
      audio.pause();
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src="/music/musica-natal.mp3"
        preload="auto"
        loop
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {enabled && (
        <div className={styles.music}>
          <button
            className={styles.toggle}
            type="button"
            onClick={toggleMusic}
            aria-label={playing ? "Pausar música de Natal" : "Tocar música de Natal"}
            aria-pressed={playing}
          >
            {playing ? <Volume2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
            <span>{playing ? "Pausar música" : "Tocar música"}</span>
          </button>
        </div>
      )}
    </>
  );
}
