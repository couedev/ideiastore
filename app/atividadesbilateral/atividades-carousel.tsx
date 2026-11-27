import Image from "next/image";
import styles from "./atividades-carousel.module.css";
import AtividadesPersonalizedTitle from "./atividades-personalized-title";

const worksheetImages = [
  { src: "/primeiro-carrossel/01_abra_e_feche.webp", alt: "Atividade bilateral: Abra e feche" },
  { src: "/primeiro-carrossel/02_palma_e_polegar.webp", alt: "Atividade bilateral: Palma e polegar" },
  { src: "/primeiro-carrossel/03_punho_e_dois_dedos.webp", alt: "Atividade bilateral: Punho e dois dedos" },
  { src: "/primeiro-carrossel/04_tres_gestos_em_dupla.webp", alt: "Atividade bilateral: Três gestos em dupla" },
  { src: "/primeiro-carrossel/05_quatro_gestos_em_dupla.webp", alt: "Atividade bilateral: Quatro gestos em dupla" },
  { src: "/primeiro-carrossel/06_caminho_dos_gestos.webp", alt: "Atividade bilateral: Caminho dos gestos" },
  { src: "/primeiro-carrossel/07_caminho_alternado.webp", alt: "Atividade bilateral: Caminho alternado" },
  { src: "/primeiro-carrossel/08_cores_na_ponta_dos_dedos.webp", alt: "Atividade bilateral: Cores na ponta dos dedos" },
  { src: "/primeiro-carrossel/09_dedos_diferentes.webp", alt: "Atividade bilateral: Dedos diferentes" },
  { src: "/primeiro-carrossel/10_uma_legenda_em_cada_mao.webp", alt: "Atividade bilateral: Uma legenda em cada mão" },
];
const varietyImages = [
  "/segundo-carrossel/06d0acc7fe958a55f8110b6149fcff9f.jpg",
  "/segundo-carrossel/1fffd3be61a6ee93a1307a9b98844116.jpg",
  "/segundo-carrossel/217ce29d75065a3eb821451c1ec1c667.jpg",
  "/segundo-carrossel/4f15e9246bd758592d9e433c6b127389.jpg",
  "/segundo-carrossel/53c1c0ba863eba83617e39944a94ec91.jpg",
  "/segundo-carrossel/7e3d6a8a0c7a99217b7027ceb314563d.jpg",
  "/segundo-carrossel/a333e4da40fc59c63153cc195f5405f7.jpg",
  "/segundo-carrossel/download (2).png",
  "/segundo-carrossel/download (3).png",
];

export default function AtividadesCarousel() {
  return (
    <section className={styles.section} aria-labelledby="sheets-title">
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Conheça o material</p>
        <h2 id="sheets-title">Veja as folhas <span>que você vai receber</span> na prática!</h2>
      </div>

      <div className={styles.carouselWindow} role="region" aria-label="Prévia das folhas de atividades bilaterais">
        <div className={styles.carouselTrack}>
          {[0, 1].map((copyIndex) => (
            <div className={styles.carouselGroup} key={copyIndex} aria-hidden={copyIndex === 1}>
              {worksheetImages.map(({ src, alt }) => (
                <div className={styles.mainImageFrame} key={src}>
                  <Image className={styles.mainImage} src={src} alt={alt} fill sizes="(max-width: 540px) 215px, (max-width: 1200px) 22vw, 270px" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.readyBlock} aria-labelledby="ready-title">
        <p className={styles.readyEyebrow}>Fácil de colocar em prática</p>
        <h3 id="ready-title">Todas as atividades já vêm prontas para usar</h3>
        <ol className={styles.readySteps}>
          <li><span>01</span><strong>Escolha a atividade</strong></li>
          <li><span>02</span><strong>Imprima a folha</strong></li>
          <li>
            <span>03</span>
            <div><strong>Pratique com a pessoa idosa</strong><small>Estimule movimento, atenção e coordenação juntos.</small></div>
          </li>
        </ol>
      </div>

      <div className={styles.varietySection} aria-labelledby="variety-title">
        <div className={styles.varietyIntro}>
          <h3 id="variety-title"><AtividadesPersonalizedTitle /></h3>
        </div>
        <div className={styles.varietyWindow} role="region" aria-label="Carrossel de imagens com variedade de exercícios">
          <div className={styles.varietyTrack}>
            {[0, 1].map((copyIndex) => (
              <div className={styles.varietyGroup} key={copyIndex} aria-hidden={copyIndex === 1}>
                {varietyImages.map((src) => (
                  <div className={styles.mainImageFrame} key={src}>
                    <Image className={styles.mainImage} src={src} alt="Exemplo de atividade bilateral" fill sizes="(max-width: 540px) 215px, (max-width: 1200px) 22vw, 270px" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
