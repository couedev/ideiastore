import type { Metadata } from "next";
import Image from "next/image";
import ActivationForm from "./activation-form";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Ative sua conta | IdeaStore",
  description: "Defina uma senha para ativar seu acesso à IdeaStore.",
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
        <p className={styles.eyebrow}>Seu acesso está quase pronto</p>
        <h1 className={styles.title}>Crie sua senha</h1>
        <p className={styles.subtitle}>Escolha uma senha segura para acessar suas inspirações.</p>
        <ActivationForm />
      </section>
    </main>
  );
}
