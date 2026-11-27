import Image from "next/image";
import Link from "next/link";
import carouselStyles from "./atividades-carousel.module.css";
import styles from "./atividades-next-section.module.css";

const previewImages = [
  { src: "/carrossel-3/01_pinte_como_no_modelo.webp", alt: "Atividade de 2027: Pinte como no modelo" },
  { src: "/carrossel-3/02_quadrados_em_cores.webp", alt: "Atividade de 2027: Quadrados em cores" },
  { src: "/carrossel-3/03_figuras_em_blocos.webp", alt: "Atividade de 2027: Figuras em blocos" },
  { src: "/carrossel-3/04_mosaicos_para_pintar.webp", alt: "Atividade de 2027: Mosaicos para pintar" },
  { src: "/carrossel-3/05_combine_as_cartelas.webp", alt: "Atividade de 2027: Combine as cartelas" },
  { src: "/carrossel-3/06_encontre_a_cartela_certa.webp", alt: "Atividade de 2027: Encontre a cartela certa" },
  { src: "/carrossel-3/07_cores_e_numeros.webp", alt: "Atividade de 2027: Cores e números" },
  { src: "/carrossel-3/08_mosaico_de_circulos.webp", alt: "Atividade de 2027: Mosaico de círculos" },
  { src: "/carrossel-3/09_mosaico_de_quadrados.webp", alt: "Atividade de 2027: Mosaico de quadrados" },
  { src: "/carrossel-3/10_desenho_com_pecas.webp", alt: "Atividade de 2027: Desenho com peças" },
];

export default function AtividadesNextSection() {
  return (
    <>
      <section className={styles.messageSection} aria-labelledby="message-title">
        <div className={styles.messageCard}>
          <p className={styles.eyebrow}>Cada movimento conta</p>
          <h2 id="message-title">A dificuldade motora não precisa impedir novos momentos de conexão.</h2>
          <p className={styles.messageCopy}>
            Acompanhe a pessoa idosa no ritmo dela e transforme cada atividade em um momento de estímulo e presença.
          </p>
          <Link className={styles.cta} href="/atividadesbilateral#oferta">Quero os exercícios agora</Link>
        </div>
      </section>

      <section className={styles.previewSection} aria-labelledby="new-activities-title">
        <div className={styles.previewIntro}>
          <p className={styles.eyebrow}>Mais possibilidades para praticar</p>
          <h2 id="new-activities-title">Novas atividades para 2027</h2>
        </div>
        <div className={carouselStyles.carouselWindow} role="region" aria-label="Prévia das novas atividades para 2027">
          <div className={carouselStyles.carouselTrack}>
            {[0, 1].map((copyIndex) => (
              <div className={carouselStyles.carouselGroup} key={copyIndex} aria-hidden={copyIndex === 1}>
                {previewImages.map(({ src, alt }) => (
                  <div className={carouselStyles.mainImageFrame} key={src}>
                    <Image className={carouselStyles.mainImage} src={src} alt={alt} fill sizes="(max-width: 540px) 215px, (max-width: 1200px) 22vw, 270px" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
