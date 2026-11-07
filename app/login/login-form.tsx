"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { signIn, type LoginState } from "./actions";
import styles from "./page.module.css";

const initialState: LoginState = { error: "" };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const [mostrarSenha, setMostrarSenha] = useState(false);

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

      <p className={styles.secureNote}>
        <LockKeyhole size={13} aria-hidden="true" /> Acesso seguro e protegido
      </p>
    </form>
  );
}
