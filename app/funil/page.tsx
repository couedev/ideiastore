import type { Metadata } from "next";
import "../secretonatalino/shinne.css";
import FunilAtividades from "./funil-atividades";

export const metadata: Metadata = {
  title: "Monte seu plano de atividades bilaterais",
  description: "Responda algumas perguntas e conheça atividades bilaterais para pessoas idosas.",
};

export default function FunilPage() {
  return <FunilAtividades />;
}
