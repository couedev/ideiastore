import Image from "next/image";
import { Check } from "lucide-react";
import styles from "./atividades-included.module.css";

const includedItems = [
  "Mais de 100 folhas de atividades bilaterais para pessoas idosas.",
  "Exercícios que envolvem movimento, atenção e coordenação.",
  "Atividades prontas para imprimir e praticar no ritmo da pessoa idosa.",
  "4 bônus: gestos com as mãos, sequências de cores, caminhos e formas, coordenação dos dedos.",
];

export default function AtividadesIncluded() {
  return (
    <section className={styles.section} aria-labelledby="included-title">
      <div className={styles.content}>
        <h2 id="included-title">Tudo o que você vai receber</h2>
        <div className={styles.materialCard}>
          <div className={styles.imageWrap}>
            <Image
              className={styles.image}
              src="/mockup-idoso.webp"
              alt="Mockup com mais de 100 atividades bilaterais para pessoas idosas e quatro materiais bônus"
              width={1280}
              height={1280}
              sizes="(max-width: 760px) 100vw, 520px"
            />
          </div>
          <ul className={styles.list}>
            {includedItems.map((item) => (
              <li key={item}>
                <span className={styles.check}><Check size={16} strokeWidth={3} aria-hidden="true" /></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
