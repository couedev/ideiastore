"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Brain,
  Heart,
  Sparkles,
  UserRound,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";
import styles from "./funil.module.css";

type Relationship = "self" | "mother" | "father" | "grandparents" | "other";
type AgeBand = "under60" | "60s" | "70s" | "80plus";
type Step = "welcome" | "relationship" | "age" | "explanation" | "name" | "loading";

const storageKey = "atividades-bilaterais-quiz";

const relationships = [
  { value: "self", label: "Para mim", icon: UserRound },
  { value: "mother", label: "Para minha mãe", icon: Heart },
  { value: "father", label: "Para meu pai", icon: UserRound },
  { value: "grandparents", label: "Para meus avós", icon: UsersRound },
  { value: "other", label: "Para outra pessoa", icon: UserRoundPlus },
] as const;

const relationshipCopy: Record<Relationship, {
  ageQuestion: string;
  nameQuestion: string;
  namePlaceholder: string;
  personReference: string;
}> = {
  self: {
    ageQuestion: "Qual é a sua idade?",
    nameQuestion: "Como podemos chamar você?",
    namePlaceholder: "Digite seu nome",
    personReference: "você",
  },
  mother: {
    ageQuestion: "Qual é a idade da sua mãe?",
    nameQuestion: "Qual é o nome da sua mãe?",
    namePlaceholder: "Digite o nome da sua mãe",
    personReference: "sua mãe",
  },
  father: {
    ageQuestion: "Qual é a idade do seu pai?",
    nameQuestion: "Qual é o nome do seu pai?",
    namePlaceholder: "Digite o nome do seu pai",
    personReference: "seu pai",
  },
  grandparents: {
    ageQuestion: "Qual é a idade do seu avô ou da sua avó?",
    nameQuestion: "Qual é o nome do seu avô ou da sua avó?",
    namePlaceholder: "Digite o nome",
    personReference: "seu avô ou sua avó",
  },
  other: {
    ageQuestion: "Qual é a idade dessa pessoa?",
    nameQuestion: "Qual é o nome dessa pessoa?",
    namePlaceholder: "Digite o nome da pessoa",
    personReference: "essa pessoa",
  },
};

const ageBands: { value: AgeBand; label: string; phrase: string }[] = [
  { value: "under60", label: "Até 59 anos", phrase: "antes dos 60 anos" },
  { value: "60s", label: "De 60 a 69 anos", phrase: "dos 60 aos 69 anos" },
  { value: "70s", label: "De 70 a 79 anos", phrase: "dos 70 aos 79 anos" },
  { value: "80plus", label: "80 anos ou mais", phrase: "a partir dos 80 anos" },
];

const progressByStep: Partial<Record<Step, number>> = {
  welcome: 1,
  relationship: 2,
  age: 3,
  explanation: 4,
  name: 5,
};

export default function FunilAtividades() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [ageBand, setAgeBand] = useState<AgeBand | null>(null);
  const [personName, setPersonName] = useState("");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (step !== "loading") return;

    const timeout = window.setTimeout(() => {
      router.push("/atividadesbilateral");
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [router, step]);

  useEffect(() => {
    if (step !== "welcome") return;

    const timeout = window.setTimeout(() => setStep("relationship"), 10000);
    return () => window.clearTimeout(timeout);
  }, [step]);

  const activeStep = progressByStep[step] ?? 5;
  const selectedRelationship = relationship ? relationshipCopy[relationship] : null;
  const selectedAgeBand = ageBands.find((band) => band.value === ageBand);

  function chooseRelationship(value: Relationship) {
    setRelationship(value);
    setAgeBand(null);
    setStep("age");
  }

  function finishQuiz(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!relationship || !ageBand) return;

    const quizData = {
      relationship,
      ageBand,
      ageLabel: selectedAgeBand?.label,
      personName: personName.trim(),
    };
    const serializedData = JSON.stringify(quizData);

    try {
      window.sessionStorage.setItem(storageKey, serializedData);
    } catch {
      // O quiz continua para a oferta se o navegador bloquear o armazenamento da sessão.
    }
    try {
      window.localStorage.setItem(storageKey, serializedData);
    } catch {
      // O quiz continua para a oferta se o navegador bloquear o armazenamento local.
    }

    setStep("loading");
  }

  const progressLabel = `Etapa ${activeStep} de 5`;

  return (
    <main className={styles.screen}>
      <div className={styles.glow} aria-hidden="true" />
      <section className={styles.card} aria-labelledby="quiz-title">
        <header className={styles.header}>
          <div className={styles.brand}>
            <span className={styles.brandIcon} aria-hidden="true"><Brain size={21} /></span>
            <span className={styles.brandName}>Atividades <strong>Bilaterais</strong></span>
          </div>
          {step !== "loading" && <p className={styles.stepLabel}>{progressLabel}</p>}
        </header>

        {step !== "loading" && (
          <div className={styles.progress} aria-label={progressLabel}>
            {[1, 2, 3, 4, 5].map((number) => (
              <span
                key={number}
                className={`${styles.progressSegment} ${number <= activeStep ? styles.progressSegmentActive : ""}`}
              />
            ))}
          </div>
        )}

        {step === "welcome" && (
          <div className={styles.content}>
            <div className={styles.intro}>
              <p className={styles.eyebrow}><Activity size={14} aria-hidden="true" /> Um plano com mais cuidado</p>
              <h1 id="quiz-title" className={styles.title}>
                Mais de 100 atividades bilaterais para <span>estimular o corpo e o cérebro.</span>
              </h1>
              <p className={styles.subtitle}>
                Responda a algumas perguntas e receba uma sugestão personalizada.
              </p>
            </div>

            <button className={styles.primaryButton} type="button" onClick={() => setStep("relationship")}>
              Continuar <ArrowRight size={18} aria-hidden="true" />
            </button>
            <div className={styles.autoAdvance}>
              <span>Avançando automaticamente em 10 segundos</span>
              <div className={styles.autoAdvanceTrack} aria-hidden="true"><span /></div>
            </div>
          </div>
        )}

        {step === "relationship" && (
          <div className={styles.content}>
            <div className={styles.intro}>
              <p className={styles.eyebrow}><Heart size={14} aria-hidden="true" /> Vamos personalizar</p>
              <h1 id="quiz-title" className={styles.title}>Para quem são <span>esses exercícios?</span></h1>
              <p className={styles.subtitle}>Escolha uma opção para continuar.</p>
            </div>

            <div className={styles.options}>
              {relationships.map(({ value, label, icon: Icon }) => (
                <button
                  className={styles.option}
                  key={value}
                  type="button"
                  onClick={() => chooseRelationship(value)}
                >
                  <span className={styles.optionIcon}><Icon size={19} aria-hidden="true" /></span>
                  <strong>{label}</strong>
                  <ArrowRight className={styles.optionArrow} size={18} aria-hidden="true" />
                </button>
              ))}
            </div>
            <button className={styles.backButton} type="button" onClick={() => setStep("welcome")}>
              <ArrowLeft size={16} aria-hidden="true" /> Voltar
            </button>
          </div>
        )}

        {step === "age" && selectedRelationship && (
          <div className={styles.content}>
            <div className={styles.intro}>
              <p className={styles.eyebrow}><Activity size={14} aria-hidden="true" /> Só mais uma informação</p>
              <h1 id="quiz-title" className={styles.title}>{selectedRelationship.ageQuestion}</h1>
              <p className={styles.subtitle}>Assim encontramos uma faixa de atividades adequada para essa fase.</p>
            </div>

            <div className={styles.ageOptions} role="group" aria-label="Faixa de idade">
              {ageBands.map((band) => (
                <button
                  className={`${styles.ageOption} ${ageBand === band.value ? styles.ageOptionSelected : ""}`}
                  key={band.value}
                  type="button"
                  aria-pressed={ageBand === band.value}
                  onClick={() => {
                    setAgeBand(band.value);
                    setStep("explanation");
                  }}
                >
                  <span className={styles.radioMark} aria-hidden="true" />
                  {band.label}
                </button>
              ))}
            </div>

            <button className={styles.backButton} type="button" onClick={() => setStep("relationship")}>
              <ArrowLeft size={16} aria-hidden="true" /> Voltar
            </button>
          </div>
        )}

        {step === "explanation" && selectedRelationship && selectedAgeBand && (
          <div className={styles.content}>
            <div className={styles.explanationIcon} aria-hidden="true"><Brain size={27} /></div>
            <p className={styles.eyebrow}><Sparkles size={14} aria-hidden="true" /> Uma escolha cheia de carinho</p>
            <h1 id="quiz-title" className={styles.title}>
              {ageBand === "under60" ? (
                <>Antes dos 60 anos também pode ser uma ótima fase para começar. <span>💙</span></>
              ) : (
                <>A faixa {selectedAgeBand.phrase} é uma ótima fase para começar. <span>💙</span></>
              )}
            </h1>
            <div className={styles.explanationCopy}>
              <p>Atividades que pedem coordenação entre as duas mãos exigem atenção, foco e controle ao mesmo tempo. Por isso, pesquisas sobre envelhecimento têm estudado esse tipo de exercício como uma forma de manter o cérebro ativo.</p>
              <p>E o melhor: bastam alguns minutos por dia, uma folha e uma caneta.</p>
              <p>Vamos montar o plano de atividades ideal para {selectedRelationship.personReference}.</p>
            </div>

            <button className={`${styles.primaryButton} natal-shinne`} type="button" onClick={() => setStep("name")}>
              Continuar <ArrowRight size={18} aria-hidden="true" />
            </button>
            <button className={styles.backButton} type="button" onClick={() => setStep("age")}>
              <ArrowLeft size={16} aria-hidden="true" /> Voltar
            </button>
          </div>
        )}

        {step === "name" && selectedRelationship && (
          <div className={styles.content}>
            <div className={styles.intro}>
              <p className={styles.eyebrow}><Heart size={14} aria-hidden="true" /> Estamos quase lá</p>
              <h1 id="quiz-title" className={styles.title}>Prontinho! Só falta <span>uma última informação.</span></h1>
              <p className={styles.subtitle}>{selectedRelationship.nameQuestion}</p>
            </div>

            <form onSubmit={finishQuiz}>
              <label className={styles.fieldLabel} htmlFor="person-name">Nome</label>
              <input
                className={styles.nameInput}
                id="person-name"
                name="person-name"
                type="text"
                value={personName}
                onChange={(event) => {
                  setPersonName(event.target.value);
                  setNameError("");
                }}
                placeholder={selectedRelationship.namePlaceholder}
                autoComplete="given-name"
                maxLength={60}
                required
              />
              {nameError && <p className={styles.error} role="alert">{nameError}</p>}
              <button className={styles.primaryButton} type="submit">
                Preparar meu plano <ArrowRight size={18} aria-hidden="true" />
              </button>
            </form>
            <button className={styles.backButton} type="button" onClick={() => setStep("explanation")}>
              <ArrowLeft size={16} aria-hidden="true" /> Voltar
            </button>
          </div>
        )}

        {step === "loading" && (
          <div className={`${styles.content} ${styles.loadingContent}`} role="status" aria-live="polite">
            <div className={styles.loadingIcon} aria-hidden="true"><Brain size={34} /></div>
            <p className={styles.eyebrow}>Só um instante</p>
            <h1 id="quiz-title" className={styles.title}>Estamos preparando <span>as atividades</span></h1>
            <p className={styles.subtitle}>
              {relationship === "self"
                ? "Estamos organizando as atividades para o seu plano."
                : `Estamos organizando as atividades para o plano de ${selectedRelationship?.personReference ?? "vocês"}.`}
            </p>
            <div className={styles.loadingTrack} aria-hidden="true"><span /></div>
            <p className={styles.loadingHint}>Montando uma sugestão com carinho…</p>
          </div>
        )}

        {step !== "loading" && (
          <footer className={styles.footer}>
            Um passo de cada vez, com carinho <span aria-hidden="true">♥</span>
          </footer>
        )}
      </section>
    </main>
  );
}
