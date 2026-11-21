"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CandyCane, Gift, Minus, Plus, X } from "lucide-react";
import styles from "./quiz-funnel.module.css";

type Step = "participants" | "names" | "budget" | "loading";

const storageKey = "amigo-secreto-natalino-quiz";
const minimumParticipants = 2;
const maximumParticipants = 99;

const budgets = [
  { value: "Até R$ 50", hint: "Uma lembrança cheia de carinho" },
  { value: "Até R$ 100", hint: "Um presente especial" },
  { value: "Até R$ 200", hint: "Mais opções para surpreender" },
  { value: "Qualquer valor", hint: "Deixe o grupo decidir" },
] as const;

export default function QuizFunnel() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("participants");
  const [participantCount, setParticipantCount] = useState("3");
  const [names, setNames] = useState(["", "", ""]);
  const [countError, setCountError] = useState("");
  const [namesError, setNamesError] = useState("");

  useEffect(() => {
    if (step !== "loading") return;

    const timeout = window.setTimeout(() => {
      router.push("/secretonatalino");
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [router, step]);

  function adjustParticipantCount(amount: number) {
    const current = Number.parseInt(participantCount, 10);
    const next = Math.min(
      maximumParticipants,
      Math.max(minimumParticipants, (Number.isNaN(current) ? minimumParticipants : current) + amount),
    );
    setParticipantCount(String(next));
    setCountError("");
  }

  function continueToNames(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const count = Number(participantCount);
    if (!Number.isInteger(count) || count < minimumParticipants || count > maximumParticipants) {
      setCountError(`Escolha um número entre ${minimumParticipants} e ${maximumParticipants}.`);
      return;
    }

    setNames((current) => Array.from({ length: count }, (_, index) => current[index] ?? ""));
    setCountError("");
    setStep("names");
  }

  function continueToBudget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedNames = names.map((name) => name.trim());
    if (normalizedNames.some((name) => !name)) {
      setNamesError("Preencha o nome de cada pessoa para continuar.");
      return;
    }

    const distinctNames = new Set(normalizedNames.map((name) => name.toLocaleLowerCase("pt-BR")));
    if (distinctNames.size !== normalizedNames.length) {
      setNamesError("Cada participante precisa ter um nome diferente.");
      return;
    }

    setNames(normalizedNames);
    setNamesError("");
    setStep("budget");
  }

  function chooseBudget(value: string) {
    const quizData = {
      participantCount: names.length,
      names: names.map((name) => name.trim()),
      budget: value,
    };

    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(quizData));
    } catch {
      // O quiz ainda segue para a oferta se o navegador bloquear o armazenamento da sessão.
    }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(quizData));
    } catch {
      // O formulário do aplicativo ainda pode ser preenchido manualmente.
    }

    setStep("loading");
  }

  function updateName(index: number, value: string) {
    setNames((current) => current.map((name, currentIndex) => currentIndex === index ? value : name));
    setNamesError("");
  }

  function addPerson() {
    if (names.length >= maximumParticipants) return;
    setNames((current) => [...current, ""]);
  }

  function removePerson(index: number) {
    if (index === 0 || names.length <= minimumParticipants) return;
    setNames((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setNamesError("");
  }

  const activeStep = step === "participants" ? 1 : step === "names" ? 2 : 3;

  return (
    <main className={styles.screen}>
      <div className={styles.decoration} aria-hidden="true" />
      <section className={styles.card} aria-labelledby="quiz-title">
        <header className={styles.header}>
          <div className={styles.brand}>
            <span className={styles.brandIcon} aria-hidden="true"><Gift size={21} /></span>
            <span className={styles.brandName}>Amigo Secreto <strong>Natalino</strong></span>
          </div>
          {step !== "loading" && (
            <p className={styles.stepLabel}>ETAPA {activeStep} DE 3</p>
          )}
        </header>

        {step !== "loading" && (
          <div className={styles.progress} aria-label={`Etapa ${activeStep} de 3`}>
            {[1, 2, 3].map((number) => (
              <span
                key={number}
                className={`${styles.progressSegment} ${number <= activeStep ? styles.progressSegmentActive : ""}`}
              />
            ))}
          </div>
        )}

        {step === "participants" && (
          <div className={styles.content}>
            <div className={styles.intro}>
              <p className={styles.eyebrow}><CandyCane size={14} aria-hidden="true" /> A brincadeira começa aqui</p>
              <h1 id="quiz-title" className={styles.title}>
                Quantas pessoas vão participar do seu <span>Amigo Secreto Natalino?</span>
              </h1>
              <p className={styles.subtitle}>
                Não se preocupe: você pode remover ou adicionar pessoas depois.
              </p>
            </div>

            <form onSubmit={continueToNames}>
              <label className={styles.fieldLabel} htmlFor="participant-count">Número de participantes</label>
              <div className={styles.counter}>
                <button
                  className={styles.counterButton}
                  type="button"
                  onClick={() => adjustParticipantCount(-1)}
                  disabled={Number(participantCount) <= minimumParticipants}
                  aria-label="Diminuir número de participantes"
                >
                  <Minus size={19} aria-hidden="true" />
                </button>
                <input
                  className={styles.counterInput}
                  id="participant-count"
                  name="participant-count"
                  type="number"
                  min={minimumParticipants}
                  max={maximumParticipants}
                  step={1}
                  value={participantCount}
                  onChange={(event) => {
                    setParticipantCount(event.target.value);
                    setCountError("");
                  }}
                  aria-describedby={countError ? "count-error" : "count-hint"}
                  required
                />
                <button
                  className={styles.counterButton}
                  type="button"
                  onClick={() => adjustParticipantCount(1)}
                  disabled={Number(participantCount) >= maximumParticipants}
                  aria-label="Aumentar número de participantes"
                >
                  <Plus size={19} aria-hidden="true" />
                </button>
              </div>
              {countError ? (
                <p className={styles.error} id="count-error" role="alert">{countError}</p>
              ) : (
                <p className={styles.hint} id="count-hint">Você pode começar com pelo menos 2 pessoas.</p>
              )}
              <button className={styles.primaryButton} type="submit">
                Continuar <ArrowRight size={18} aria-hidden="true" />
              </button>
            </form>
          </div>
        )}

        {step === "names" && (
          <div className={styles.content}>
            <div className={styles.intro}>
              <p className={styles.eyebrow}><CandyCane size={14} aria-hidden="true" /> Quem vai entrar na brincadeira?</p>
              <h1 id="quiz-title" className={styles.title}>Vamos conhecer <span>os participantes</span></h1>
              <p className={styles.subtitle}>Coloque seu nome primeiro e depois os nomes das outras pessoas.</p>
            </div>

            <form onSubmit={continueToBudget}>
              <div className={styles.nameList}>
                {names.map((name, index) => (
                  <div className={styles.nameField} key={index}>
                    <label className={styles.fieldLabel} htmlFor={`participant-${index}`}>
                      {index === 0 ? "Seu nome" : `Nome da pessoa ${index + 1}`}
                    </label>
                    <div className={styles.nameInputWrap}>
                      <input
                        className={styles.nameInput}
                        id={`participant-${index}`}
                        name={`participant-${index}`}
                        type="text"
                        value={name}
                        onChange={(event) => updateName(index, event.target.value)}
                        placeholder={index === 0 ? "Como podemos chamar você?" : "Digite o nome da pessoa"}
                        maxLength={60}
                        autoComplete="off"
                        required
                      />
                      {index > 0 && names.length > minimumParticipants && (
                        <button
                          className={styles.removeButton}
                          type="button"
                          onClick={() => removePerson(index)}
                          aria-label={`Remover ${name || `pessoa ${index + 1}`}`}
                        >
                          <X size={17} aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                className={styles.addPersonButton}
                type="button"
                onClick={addPerson}
                disabled={names.length >= maximumParticipants}
              >
                <Plus size={16} aria-hidden="true" /> Adicionar mais pessoas
              </button>

              {namesError && <p className={styles.error} role="alert">{namesError}</p>}
              <button className={styles.primaryButton} type="submit">
                Continuar <ArrowRight size={18} aria-hidden="true" />
              </button>
              <button className={styles.backButton} type="button" onClick={() => setStep("participants")}>
                <ArrowLeft size={16} aria-hidden="true" /> Voltar
              </button>
            </form>
          </div>
        )}

        {step === "budget" && (
          <div className={styles.content}>
            <div className={styles.intro}>
              <p className={styles.eyebrow}><Gift size={14} aria-hidden="true" /> Agora vamos pensar no presente</p>
              <h1 id="quiz-title" className={styles.title}>
                O presente do Amigo Secreto Natalino pode ser de <span>até que valor?</span>
              </h1>
              <p className={styles.subtitle}>Escolha uma faixa para combinar com o seu grupo.</p>
            </div>

            <div className={styles.budgetOptions}>
              {budgets.map(({ value, hint }) => (
                <button
                  className={styles.budgetOption}
                  key={value}
                  type="button"
                  onClick={() => chooseBudget(value)}
                >
                  <span className={styles.budgetIcon}><Gift size={19} aria-hidden="true" /></span>
                  <span className={styles.budgetCopy}>
                    <strong>{value}</strong>
                    <small>{hint}</small>
                  </span>
                  <ArrowRight className={styles.budgetArrow} size={18} aria-hidden="true" />
                </button>
              ))}
            </div>
            <button className={styles.backButton} type="button" onClick={() => setStep("names")}>
              <ArrowLeft size={16} aria-hidden="true" /> Voltar
            </button>
          </div>
        )}

        {step === "loading" && (
          <div className={`${styles.content} ${styles.loadingContent}`} role="status" aria-live="polite">
            <div className={styles.loadingIcon} aria-hidden="true">
              <Gift size={34} />
              <span><CandyCane size={17} /></span>
            </div>
            <p className={styles.eyebrow}>Só um instante</p>
            <h1 id="quiz-title" className={styles.title}>Estamos criando seu <span>Amigo Secreto Natalino</span></h1>
            <p className={styles.subtitle}>Estamos organizando os detalhes para preparar uma surpresa especial.</p>
            <div className={styles.loadingTrack} aria-hidden="true"><span /></div>
            <p className={styles.loadingHint}>Preparando a magia do Natal…</p>
          </div>
        )}

        {step !== "loading" && (
          <footer className={styles.footer}>
            Feito para reunir quem você gosta <span aria-hidden="true">♥</span>
          </footer>
        )}
      </section>
    </main>
  );
}
