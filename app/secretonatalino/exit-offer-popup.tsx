"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, CandyCane, Check, Gift } from "lucide-react";
import styles from "./exit-offer-popup.module.css";

type ExitOfferPopupProps = {
  open: boolean;
  name?: string;
  busy: boolean;
  error: string;
  onAccept: () => void;
  onDecline: () => void;
};

export default function ExitOfferPopup({ open, name, busy, error, onAccept, onDecline }: ExitOfferPopupProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="exit-offer-title"
      aria-describedby="exit-offer-description"
      onCancel={(event) => {
        event.preventDefault();
        onDecline();
      }}
    >
      <div className={styles.top}>
        <span className={styles.icon}><CandyCane size={28} aria-hidden="true" /></span>
        <p className={styles.eyebrow}>UMA ÚLTIMA SURPRESA PARA VOCÊ</p>
        <h2 id="exit-offer-title">Espere{name ? `, ${name}` : ""}! Sua brincadeira de Natal já está pronta.</h2>
        <p id="exit-offer-description" className={styles.description}>Seu grupo já está montado. Que tal garantir tudo agora e surpreender seus amigos e sua família?</p>
      </div>
      <div className={styles.body}>
        <div className={styles.price}>
          <span>Oferta especial para você</span>
          <strong><small>R$</small> 10,00</strong>
          <p>Pagamento único <span aria-hidden="true">·</span> Acesso vitalício</p>
        </div>
        <button className={`${styles.accept} natal-shinne`} type="button" onClick={onAccept} disabled={busy}>
          <Gift size={19} aria-hidden="true" /> {busy ? "PREPARANDO CHECKOUT..." : "QUERO OFERTA ESPECIAL"} <ArrowRight size={18} aria-hidden="true" />
        </button>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <p className={styles.guarantee}><Check size={15} aria-hidden="true" /> 7 dias de garantia</p>
        <button className={styles.decline} type="button" onClick={onDecline}>Não quero essa oferta</button>
      </div>
    </dialog>
  );
}
