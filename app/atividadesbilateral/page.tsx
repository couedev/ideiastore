import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atividades Bilaterais para Pessoas Idosas",
  description: "Conheça atividades bilaterais para exercitar o cérebro de pessoas idosas.",
};

export default function AtividadesBilateraisPage() {
  return (
    <main style={{ minHeight: "100svh", display: "grid", placeItems: "center", padding: 24 }}>
      <section style={{ width: "min(100%, 680px)", textAlign: "center" }}>
        <p style={{ margin: "0 0 12px", color: "#397b68", fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" }}>
          Atividades Bilaterais
        </p>
        <h1 style={{ margin: 0, color: "#15362c", fontSize: "clamp(32px, 7vw, 48px)", lineHeight: 1.1 }}>
          Seu plano personalizado está quase pronto
        </h1>
        <p style={{ margin: "18px auto 0", maxWidth: 480, color: "#15362caa", fontSize: 16, lineHeight: 1.7 }}>
          Em breve, você encontrará aqui a apresentação das atividades e da oferta.
        </p>
      </section>
    </main>
  );
}
