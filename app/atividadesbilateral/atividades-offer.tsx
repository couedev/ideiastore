import Image from "next/image";
import { Check, Gift } from "lucide-react";
import styles from "./atividades-offer.module.css";

const basicBenefits = [
  "Mais de 100 folhas de atividades bilaterais",
  "Atividades prontas para imprimir e usar",
  "Acesso vitalício ao plano",
];

const completeBenefits = [
  { text: "Mais de 100 folhas de atividades bilaterais", bonus: false },
  { text: "Gestos com as mãos", bonus: true },
  { text: "Sequências de cores", bonus: true },
  { text: "Caminhos e formas", bonus: true },
  { text: "Coordenação dos dedos", bonus: true },
  { text: "Atividades prontas para imprimir e usar", bonus: false },
  { text: "Acesso vitalício ao plano", bonus: false },
];

export default function AtividadesOffer() {
  return (
    <section className={styles.section} id="oferta" aria-labelledby="offer-title">
      <div className={styles.content}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Escolha seu plano</p>
          <h2 id="offer-title">
            <span>Mais de 100 atividades bilaterais</span>
            <span className={styles.offerHeadingSubline}>Pelo preço de um lanche.</span>
          </h2>
          <p className={styles.offerRedline}>Pagamento único. Acesso vitalício nos dois planos.</p>
        </div>

        <div className={styles.plans}>
          <article className={styles.basicCard}>
            <p className={styles.planTag}>Plano básico</p>
            <div className={styles.imageWrap}>
              <Image
                className={styles.image}
                src="/mockuo-sem-bonus.webp"
                alt="Material básico com mais de 100 atividades bilaterais para pessoas idosas"
                fill
                sizes="(max-width: 760px) 100vw, 50vw"
              />
            </div>
            <div className={styles.planCopy}>
              <div className={styles.price}><span>R$</span><strong>17</strong></div>
              <p className={styles.payment}>Pagamento único · acesso vitalício</p>
              <ul className={styles.features}>
                {basicBenefits.map((benefit) => (
                  <li key={benefit}><Check size={17} aria-hidden="true" /><span>{benefit}</span></li>
                ))}
              </ul>
              <div className={styles.purchaseDetails}>
                <p className={styles.comparePrice}>De <s>R$ 27</s> por <strong>R$ 17</strong></p>
                <p className={styles.saving}>Você economiza R$ 10</p>
                <a className={styles.planButton} href="https://pay.sereja.com.br/checkout/I7SjaCSW?p=basico17">Quero o básico</a>
              </div>
            </div>
          </article>

          <article className={styles.completeCard}>
            <p className={styles.planTag}>Mais vendido</p>
            <div className={styles.imageWrap}>
              <Image
                className={styles.image}
                src="/mockup-idoso.webp"
                alt="Material completo com mais de 100 atividades bilaterais e quatro bônus para pessoas idosas"
                fill
                sizes="(max-width: 760px) 100vw, 50vw"
              />
            </div>
            <div className={styles.planCopy}>
              <p className={styles.planName}>Plano completo</p>
              <div className={styles.price}><span>R$</span><strong>27</strong></div>
              <p className={styles.payment}>Pagamento único · acesso vitalício</p>
              <ul className={styles.features}>
                {completeBenefits.map(({ text, bonus }) => (
                  <li key={text}>
                    {bonus ? <Gift className={styles.giftIcon} size={17} aria-hidden="true" /> : <Check size={17} aria-hidden="true" />}
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
              <div className={styles.purchaseDetails}>
                <p className={styles.comparePrice}>De <s>R$ 47</s> por <strong>R$ 27</strong></p>
                <p className={styles.saving}>Você economiza R$ 20</p>
                <a className={styles.planButton} href="https://pay.sereja.com.br/checkout/I7SjaCSW">Quero o completo</a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
