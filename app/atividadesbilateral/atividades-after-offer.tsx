import { Plus, ShieldCheck } from "lucide-react";
import styles from "./atividades-after-offer.module.css";

const questions = [
  {
    question: "Como vou receber o material?",
    answer: "Após a confirmação do pagamento, o acesso será enviado para o e-mail informado na compra. A liberação é imediata.",
  },
  {
    question: "Preciso instalar algum aplicativo?",
    answer: "Não. Você acessa o material pelo link enviado por e-mail e pode baixar e imprimir as atividades.",
  },
  {
    question: "Qual é a diferença entre os planos?",
    answer: "Os dois planos incluem mais de 100 folhas de atividades bilaterais e acesso vitalício. O Plano Completo também inclui quatro bônus exclusivos.",
  },
  {
    question: "Por quanto tempo terei acesso?",
    answer: "O acesso ao plano escolhido é vitalício.",
  },
  {
    question: "Como funciona a garantia de 7 dias?",
    answer: "Você tem até 7 dias após a compra para conhecer o material. Se não atender às suas expectativas, pode solicitar o reembolso dentro desse prazo.",
  },
];

export default function AtividadesAfterOffer() {
  return (
    <>
      <section className={styles.guaranteeSection} id="garantia" aria-labelledby="guarantee-title">
        <div className={styles.guaranteeCard}>
          <span className={styles.guaranteeIcon}><ShieldCheck size={34} aria-hidden="true" /></span>
          <div>
            <p className={styles.eyebrow}>Sua compra protegida</p>
            <h2 id="guarantee-title">7 dias de garantia</h2>
            <p className={styles.guaranteeCopy}>
              Conheça o material com tranquilidade. Se mudar de ideia, você pode solicitar o reembolso em até 7 dias após a compra.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.faqSection} id="duvidas" aria-labelledby="faq-title">
        <div className={styles.faqContent}>
          <div className={styles.faqIntro}>
            <p className={styles.eyebrow}>Tire suas dúvidas</p>
            <h2 id="faq-title">Perguntas frequentes</h2>
          </div>
          <div className={styles.faqList}>
            {questions.map(({ question, answer }) => (
              <details className={styles.faqItem} key={question}>
                <summary>{question}<Plus size={20} aria-hidden="true" /></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <strong>Atividades Bilaterais</strong>
            <p>Movimento, atenção e coordenação para praticar no seu ritmo.</p>
          </div>
          <nav className={styles.footerNav} aria-label="Links do rodapé">
            <a href="#oferta">Ver planos</a>
            <a href="#garantia">Garantia</a>
            <a href="#duvidas">Perguntas frequentes</a>
          </nav>
          <small className={styles.copyright}>Material digital para pessoas idosas</small>
        </div>
      </footer>
    </>
  );
}
