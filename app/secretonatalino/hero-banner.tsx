"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import bannerFesta from "../../public/banner/Amigo Secreto Natalino em Festa.webp";
import bannerCelular from "../../public/banner/Amigo Secreto Natalino no Celular.webp";
import styles from "./offer-page.module.css";

const banners = [
  { image: bannerFesta, alt: "Amigos celebram o Amigo Secreto Natalino com a surpresa no celular" },
  { image: bannerCelular, alt: "Prévia do Amigo Secreto Natalino em três celulares" },
] as const;

export default function HeroBanner() {
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % banners.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className={styles.heroMedia}>
      {banners.map((banner, index) => (
        <Image
          key={banner.alt}
          src={banner.image}
          alt={index === activeBanner ? banner.alt : ""}
          aria-hidden={index !== activeBanner}
          fill
          loading="eager"
          sizes="(max-width: 800px) calc(100vw - 32px), 540px"
          className={`${styles.heroBannerImage} ${index === activeBanner ? styles.heroBannerImageActive : ""}`}
        />
      ))}
    </div>
  );
}
