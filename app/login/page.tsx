import type { Metadata } from "next";
import { Gift } from "lucide-react";
import LoginForm from "./login-form";
import styles from "./page.module.css";

export const instant = false;

export const metadata: Metadata = {
  title: "Entrar | Amigo Secreto Natalino",
  description: "Acesse sua conta do Amigo Secreto Natalino.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ acesso?: string }>;
}) {
  const { acesso } = await searchParams;

  return (
    <main className={styles.screen}>
      <section className={styles.phone} aria-labelledby="login-title">
        <div className={styles.glow} aria-hidden="true" />
        <header className={styles.header}>
          <a className={styles.brand} href="/login" aria-label="Amigo Secreto Natalino">
            <span className={styles.brandMark} aria-hidden="true"><Gift size={20} /></span>
            <span>Amigo Secreto</span>
          </a>
          <span className={styles.headerLabel}>ÁREA DE ACESSO</span>
        </header>

        <div className={styles.content}>
          <div className={styles.art} aria-hidden="true">
            <Gift className={styles.appIcon} />
          </div>

          <div className={styles.intro}>
            <p className={styles.eyebrow}>Amigo Secreto Natalino</p>
            <h1 id="login-title" className={styles.title}>Entre na sua conta</h1>
            <p className={styles.subtitle}>
              Acesse sua conta para continuar com a brincadeira de Natal.
            </p>
          </div>

          {acesso === "compra" && (
            <p className={styles.accessNotice} role="status">
              Não encontramos uma compra aprovada vinculada a esta conta. Se você acabou de comprar, aguarde alguns instantes e tente novamente.
            </p>
          )}
          {acesso === "verificar" && (
            <p className={styles.accessNotice} role="status">
              Não conseguimos validar seu acesso agora. Aguarde um momento e tente novamente.
            </p>
          )}

          <LoginForm />

          <p className={styles.footer}>Acesso do Amigo Secreto Natalino</p>
        </div>

        <div className={styles.bottomNote}>
          <span aria-hidden="true">✦</span> Uma surpresa especial espera por você
        </div>
      </section>
    </main>
  );
}
