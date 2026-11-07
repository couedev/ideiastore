"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { signIn, type LoginState } from "./actions";
import styles from "./page.module.css";

const initialState: LoginState = { error: "" };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [email, setEmail] = useState("");
  const [linkPending, setLinkPending] = useState(false);
  const [linkMessage, setLinkMessage] = useState("");

  async function requestAccessLink() {
    setLinkMessage("");
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setLinkMessage("Digite um email valido para receber o link.");
      return;
    }

    setLinkPending(true);
    const response = await fetch("/api/auth/request-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail }),
    }).catch(() => null);
    setLinkPending(false);

    if (!response?.ok) {
      setLinkMessage("Nao foi possivel solicitar o link agora. Tente novamente em instantes.");
      return;
    }

    setLinkMessage("Se este e-mail tiver uma compra aprovada, enviaremos um link para acessar o aplicativo.");
  }

  return (
    <form className={styles.form} action={formAction}>
      <label className={styles.label} htmlFor="email">Seu e-mail</label>
      <div className={styles.inputWrap}>
        <Mail className={styles.inputIcon} size={18} aria-hidden="true" />
        <input
          className={styles.input}
          id="email"
          name="email"
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          autoCapitalize="none"
          required
        />
      </div>

      <div className={styles.passwordHeading}>
        <label className={styles.label} htmlFor="password">Sua senha</label>
      </div>
      <div className={styles.inputWrap}>
        <LockKeyhole className={styles.inputIcon} size={18} aria-hidden="true" />
        <input
          className={styles.input}
          id="password"
          name="password"
          type={mostrarSenha ? "text" : "password"}
          placeholder="Digite sua senha"
          autoComplete="current-password"
          required
        />
        <button
          className={styles.revealButton}
          type="button"
          aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
          onClick={() => setMostrarSenha((visivel) => !visivel)}
        >
          {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {state.error && <p className={styles.error} role="alert">{state.error}</p>}

      <button className={styles.submit} type="submit" disabled={pending}>
        {pending ? <><span className={styles.spinner} /> Entrando...</> : <>Entrar na minha conta <span aria-hidden="true">→</span></>}
      </button>

      <button
        className={styles.magicLinkButton}
        type="button"
        onClick={requestAccessLink}
        disabled={linkPending}
      >
        {linkPending ? "Enviando link..." : "Receber um link de acesso"}
      </button>
      {linkMessage && <p className={styles.magicLinkMessage} role="status">{linkMessage}</p>}

      <p className={styles.secureNote}>
        <LockKeyhole size={13} aria-hidden="true" /> Acesso seguro e protegido
      </p>
    </form>
  );
}
