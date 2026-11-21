"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, TicketPercent, X } from "lucide-react";
import styles from "./coupon-popup.module.css";

type CouponPopupProps = {
  open: boolean;
  onApply: () => void;
  onClose: () => void;
};

export default function CouponPopup({ open, onApply, onClose }: CouponPopupProps) {
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
      aria-labelledby="coupon-title"
      aria-describedby="coupon-description"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
    >
      <div className={styles.top}>
        <span className={styles.icon}><TicketPercent size={27} aria-hidden="true" /></span>
        <button className={styles.close} type="button" onClick={onClose} aria-label="Fechar cupom">
          <X size={20} aria-hidden="true" />
        </button>
        <p>CUPOM ESPECIAL</p>
        <h2 id="coupon-title">Black Friday para o seu Natal</h2>
      </div>
      <div className={styles.body}>
        <p id="coupon-description">Ative o cupom e prepare seu Amigo Secreto Natalino por um preço especial.</p>
        <div className={styles.prices}>
          <span>R$ 39,90</span>
          <ArrowRight size={20} aria-hidden="true" />
          <strong>R$ 17,00</strong>
        </div>
        <button className={styles.apply} type="button" onClick={onApply}>
          APLICAR CUPOM BLACK FRIDAY <ArrowRight size={18} aria-hidden="true" />
        </button>
        <button className={styles.later} type="button" onClick={onClose}>Agora não</button>
      </div>
    </dialog>
  );
}
