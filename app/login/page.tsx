import type { Metadata } from "next";
import Image from "next/image";
import LoginForm from "./login-form";
import styles from "./page.module.css";

export const instant = false;

export const metadata: Metadata = {
  title: "Entrar | Ideias Store",
  description: "Entre na sua conta Ideias Store para acessar suas inspirações.",
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
          <a className={styles.brand} href="/" aria-label="Ideias Store, página inicial">
            <Image
              src="/icon/icon-storeideias-192.png"
              alt=""
              width={40}
              height={40}
              priority
              className={styles.brandImage}
            />
            <span>ideastore</span>
          </a>
          <span className={styles.headerLabel}>ÁREA DE ACESSO</span>
        </header>

        <div className={styles.content}>
          <div className={styles.art}>
            <Image
              src="/icon/icon-storeideias-512.png"
              alt="Ícone da Ideias Store"
              width={160}
              height={160}
              priority
              className={styles.appIcon}
            />
          </div>

          <div className={styles.intro}>
            <p className={styles.eyebrow}>Que bom ter você aqui</p>
            <h1 id="login-title" className={styles.title}>Entre na sua conta</h1>
            <p className={styles.subtitle}>
              Acesse suas ideias e continue inspirando sua loja.
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

          <p className={styles.footer}>
            Ainda não tem acesso? <a href="/#ofertas">Conheça a Ideias Store</a>
          </p>
        </div>

        <div className={styles.bottomNote}>
          <span aria-hidden="true">✦</span> Seu próximo conteúdo começa aqui
        </div>
      </section>
    </main>
  );
}
