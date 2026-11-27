import { Check } from "lucide-react";
import styles from "./atividades-audience.module.css";

const goals = [
  "Apoiar a coordenação motora com movimentos bilaterais",
  "Estimular o cérebro com desafios de atenção",
  "Ter mais de 100 folhas prontas para imprimir",
  "Praticar junto, respeitando o ritmo da pessoa idosa",
  "Variar as atividades de movimento no dia a dia",
];

export default function AtividadesAudience() {
  return (
    <section className={styles.section} aria-labelledby="audience-title">
      <div className={styles.content}>
        <h2 id="audience-title">Este material é ideal para você que deseja:</h2>
        <ul className={styles.grid}>
          {goals.map((goal) => (
            <li className={styles.card} key={goal}>
              <span className={styles.check}><Check size={16} strokeWidth={3} aria-hidden="true" /></span>
              <span>{goal}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
