import Link from "next/link";
import { BookOpenText, Gift } from "lucide-react";
import styles from "./app-tabbar.module.css";

type AppTabBarProps = { active: "sorteio" | "como-jogar" };

export default function AppTabBar({ active }: AppTabBarProps) {
  return (
    <nav className={styles.bar} aria-label="Navegação do aplicativo">
      <div className={styles.tabs}>
        <Link href="/aplicativo" className={`${styles.tab} ${active === "sorteio" ? styles.active : ""}`} aria-current={active === "sorteio" ? "page" : undefined}>
          <Gift size={21} aria-hidden="true" />
          <span>Meu sorteio</span>
        </Link>
        <Link href="/aplicativo/como-jogar" className={`${styles.tab} ${active === "como-jogar" ? styles.active : ""}`} aria-current={active === "como-jogar" ? "page" : undefined}>
          <BookOpenText size={21} aria-hidden="true" />
          <span>Como jogar</span>
        </Link>
      </div>
    </nav>
  );
}
