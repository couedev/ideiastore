
import { Montserrat } from "next/font/google";
import styles from "./page.module.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

function SparkleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const reelIdeas = [
  {
    label: "NOVIDADE NA LOJA",
    title: "Mostre a peça que acabou de chegar",
  },
  {
    label: "DICA RÁPIDA",
    title: "Três formas de usar o mesmo produto",
  },
  {
    label: "BASTIDORES",
    title: "Prepare um pedido junto com a cliente",
  },
  {
    label: "VITRINE DA SEMANA",
    title: "Destaque seus favoritos para a estação",
  },
  {
    label: "COMBINAÇÃO PERFEITA",
    title: "Monte um look completo com peças da loja",
  },
];

export default function ModelosLojasPage() {
  return (
    <main className={`${styles.page} ${montserrat.className}`}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.ambientGlow} aria-hidden="true" />

        <div className={styles.container}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowIcon}>
              <SparkleIcon size={14} />
            </span>
            IDEIAS PRONTAS PARA SUA LOJA
          </div>

          <h1 className={styles.headline} id="hero-title">
            Mais de <span className={styles.gradientText}>100 ideias</span>{" "}
            de Reels para sua loja{" "}
            <span className={styles.gradientText}>
              vender mais no fim de ano.
            </span>
          </h1>

          <p className={styles.description}>
            Você não precisa perder tempo pensando no que postar! Tenha ideias de Reels prontas para criar conteúdos todos os dias e <strong>aproveitar as vendas de fim de ano.</strong>
          </p>

          <div className={styles.mediaWrapper}>
            <div className={styles.mediaGlow} aria-hidden="true" />

            <div className={styles.mediaFrame}>
              <div className={styles.mediaPlaceholder}>
                <div className={styles.playSymbol} aria-hidden="true">
                  <svg
                    width="29"
                    height="29"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                  </svg>
                </div>
                <span>Seu vídeo ou imagem aqui</span>
              </div>
            </div>

            <span className={styles.floatingSparkle} aria-hidden="true">
              <SparkleIcon size={27} />
            </span>
          </div>

          <div className={styles.actionArea}>
            <button className={styles.cta} type="button">
              <span>EU QUERO!</span>
              <ArrowIcon />
            </button>

            <p className={styles.ctaCaption}>
              <SparkleIcon size={13} />
              Inspire-se, crie e destaque sua loja!
            </p>
          </div>
        </div>
      </section>

      <section className={styles.accessSection} aria-labelledby="access-title">
        <div className={styles.accessHeader}>
          <p className={styles.accessEyebrow}>SEU CONTEÚDO, SEM COMPLICAÇÃO</p>
          <h2 className={styles.accessTitle} id="access-title">
            IDEIAS PRA VOCÊ ACESSAR COM UM{" "}
            <span className={styles.gradientText}>ÚNICO CLIQUE!</span>
          </h2>
          <p className={styles.accessDescription}>
            Não é um curso chato que voce compra e nunca mais ver. O Ideias Story fica
            a um clique,<strong > na tela do seu celular como um app.</strong>
          </p>
        </div>

        <div
          className={styles.carouselViewport}
          role="region"
          aria-label="Exemplos de ideias de Reels"
        >
          <div className={styles.carouselTrack}>
            <div className={styles.carouselGroup} role="list">
              {reelIdeas.map((idea, index) => (
                <article className={styles.ideaCard} key={idea.label} role="listitem">
                  <span className={styles.ideaNumber}>
                    IDEIA {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.ideaLabel}>{idea.label}</span>
                  <h3 className={styles.ideaTitle}>{idea.title}</h3>
                  <span className={styles.ideaAccent} aria-hidden="true" />
                </article>
              ))}
            </div>

            <div className={styles.carouselGroup} aria-hidden="true">
              {reelIdeas.map((idea, index) => (
                <article className={styles.ideaCard} key={`repeat-${idea.label}`}>
                  <span className={styles.ideaNumber}>
                    IDEIA {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.ideaLabel}>{idea.label}</span>
                  <h3 className={styles.ideaTitle}>{idea.title}</h3>
                  <span className={styles.ideaAccent} />
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
