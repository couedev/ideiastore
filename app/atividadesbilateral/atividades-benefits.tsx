import { ArrowLeftRight, BadgeCheck, Brain, Printer } from "lucide-react";
import styles from "./atividades-benefits.module.css";

const benefits = [
  {
    icon: Printer,
    title: "Prontas para imprimir",
    description: "Mais de 100 folhas com atividades para imprimir e usar com facilidade.",
  },
  {
    icon: ArrowLeftRight,
    title: "Coordenação bilateral estimulada",
    description: "Propostas que envolvem os dois lados do corpo em movimentos coordenados.",
  },
  {
    icon: BadgeCheck,
    title: "Aplicação simples e prática",
    description: "Escolha uma folha, imprima e pratique com a pessoa idosa no ritmo dela.",
  },
  {
    icon: Brain,
    title: "Movimento e estímulo cognitivo",
    description: "Atividades com movimento, atenção e coordenação para exercitar o cérebro.",
  },
];

export default function AtividadesBenefits() {
  return (
    <section className={styles.section} aria-labelledby="benefits-title">
      <div className={styles.content}>
        <h2 id="benefits-title">O que os exercícios bilaterais oferecem:</h2>

        <div className={styles.grid}>
          {benefits.map(({ icon: Icon, title, description }) => (
            <article className={styles.card} key={title}>
              <Icon className={styles.icon} size={25} strokeWidth={2.2} aria-hidden="true" />
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>

        <a className={styles.cta} href="#oferta">Quero os exercícios agora</a>
      </div>
    </section>
  );
}
