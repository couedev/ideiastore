import type { Metadata } from "next";
import AtividadesAudience from "./atividades-audience";
import AtividadesBonus from "./atividades-bonus";
import AtividadesBenefits from "./atividades-benefits";
import AtividadesCarousel from "./atividades-carousel";
import AtividadesAfterOffer from "./atividades-after-offer";
import AtividadesHero from "./atividades-hero";
import AtividadesIncluded from "./atividades-included";
import AtividadesNextSection from "./atividades-next-section";
import AtividadesExitOffer from "./atividades-exit-offer";
import AtividadesOffer from "./atividades-offer";
import AtividadesPromoBanner from "./atividades-promo-banner";

export const metadata: Metadata = {
  title: "Atividades Bilaterais para Pessoas Idosas",
  description: "Conheça atividades bilaterais para exercitar o cérebro de pessoas idosas.",
};

export default function AtividadesBilateraisPage() {
  return (
    <main>
      <AtividadesHero />
      <AtividadesCarousel />
      <AtividadesBenefits />
      <AtividadesPromoBanner />
      <AtividadesNextSection />
      <AtividadesAudience />
      <AtividadesIncluded />
      <AtividadesBonus />
      <AtividadesOffer />
      <AtividadesAfterOffer />
      <AtividadesExitOffer />
    </main>
  );
}
