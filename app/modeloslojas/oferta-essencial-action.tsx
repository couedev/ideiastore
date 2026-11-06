"use client";

import { useRef } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { checkoutLinks } from "./checkout-links";
import styles from "./page.module.css";

const beneficios = [
  "Tudo o que está no Essencial",
  "Vídeos para o Natal",
  "Reels para a Black Friday",
  "Reels para o fim de ano",
  "Novas ideias sem custo adicional",
];

export default function OfertaEssencialAction() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        className={styles.offerButton}
        type="button"
        onClick={() => dialogRef.current?.showModal()}
      >
        QUERO O ESSENCIAL
        <ArrowRight size={18} aria-hidden="true" />
      </button>

      <dialog
        className={styles.upsellDialog}
        ref={dialogRef}
        aria-labelledby="upsell-title"
        aria-describedby="upsell-description"
      >
        <div className={styles.upsellContent}>
          <button
            className={styles.upsellClose}
            type="button"
            aria-label="Fechar oferta"
            onClick={() => dialogRef.current?.close()}
          >
            <X size={19} />
          </button>

          <span className={styles.upsellBadge}>OFERTA ESPECIAL</span>
          <h2 className={styles.upsellTitle} id="upsell-title">
            Leve tudo do Completo por apenas <span>R$ 27</span>
          </h2>
          <p className={styles.upsellDescription} id="upsell-description">
            Aproveite todos os conteúdos do plano Completo por um valor especial.
          </p>

          <div className={styles.upsellPrice}>
            <span className={styles.upsellOldPrice}>R$ 37,00</span>
            <strong>R$ 27,00</strong>
          </div>
          <p className={styles.upsellDiscount}>Você economiza R$ 10 · 27% de desconto</p>

          <ul className={styles.upsellFeatures}>
            {beneficios.map((beneficio) => (
              <li key={beneficio}>
                <Check size={17} strokeWidth={2.6} aria-hidden="true" />
                <span>{beneficio}</span>
              </li>
            ))}
          </ul>

          <div className={styles.upsellActions}>
            <a className={styles.upsellPrimary} href={checkoutLinks.completoPromocional}>
              QUERO ESSA OFERTA
            </a>
            <a className={styles.upsellSecondary} href={checkoutLinks.essencial}>
              QUERO A BÁSICA MESMO
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}
