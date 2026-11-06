"use client";

import { useRef } from "react";
import Image from "next/image";
import { CircleChevronLeft, CircleChevronRight, Image as ImageIcon } from "lucide-react";
import styles from "./depoimentos-carousel.module.css";
import depoimento01 from "../../public/depoimentos/depoimento 01.png";
import depoimento02 from "../../public/depoimentos/depoimento 02.png";
import depoimento03 from "../../public/depoimentos/depoimento 03.png";

const depoimentos = [
  {
    numero: 3,
    imagem: depoimento03,
    descricao: "Cliente conta que o app traz muitas ideias para postar e autoriza o uso do depoimento no site",
  },
  {
    numero: 2,
    imagem: depoimento02,
    descricao: "Cliente diz que acessar pelo celular é fácil e que as ideias ajudam a manter a loja ativa nas redes sociais",
  },
  {
    numero: 1,
    imagem: depoimento01,
    descricao: "Cliente conta que o Ideias Store é prático e oferece muitas ideias para publicar no fim do ano",
  },
];

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
        {depoimentos.map((depoimento) => (
          <div
            className={`${styles.card} ${depoimento.imagem ? styles.cardFilled : ""}`}
            key={depoimento.numero}
            data-depoimento
            role={depoimento.imagem ? undefined : "img"}
            aria-label={depoimento.imagem ? undefined : `Espaço para imagem do depoimento ${depoimento.numero}`}
          >
            {depoimento.imagem ? (
              <Image
                className={styles.testimonialImage}
                src={depoimento.imagem}
                alt={depoimento.descricao}
                fill
                sizes="(max-width: 600px) 72vw, 300px"
              />
            ) : (
              <ImageIcon size={32} strokeWidth={1.4} aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
