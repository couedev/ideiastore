import styles from "./atividades-promo-banner.module.css";

export default function AtividadesPromoBanner() {
  return (
    <section className={styles.banner} aria-label="Preço promocional de fim de ano">
      <p className={styles.title}>Aproveite o preço promocional de fim de ano</p>
      <p className={styles.note}>Por tempo limitado</p>
    </section>
  );
}
