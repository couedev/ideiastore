"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDownToLine, Copy, Share2, Smartphone, Sparkles, X } from "lucide-react";
import styles from "./pwa-install-prompt.module.css";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Platform = "ios-safari" | "ios-other" | "android" | "desktop";

const dismissalKey = "ideastore-pwa-install-dismissed";

function wasDismissed() {
  try {
    return sessionStorage.getItem(dismissalKey) === "1";
  } catch {
    return false;
  }
}

function isInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function getPlatform(): Platform {
  const agent = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/i.test(agent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (ios) {
    return /Safari/i.test(agent) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(agent)
      ? "ios-safari"
      : "ios-other";
  }
  return /Android/i.test(agent) ? "android" : "desktop";
}

export default function PwaInstallPrompt({ enabled = true }: { enabled?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const displayMode = window.matchMedia("(display-mode: standalone)");
    const frame = window.requestAnimationFrame(() => {
      setPlatform(getPlatform());
      setVisible(enabled && !isInstalled() && !wasDismissed());
    });

    function handleDisplayModeChange() {
      if (isInstalled()) setVisible(false);
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    }

    function handleAppInstalled() {
      setInstallPrompt(null);
      setVisible(false);
    }

    displayMode.addEventListener?.("change", handleDisplayModeChange);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.cancelAnimationFrame(frame);
      displayMode.removeEventListener?.("change", handleDisplayModeChange);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [enabled]);

  useEffect(() => {
    if (!visible) return;
    closeButton.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") dismiss();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible]);

  function dismiss() {
    try {
      sessionStorage.setItem(dismissalKey, "1");
    } catch {
      // O aviso ainda pode ser fechado quando o armazenamento está indisponível.
    }
    setVisible(false);
  }

  async function install() {
    if (!installPrompt || installing) return;
    setInstalling(true);
    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
      dismiss();
    } catch {
      setInstallPrompt(null);
    } finally {
      setInstalling(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(new URL("/aplicativo", window.location.origin).toString());
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  if (!visible) return null;

  const ios = platform === "ios-safari" || platform === "ios-other";

  return (
    <div className={styles.backdrop}>
      <section className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="install-title" aria-describedby="install-description">
        <div className={styles.header}>
          <div className={styles.appIcon}>
            <Image src="/icon/icon-storeideias-192.png" alt="" width={68} height={68} />
          </div>
          <div className={styles.headerText}>
            <p className={styles.eyebrow}>Seu aplicativo</p>
            <h2 id="install-title" className={styles.title}>Instale o IdeaStore</h2>
          </div>
          <button ref={closeButton} className={styles.close} type="button" onClick={dismiss} aria-label="Fechar aviso de instalação">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <p id="install-description" className={styles.description}>
          Suas ideias favoritas a um toque de distância, direto na tela inicial do seu dispositivo.
        </p>

        <div className={styles.benefit}>
          <span className={styles.benefitIcon}><Sparkles size={20} aria-hidden="true" /></span>
          <div>
            <strong>Inspiração sempre à mão</strong>
            <p>Abra o aplicativo sem procurar o link de acesso novamente.</p>
          </div>
        </div>

        {ios ? (
          <div className={styles.instructions}>
            {platform === "ios-other" && (
              <p className={styles.browserHint}>No iPhone ou iPad, abra este endereço no Safari para instalar.</p>
            )}
            <div className={styles.step}>
              <span className={styles.stepIcon}><Share2 size={19} aria-hidden="true" /></span>
              <div><strong>1. Toque em Compartilhar</strong><p>Use o botão de compartilhamento do Safari.</p></div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepIcon}><ArrowDownToLine size={19} aria-hidden="true" /></span>
              <div><strong>2. Adicione à Tela de Início</strong><p>Escolha “Adicionar à Tela de Início” e confirme em “Adicionar”.</p></div>
            </div>
          </div>
        ) : !installPrompt ? (
          <div className={styles.instructions}>
            <div className={styles.step}>
              <span className={styles.stepIcon}><Smartphone size={19} aria-hidden="true" /></span>
              <div>
                <strong>Instale pelo menu do navegador</strong>
                <p>Abra o menu e escolha “Instalar aplicativo” ou “Adicionar à tela inicial”, se a opção estiver disponível.</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className={styles.actions}>
          {installPrompt && !ios && (
            <button className={styles.primary} type="button" onClick={install} disabled={installing}>
              <ArrowDownToLine size={19} aria-hidden="true" />
              {installing ? "Abrindo instalação..." : "Instalar aplicativo"}
            </button>
          )}
          {platform === "ios-other" && (
            <button className={styles.primary} type="button" onClick={copyLink}>
              <Copy size={18} aria-hidden="true" />
              {copyState === "copied" ? "Link copiado" : "Copiar endereço"}
            </button>
          )}
          {copyState === "error" && <p className={styles.copyError} role="alert">Não foi possível copiar. Abra ideiastore.online/aplicativo no Safari.</p>}
          <button className={styles.secondary} type="button" onClick={dismiss}>
            {ios ? "Entendi" : "Agora não"}
          </button>
        </div>
      </section>
    </div>
  );
}
