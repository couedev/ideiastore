"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function ActivationForm() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get("access_token") ?? "";
    const linkError = params.get("error_description");
    setAccessToken(token);
    if (linkError || !token) setError("Este link está inválido ou expirou. Solicite um novo convite.");
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!accessToken) {
      setError("Este link está inválido ou expirou. Solicite um novo convite.");
      return;
    }
    if (password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmation) {
      setError("As senhas não coincidem.");
      return;
    }

    setPending(true);
    const response = await fetch("/api/auth/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken, password }),
    }).catch(() => null);
    const result = await response?.json().catch(() => null);
    setPending(false);

    if (!response?.ok) {
      setError(result?.error || "Não foi possível ativar sua conta. Tente novamente.");
      return;
    }

    router.replace("/login?ativado=1");
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.label} htmlFor="activation-password">Nova senha</label>
      <input
        className={styles.input}
        id="activation-password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        maxLength={128}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      <label className={styles.label} htmlFor="activation-confirmation">Confirme sua senha</label>
      <input
        className={styles.input}
        id="activation-confirmation"
        type="password"
        autoComplete="new-password"
        minLength={8}
        maxLength={128}
        value={confirmation}
        onChange={(event) => setConfirmation(event.target.value)}
        required
      />
      {error && <p className={styles.error} role="alert">{error}</p>}
      <button className={styles.submit} type="submit" disabled={pending || !accessToken}>
        {pending ? "Ativando..." : "Ativar minha conta"}
      </button>
    </form>
  );
}
