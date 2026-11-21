import type { Metadata } from "next";
import "./shinne.css";
import OfferPage from "./offer-page";

export const metadata: Metadata = {
  title: "Amigo Secreto Natalino | Sua brincadeira pronta",
  description: "Organize um Amigo Secreto Natalino divertido e fácil de compartilhar.",
};

export default function SecretoNatalinoPage() {
  return <OfferPage />;
}
