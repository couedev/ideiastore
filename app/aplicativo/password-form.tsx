"use client";

import { useActionState, useEffect, useRef } from "react";
import { LockKeyhole } from "lucide-react";
import { setPassword, type PasswordState } from "../login/actions";
import styles from "./page.module.css";

const initialState: PasswordState = { status: "idle", message: "" };

export default function PasswordForm() {
  const [state, formAction, pending] = useActionState(setPassword, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <section className={styles.passwordPanel} aria-labelledby="password-title">
      <div className={styles.passwordPanelHeader}>
        <LockKeyhole size={17} aria-hidden="true" />
        <h3 id="password-title" className={styles.passwordPanelTitle}>Entrar com senha</h3>
      </div>
      <p className={styles.passwordPanelText}>
        Crie ou altere sua senha quando quiser. O link de acesso continuará disponível.
      </p>

      <form ref={formRef} action={formAction} className={styles.passwordForm}>
        <label className={styles.passwordLabel} htmlFor="new-password">Nova senha</label>
        <input
          className={styles.passwordInput}
          id="new-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          required
        />
        <label className={styles.passwordLabel} htmlFor="confirm-password">Confirmar senha</label>
        <input
          className={styles.passwordInput}
          id="confirm-password"
          name="confirmation"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          required
        />
        {state.message && (
          <p
            className={state.status === "success" ? styles.passwordSuccess : styles.passwordError}
            role={state.status === "error" ? "alert" : "status"}
          >
            {state.message}
          </p>
        )}
        <button className={styles.passwordSubmit} type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar senha"}
        </button>
      </form>
    </section>
  );
}
