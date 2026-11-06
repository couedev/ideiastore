"use client";

import { useRef } from "react";
import { CircleChevronLeft, CircleChevronRight, Image as ImageIcon } from "lucide-react";
import styles from "./depoimentos-carousel.module.css";

const depoimentos = [1, 2, 3];

export default function DepoimentosCarousel() {
  const viewportRef = useRef<HTMLDivElement>(null);

  const mover = (direcao: -1 | 1) => {
    const viewport = viewportRef.current;
    const primeiroCard = viewport?.querySelector<HTMLElement>("[data-depoimento]");

    if (!viewport || !primeiroCard) return;

    const gap = Number.parseFloat(getComputedStyle(viewport).columnGap) || 0;
    viewport.scrollBy({
      left: direcao * (primeiroCard.offsetWidth + gap),
      behavior: "smooth",
    });
  };

  return (
    <section className={styles.section} aria-labelledby="depoimentos-title">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>QUEM JÁ USA</p>
          <h2 className={styles.title} id="depoimentos-title">
            DEPOIMENTOS
          </h2>
          <p className={styles.description}>
            Histórias de clientes que já encontraram novas ideias para suas lojas.
          </p>
        </div>
        <div className={styles.controls}>
          <button
            className={styles.arrowButton}
            type="button"
            aria-label="Ver depoimento anterior"
            onClick={() => mover(-1)}
          >
            <CircleChevronLeft size={34} strokeWidth={1.7} />
          </button>
          <button
            className={styles.arrowButton}
            type="button"
            aria-label="Ver próximo depoimento"
            onClick={() => mover(1)}
          >
            <CircleChevronRight size={34} strokeWidth={1.7} />
          </button>
        </div>
      </div>

      <div
        className={styles.viewport}
        ref={viewportRef}
        role="region"
        aria-label="Carrossel de depoimentos"
      >
        {depoimentos.map((numero) => (
          <div
            className={styles.card}
            key={numero}
            data-depoimento
            role="img"
            aria-label={`Espaço para imagem do depoimento ${numero}`}
          >
            <ImageIcon size={32} strokeWidth={1.4} aria-hidden="true" />
          </div>
        ))}
      </div>
    </section>
  );
}
