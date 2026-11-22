import { BookOpenText, CandyCane } from "lucide-react";
import AppTabBar from "../app-tabbar";
import styles from "./page.module.css";

export default function ComoJogarPage() {
  return (
    <>
      <main className={styles.page}>
        <article className={styles.card}>
          <header className={styles.header}>
            <span className={styles.headerIcon}><BookOpenText size={25} aria-hidden="true" /></span>
            <p className={styles.eyebrow}><CandyCane size={15} aria-hidden="true" /> Como jogar</p>
            <h1>Amigo Secreto <span>Invertido</span></h1>
            <p className={styles.intro}>Nesta versão, a pessoa da vez tenta descobrir quem tirou o nome dela. O grupo ajuda respondendo apenas “sim” ou “não”.</p>
          </header>

          <ol className={styles.steps}>
            <li className={styles.step}>
              <span className={styles.number} aria-hidden="true">1</span>
              <div>
                <h2>Abra os convites</h2>
                <p>Antes de começar, cada participante abre seu link e raspa o cartão para descobrir quem tirou. Guarde o nome em segredo.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.number} aria-hidden="true">2</span>
              <div>
                <h2>Escolha quem vai adivinhar</h2>
                <p>Uma pessoa vai para a frente dos outros participantes e fica de costas para o grupo. Ela não pode ver o que acontece atrás dela.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.number} aria-hidden="true">3</span>
              <div>
                <h2>“Quem me pegou?”</h2>
                <p>Ainda de costas, a pessoa faz essa pergunta. Quem tirou o nome dela levanta o braço em silêncio para o grupo saber quem é. Depois, abaixa o braço antes de ela se virar.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.number} aria-hidden="true">4</span>
              <div>
                <h2>Faça perguntas</h2>
                <p>Agora a pessoa se vira e faz perguntas para tentar descobrir quem levantou o braço. O grupo só pode responder “sim” ou “não”, sem falar o nome.</p>
                <blockquote>“Quem me pegou demora para responder no WhatsApp?”</blockquote>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.number} aria-hidden="true">5</span>
              <div>
                <h2>Adivinhe e passe a vez</h2>
                <p>Continue perguntando até acertar quem tirou seu nome. Depois, outra pessoa vai para a frente e a brincadeira recomeça. Repitam até todos participarem.</p>
              </div>
            </li>
          </ol>

          <aside className={styles.reminder}>
            <strong>Combinado do grupo</strong>
            <p>Respondam com sinceridade e deixem o nome em segredo até a pessoa acertar. Assim, cada revelação vira uma surpresa!</p>
          </aside>
        </article>
      </main>
      <AppTabBar active="como-jogar" />
    </>
  );
}
