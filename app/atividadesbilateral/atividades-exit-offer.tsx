"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Gift } from "lucide-react";
import styles from "./atividades-exit-offer.module.css";

const checkoutUrl = "https://pay.sereja.com.br/checkout/I7SjaCSW?p=promo5";

export default function AtividadesExitOffer() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const guardKey = "__atividadesBilateralExitGuard";

    if (!window.history.state?.[guardKey]) {
      window.history.pushState({ ...window.history.state, [guardKey]: true }, "", window.location.href);
    }

    function handleBack(event: PopStateEvent) {
      if (!/^\/atividadesbilateral\/?$/.test(window.location.pathname) || event.state?.[guardKey]) return;
      setOpen(true);
    }

    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function declineOffer() {
    setOpen(false);
    if (window.history.length > 2) {
      router.back();
    } else {
      router.replace("/");
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="activities-exit-title"
      aria-describedby="activities-exit-description"
      onCancel={(event) => {
        event.preventDefault();
        declineOffer();
      }}
    >
      <div className={styles.top}>
        <span className={styles.icon}><Gift size={28} aria-hidden="true" /></span>
        <p className={styles.eyebrow}>Oferta especial de Black Friday</p>
        <h2 id="activities-exit-title">Essa é sua última chance!</h2>
        <p id="activities-exit-description" className={styles.description}>
          Não queremos que você fique sem as atividades. Aproveite esta condição especial para levar o Plano Completo.
        </p>
      </div>
      <div className={styles.body}>
        <div className={styles.price}>
          <span>Plano completo</span>
          <strong><small>R$</small> 5,00</strong>
          <p>Pagamento único <span aria-hidden="true">·</span> Acesso vitalício</p>
        </div>
        <a className={styles.accept} href={checkoutUrl}>
          <Gift size={18} aria-hidden="true" /> Quero essa oferta! <ArrowRight size={18} aria-hidden="true" />
        </a>
        <p className={styles.guarantee}><Check size={15} aria-hidden="true" /> 7 dias de garantia</p>
        <button className={styles.decline} type="button" onClick={declineOffer}>Recusar oferta</button>
      </div>
    </dialog>
  );
}
