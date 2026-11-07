"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function MagicLinkCallback() {
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get("token_hash") ?? "";
    window.history.replaceState(null, "", window.location.pathname);

    if (!tokenHash) {
      setError("Este link expirou ou ja foi usado. Solicite um novo link de acesso.");
      return;
    }

    void (async () => {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenHash }),
      }).catch(() => null);

      if (response?.ok) {
        router.replace("/aplicativo");
        return;
      }

      const result = await response?.json().catch(() => null);
      setError(result?.error || "Nao foi possivel validar o link. Solicite um novo.");
    })();
  }, [router]);

  return (
    <div className={styles.form} aria-live="polite">
      {error ? (
        <>
          <p className={styles.error} role="alert">{error}</p>
          <a className={styles.linkButton} href="/login">Solicitar outro link</a>
        </>
      ) : (
        <p className={styles.subtitle}>Validando seu acesso e abrindo o aplicativo...</p>
      )}
    </div>
  );
}
