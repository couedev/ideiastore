import type { Metadata } from "next";
import Image from "next/image";
import MagicLinkCallback from "./magic-link-callback";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Acessando o aplicativo | IdeaStore",
  referrer: "no-referrer",
  description: "Validando seu link de acesso à IdeaStore.",
};

export default function ActivatePage() {
  return (
    <main className={styles.screen}>
      <section className={styles.card}>
        <Image
          src="/icon/icon-storeideias-192.png"
          alt="IdeaStore"
          width={58}
          height={58}
          priority
          className={styles.logo}
        />
        <p className={styles.eyebrow}>Acesso seguro</p>
        <h1 className={styles.title}>Abrindo seu aplicativo</h1>
        <p className={styles.subtitle}>Estamos validando seu link de acesso.</p>
        <MagicLinkCallback />
      </section>
    </main>
  );
}
