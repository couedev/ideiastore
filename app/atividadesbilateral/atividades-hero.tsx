"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import styles from "./atividades-hero.module.css";

const storageKey = "atividades-bilaterais-quiz";
const relationships = ["self", "mother", "father", "grandparents", "other"] as const;
type Relationship = (typeof relationships)[number];

type SavedQuiz = {
  relationship: Relationship;
  personName: string;
};

function isRelationship(value: unknown): value is Relationship {
  return typeof value === "string" && relationships.includes(value as Relationship);
}

function getQuizSnapshot() {
  try {
    return window.sessionStorage.getItem(storageKey)
      ?? window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function subscribeToQuizChanges(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function readQuizData(rawData: string | null): SavedQuiz | null {
  try {
    if (!rawData) return null;

    const value: unknown = JSON.parse(rawData);
    if (!value || typeof value !== "object") return null;

    const data = value as Record<string, unknown>;
    if (!isRelationship(data.relationship)) return null;

    return {
      relationship: data.relationship,
      personName: typeof data.personName === "string" ? data.personName.trim() : "",
    };
  } catch {
    return null;
  }
}

function getPersonalizedOpening(quiz: SavedQuiz | null) {
  if (!quiz) return "Seu plano de atividades está pronto!";

  const named = quiz.personName ? `, ${quiz.personName}` : "";
  switch (quiz.relationship) {
    case "self":
      return quiz.personName ? `${quiz.personName}, suas atividades estão prontas!` : "Suas atividades estão prontas!";
    case "mother":
      return `As atividades para sua mãe${named} estão prontas!`;
    case "father":
      return `As atividades para seu pai${named} estão prontas!`;
    case "grandparents":
      return `As atividades para seus avós${named} estão prontas!`;
    case "other":
      return quiz.personName
        ? `As atividades para ${quiz.personName} estão prontas!`
        : "As atividades para essa pessoa estão prontas!";
  }
}

export default function AtividadesHero() {
  const quizSnapshot = useSyncExternalStore(subscribeToQuizChanges, getQuizSnapshot, () => null);
  const quiz = readQuizData(quizSnapshot);

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.decorativeGlow} aria-hidden="true" />
        <div className={styles.content}>
          <p className={styles.opening}>
            {getPersonalizedOpening(quiz)}
          </p>

          <h1 id="hero-title" className={styles.title}>
            <span className={styles.titleCount}>+100 FOLHAS</span>
            <span className={styles.titleProduct}>DE ATIVIDADES<br /><span>BILATERAIS</span></span>
          </h1>

          <p className={styles.subtitle}>
            Para exercitar a <span>coordenação motora</span> e estimular o <span>cérebro</span> na terceira idade.
          </p>

          <div className={styles.mockupSpace}>
            <Image
              className={styles.mockupImage}
              src="/mockup-idoso.webp"
              alt="Mockup das atividades bilaterais para pessoas idosas"
              fill
              sizes="(max-width: 520px) 100vw, 620px"
              preload
            />
          </div>

          <p className={styles.description}>
            Você receberá mais de 100 folhas de exercícios bilaterais, com propostas que envolvem os dois lados do corpo e desafiam o cérebro com movimentos, atenção e coordenação.
          </p>

          <a className={styles.cta} href="#oferta">
            Quero conhecer a oferta <ArrowDown size={19} aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  );
}
