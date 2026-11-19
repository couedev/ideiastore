import type { Metadata } from "next";
import { Gift } from "lucide-react";
import MagicLinkCallback from "./magic-link-callback";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Acessando | Amigo Secreto Natalino",
  referrer: "no-referrer",
  description: "Validando seu link de acesso ao Amigo Secreto Natalino.",
};

export default function ActivatePage() {
  return (
    <main className={styles.screen}>
      <section className={styles.card}>
        <div className={styles.logo} aria-hidden="true"><Gift size={30} /></div>
        <p className={styles.eyebrow}>Acesso seguro</p>
        <h1 className={styles.title}>Abrindo sua conta</h1>
        <p className={styles.subtitle}>Estamos validando seu link de acesso.</p>
        <MagicLinkCallback />
      </section>
    </main>
  );
}
