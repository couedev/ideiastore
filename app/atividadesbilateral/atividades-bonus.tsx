import Image from "next/image";
import styles from "./atividades-bonus.module.css";

const bonuses = [
  {
    title: "Gestos com as mãos",
    description: "Propostas para praticar gestos e movimentos com as mãos.",
    image: "/bonus gestos com as maos.webp",
  },
  {
    title: "Sequências de cores",
    description: "Atividades para observar e acompanhar sequências coloridas.",
    image: "/bonus sequencias de cores.webp",
  },
  {
    title: "Caminhos e formas",
    description: "Desafios visuais com percursos, cores e diferentes formas.",
    image: "/bonus caminhos e formas.webp",
  },
  {
    title: "Coordenação dos dedos",
    description: "Exercícios para movimentar os dedos com atenção e coordenação.",
    image: "/bonus-coordenacao dos dedos.webp",
  },
];

export default function AtividadesBonus() {
  return (
    <section className={styles.section} aria-labelledby="bonus-title">
      <div className={styles.content}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Conteúdo extra incluído</p>
          <h2 id="bonus-title">E não para por aí... tem mais!</h2>
          <p>Você também vai receber <strong>4 bônus exclusivos</strong></p>
        </div>

        <div className={styles.grid}>
          {bonuses.map(({ title, description, image }, index) => (
            <article className={styles.card} key={title}>
              <div className={styles.imageWrap}>
                <Image
                  className={styles.bonusImage}
                  src={image}
                  alt={`Capa do bônus: ${title}`}
                  fill
                  sizes="(max-width: 540px) 100vw, (max-width: 900px) 50vw, 25vw"
                />
              </div>
              <p className={styles.cardEyebrow}>Bônus {String(index + 1).padStart(2, "0")}</p>
              <h3>{title}</h3>
              <p className={styles.description}>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
