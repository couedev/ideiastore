"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import styles from "./exit-offer-popup.module.css";

const checkoutUrl = "https://pay.sereja.com.br/checkout/KYaHLU_M?p=oferta10";

export default function ExitOfferPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [confettiSize, setConfettiSize] = useState({ width: 0, height: 0 });
  const shownRef = useRef(false);
  const allowExitRef = useRef(false);

  const openOffer = useCallback(() => {
    if (shownRef.current) return;
    shownRef.current = true;
    setIsOpen(true);
  }, []);

  useEffect(() => {
    window.history.pushState({ exitOfferGuard: true }, "", window.location.href);

    const handleBack = () => {
      if (allowExitRef.current) return;
      openOffer();
      window.history.pushState({ exitOfferGuard: true }, "", window.location.href);
    };

    const handleExitIntent = (event: MouseEvent) => {
      if (event.clientY <= 0 && event.relatedTarget === null) openOffer();
    };

    window.addEventListener("popstate", handleBack);
    document.addEventListener("mouseout", handleExitIntent);

    return () => {
      window.removeEventListener("popstate", handleBack);
      document.removeEventListener("mouseout", handleExitIntent);
    };
  }, [openOffer]);

  useEffect(() => {
    if (!isOpen) return;

    const updateSize = () =>
      setConfettiSize({ width: window.innerWidth, height: window.innerHeight });

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [isOpen]);

  const leavePage = () => {
    allowExitRef.current = true;
    if (window.history.length > 2) {
      window.history.go(-2);
    } else {
      window.location.assign("/");
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop}>
      <Confetti
        className={styles.confetti}
        width={confettiSize.width}
        height={confettiSize.height}
        numberOfPieces={180}
        recycle={false}
        gravity={0.22}
      />
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-offer-title"
        aria-describedby="exit-offer-description"
      >
        <span className={styles.eyebrow}>UMA OFERTA ESPECIAL PARA VOCÊ</span>
        <h2 className={styles.title} id="exit-offer-title">
          Espere! Temos uma oferta de Black Friday para você
        </h2>
        <p className={styles.description} id="exit-offer-description">
          Não fique sem ideias para este fim de ano. Leve tudo por apenas
          <strong> R$ 10,00</strong> em uma oferta imperdível.
        </p>
        <a className={styles.acceptButton} href={checkoutUrl}>
          QUERO APROVEITAR POR R$ 10
        </a>
        <button className={styles.leaveButton} type="button" onClick={leavePage}>
          Não, obrigada. Quero sair
        </button>
      </section>
    </div>
  );
}
