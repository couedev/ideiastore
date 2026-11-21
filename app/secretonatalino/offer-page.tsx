"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight, BadgeCheck, CandyCane, Check, Copy, Gift,
  Mail, Play, Plus, ShieldCheck, Smartphone, TicketPercent, Trash2, TreePine,
} from "lucide-react";
import styles from "./offer-page.module.css";
import BackgroundMusic from "./background-music";
import CouponPopup from "./coupon-popup";
import ExitOfferPopup from "./exit-offer-popup";
import ScratchDemo from "./scratch-demo";

type QuizData = { participantCount: number; names: string[]; budget: string };
const storageKey = "amigo-secreto-natalino-quiz";
const couponStorageKey = "amigo-secreto-natalino-cupom-black-friday";
const checkoutUrl = "https://pay.sereja.com.br/checkout/KYaHLU_M";
const specialCheckoutUrl = "https://pay.sereja.com.br/checkout/KYaHLU_M?p=ofertablack";

const keepsakeImages = Array.from({ length: 9 }, (_, index) => ({
  src: `/carrossel-lebrancinhas/cssel-${String(index + 1).padStart(2, "0")}.webp`,
  alt: `Modelo ${index + 1} de lembrancinha de Natal`,
}));

const questions = [
  { question: "Como recebo meu Amigo Secreto Natalino?", answer: "Depois da compra, você recebe o acesso por e-mail e pode abrir tudo no celular." },
  { question: "Preciso instalar algum aplicativo?", answer: "Não. O acesso abre pelo link no navegador e tem uma experiência com cara de aplicativo." },
  { question: "Posso adicionar mais participantes?", answer: "Sim. Ajuste a lista de nomes nesta página antes de compartilhar os convites." },
  { question: "O valor do presente é cobrado aqui?", answer: "Não. A faixa escolhida é apenas uma referência para o grupo. O preço desta página é pelo acesso ao Amigo Secreto Natalino." },
  { question: "Como funciona a garantia?", answer: "Você tem 7 dias após a compra para pedir o reembolso, caso mude de ideia." },
] as const;

function readQuizData(): QuizData | null {
  for (const type of ["sessionStorage", "localStorage"] as const) {
    try {
      const raw = window[type].getItem(storageKey);
      if (!raw) continue;
      const data: unknown = JSON.parse(raw);
      if (!data || typeof data !== "object") continue;
      const candidate = data as Partial<QuizData>;
      if (!Array.isArray(candidate.names) || !candidate.names.every((name) => typeof name === "string")) continue;
      const names = candidate.names.map((name) => name.trim()).filter(Boolean);
      if (names.length < 2) continue;
      return { participantCount: names.length, names, budget: typeof candidate.budget === "string" ? candidate.budget : "" };
    } catch {
      // Um rascunho inválido não impede o uso do outro armazenamento.
    }
  }
  return null;
}

export default function OfferPage() {
  const router = useRouter();
  const musicRef = useRef<HTMLAudioElement>(null);
  const checkoutInProgressRef = useRef(false);
  const checkoutAbortRef = useRef<AbortController | null>(null);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [extraNames, setExtraNames] = useState<string[]>([]);
  const [nameError, setNameError] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponPopupOpen, setCouponPopupOpen] = useState(false);
  const [exitOfferOpen, setExitOfferOpen] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setQuizData(readQuizData());
      try {
        setCouponApplied(window.sessionStorage.getItem(couponStorageKey) === "1");
      } catch {
        // O cupom continua funcional durante a visita mesmo sem armazenamento.
      }
      setLoaded(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!loaded || couponApplied || exitOfferOpen || !("IntersectionObserver" in window)) return;
    const offer = document.getElementById("oferta");
    if (!offer) return;

    let popupTimer: number | null = null;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (popupTimer !== null) return;
        popupTimer = window.setTimeout(() => {
          setCouponPopupOpen(true);
          observer.disconnect();
          popupTimer = null;
        }, 2500);
      } else if (popupTimer !== null) {
        window.clearTimeout(popupTimer);
        popupTimer = null;
      }
    }, { threshold: 0.18 });
    observer.observe(offer);
    return () => {
      if (popupTimer !== null) window.clearTimeout(popupTimer);
      observer.disconnect();
    };
  }, [loaded, couponApplied, exitOfferOpen]);

  useEffect(() => {
    const guardKey = "__secretoNatalinoExitGuard";

    // A mesma entrada também é reaproveitada quando o React monta o efeito novamente.
    if (!window.history.state?.[guardKey]) {
      window.history.pushState({ ...window.history.state, [guardKey]: true }, "", window.location.href);
    }

    function handleBack(event: PopStateEvent) {
      if (!/^\/secretonatalino\/?$/.test(window.location.pathname) || event.state?.[guardKey]) return;
      checkoutAbortRef.current?.abort();
      checkoutAbortRef.current = null;
      checkoutInProgressRef.current = false;
      setCheckoutBusy(false);
      setCheckoutError("");
      setCouponPopupOpen(false);
      setExitOfferOpen(true);
    }

    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, []);

  function saveNames(names: string[]) {
    if (!quizData) return;
    const next = { ...quizData, names, participantCount: names.length };
    setQuizData(next);
    try { window.sessionStorage.setItem(storageKey, JSON.stringify(next)); } catch {
      // A lista continua disponível nesta página mesmo sem armazenamento.
    }
    try { window.localStorage.setItem(storageKey, JSON.stringify(next)); } catch {
      // O formulário do aplicativo ainda pode ser preenchido manualmente.
    }
  }

  function addNameField() {
    if ((quizData?.names.length ?? 0) + extraNames.length >= 99) return;
    setExtraNames((current) => [...current, ""]);
    setNameError("");
  }

  function saveExtraNames(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!quizData) return;
    const normalized = extraNames.map((name) => name.trim());
    if (normalized.some((name) => !name)) { setNameError("Preencha os novos nomes antes de salvar."); return; }
    const allNames = [...quizData.names, ...normalized];
    if (new Set(allNames.map((name) => name.toLocaleLowerCase("pt-BR"))).size !== allNames.length) {
      setNameError("Cada participante precisa ter um nome diferente.");
      return;
    }
    saveNames(allNames);
    setExtraNames([]);
    setNameError("");
  }

  function removeName(index: number) {
    if (!quizData || index === 0 || quizData.names.length <= 2) return;
    saveNames(quizData.names.filter((_, currentIndex) => currentIndex !== index));
  }

  function scrollToOffer() {
    document.getElementById("oferta")?.scrollIntoView({ behavior: "smooth" });
  }

  function applyCoupon() {
    setCouponApplied(true);
    setCouponPopupOpen(false);
    try {
      window.sessionStorage.setItem(couponStorageKey, "1");
    } catch {
      // O desconto continua aplicado até a página ser fechada.
    }
  }

  function startMusicAfterScratch() {
    setMusicEnabled(true);
    const audio = musicRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Se o navegador bloquear a reprodução, o controle aparece para iniciar com um toque.
    });
  }

  function declineExitOffer() {
    checkoutAbortRef.current?.abort();
    checkoutAbortRef.current = null;
    checkoutInProgressRef.current = false;
    setCheckoutBusy(false);
    setCheckoutError("");
    setExitOfferOpen(false);
    if (window.history.length > 2) {
      router.back();
    } else {
      router.replace("/");
    }
  }

  async function openCheckout(baseUrl: string) {
    if (checkoutInProgressRef.current) return;
    if (!quizData) {
      router.push("/");
      return;
    }

    checkoutInProgressRef.current = true;
    setCheckoutBusy(true);
    setCheckoutError("");
    const controller = new AbortController();
    checkoutAbortRef.current = controller;

    try {
      const response = await fetch("/api/amigo-secreto/rascunho", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: quizData.names, budget: quizData.budget }),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || typeof result?.externalRef !== "string") {
        throw new Error(result?.error || "Não foi possível preparar seu checkout.");
      }
      if (controller.signal.aborted) return;
      const destination = new URL(baseUrl);
      destination.searchParams.set("external_ref", result.externalRef);
      window.location.assign(destination.toString());
    } catch (error) {
      if (!controller.signal.aborted) {
        setCheckoutError(error instanceof Error ? error.message : "Não foi possível preparar seu checkout.");
      }
    } finally {
      if (checkoutAbortRef.current === controller) {
        checkoutAbortRef.current = null;
        checkoutInProgressRef.current = false;
        setCheckoutBusy(false);
      }
    }
  }

  const demoName = quizData?.names[1] ?? "Ana";

  return (
    <main className={styles.page}>
      <BackgroundMusic audioRef={musicRef} enabled={musicEnabled} />
      <CouponPopup open={couponPopupOpen} onApply={applyCoupon} onClose={() => setCouponPopupOpen(false)} />
      <ExitOfferPopup open={exitOfferOpen} name={quizData?.names[0]} onAccept={() => void openCheckout(specialCheckoutUrl)} onDecline={declineExitOffer} busy={checkoutBusy} error={checkoutError} />
      <header className={styles.siteHeader}>
        <div className={styles.siteHeaderInner}>
          <span className={styles.brand}><span className={styles.brandMark}><Gift size={21} aria-hidden="true" /></span> Amigo Secreto <b>Natalino</b></span>
          <button className={styles.headerLink} type="button" onClick={scrollToOffer}>Ver oferta <ArrowRight size={15} aria-hidden="true" /></button>
        </div>
      </header>

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={styles.redline}><CandyCane size={16} aria-hidden="true" /> Deixe o Natal mais divertido</p>
            <h1 id="hero-title">
              {quizData ? <><em>{quizData.names[0]},</em> seu Amigo Secreto Natalino está pronto!</> : "Seu Amigo Secreto Natalino está pronto!"}
            </h1>
            <p className={styles.heroSubtitle}>Você não precisa se preocupar: já deixamos tudo prontinho para você!</p>
          </div>
          <div className={styles.heroMedia} aria-label="Espaço reservado para imagem ou vídeo da brincadeira">
            <div className={styles.mediaOrnament} aria-hidden="true"><CandyCane size={28} /><Gift size={48} /><TreePine size={31} /></div>
            <span className={styles.playBadge}><Play size={24} fill="currentColor" aria-hidden="true" /></span>
            <p>Uma prévia da surpresa vem aqui</p><small>Espaço para imagem ou vídeo</small>
          </div>
          <div className={styles.heroActions}>
            <button className={styles.heroCta} type="button" onClick={scrollToOffer}>Quero começar a brincadeira <ArrowRight size={18} aria-hidden="true" /></button>
            <p className={styles.heroNote}><Check size={15} aria-hidden="true" /> Fácil de organizar e compartilhar</p>
          </div>
        </div>
      </section>

      <section className={styles.personalSection} aria-labelledby="friends-title">
        <div className={styles.sectionInner}>
          <div className={styles.sectionIntro}>
            <p className={styles.sectionEyebrow}>Seu grupo já está quase pronto</p>
            <h2 id="friends-title">Seus amigos e sua família só estão esperando o link para descobrir <span>quem tiraram no Amigo Secreto.</span></h2>
            <p>Os nomes que você escolheu já estão aqui. Confira a lista antes de seguir.</p>
          </div>
          <div className={styles.participantCard}>
            <div className={styles.listHeader}><div><strong>Participantes</strong><small>{quizData ? `${quizData.names.length} pessoas no grupo` : "Sua lista de convidados"}</small></div><span className={styles.listHeaderIcon}><Gift size={20} aria-hidden="true" /></span></div>
            {loaded && quizData ? (
              <>
                <ol className={styles.participantList}>
                  {quizData.names.map((name, index) => (
                    <li className={styles.participant} key={`${name}-${index}`}>
                      <span className={styles.participantNumber}>{String(index + 1).padStart(2, "0")}</span>
                      <span className={styles.participantName}>{name}{index === 0 && <small>Você</small>}</span>
                      {index > 0 && quizData.names.length > 2 && <button type="button" className={styles.removeParticipant} onClick={() => removeName(index)} aria-label={`Remover ${name}`}><Trash2 size={16} aria-hidden="true" /></button>}
                    </li>
                  ))}
                </ol>
                {quizData.budget && <p className={styles.budgetNote}>Valor do presente escolhido: <strong>{quizData.budget}</strong></p>}
                {extraNames.length > 0 && (
                  <form className={styles.extraNamesForm} onSubmit={saveExtraNames}>
                    {extraNames.map((name, index) => (
                      <div className={styles.extraNameRow} key={index}>
                        <label htmlFor={`extra-name-${index}`}>Nova pessoa {index + 1}</label>
                        <div><input id={`extra-name-${index}`} type="text" value={name} onChange={(event) => { setExtraNames((current) => current.map((item, currentIndex) => currentIndex === index ? event.target.value : item)); setNameError(""); }} placeholder="Digite o nome" maxLength={60} required /><button type="button" onClick={() => { setExtraNames((current) => current.filter((_, currentIndex) => currentIndex !== index)); setNameError(""); }} aria-label={`Remover campo da nova pessoa ${index + 1}`}><Trash2 size={16} aria-hidden="true" /></button></div>
                      </div>
                    ))}
                    {nameError && <p className={styles.formError} role="alert">{nameError}</p>}
                    <button className={styles.saveNames} type="submit">Salvar participantes <Check size={16} aria-hidden="true" /></button>
                  </form>
                )}
                <button className={styles.addParticipant} type="button" onClick={addNameField} disabled={quizData.names.length + extraNames.length >= 99}><Plus size={16} aria-hidden="true" /> Adicionar mais participante</button>
              </>
            ) : loaded ? (
              <div className={styles.emptyList}><p>Faça o quiz para ver seus participantes aqui.</p><Link href="/">Começar o quiz <ArrowRight size={15} aria-hidden="true" /></Link></div>
            ) : <p className={styles.loadingList}>Carregando sua lista…</p>}
          </div>
        </div>
      </section>

      <section className={styles.howSection} aria-labelledby="how-title"><div className={styles.container}>
        <div className={styles.centerIntro}><p className={styles.sectionEyebrow}>Simples de verdade</p><h2 id="how-title">Como funciona?</h2><p>Três passos para deixar a brincadeira pronta e colocar todo mundo no clima de Natal.</p></div>
        <div className={styles.stepsGrid}>
          <article className={styles.stepCard}><span className={styles.stepIcon}><Mail size={25} aria-hidden="true" /></span><span className={styles.stepNumber}>01</span><h3>Receba por e-mail</h3><p>Seu acesso chega no e-mail após a compra, com tudo organizado para começar.</p></article>
          <article className={styles.stepCard}><span className={styles.stepIcon}><Smartphone size={25} aria-hidden="true" /></span><span className={styles.stepNumber}>02</span><h3>Abra no celular</h3><p>Use pelo navegador, em uma experiência simples com formato de aplicativo.</p></article>
          <article className={styles.stepCard}><span className={styles.stepIcon}><Copy size={25} aria-hidden="true" /></span><span className={styles.stepNumber}>03</span><h3>Copie e compartilhe</h3><p>Envie o link para cada convidado e deixe a surpresa acontecer.</p></article>
        </div>
      </div></section>

      <section className={styles.scratchSection} aria-labelledby="scratch-title"><div className={styles.sectionInner}>
        <div className={styles.scratchDemo}><ScratchDemo key={demoName} name={demoName} onReveal={startMusicAfterScratch} /></div>
        <div className={styles.scratchCopy}><p className={styles.sectionEyebrow}>Surpresa em cada revelação</p><h2 id="scratch-title">Muito mais divertido que <span>papel amassado.</span></h2><p>Quando o participante recebe o link, ele abre e raspa a tela como uma raspadinha. O nome de quem ele tirou aparece ali, transformando a revelação em um momento mais divertido e especial.</p></div>
      </div></section>

      <section className={styles.keepsakeSection} aria-labelledby="keepsakes-title">
        <div className={styles.container}><div className={styles.centerIntro}><p className={styles.sectionEyebrow}>Um carinho a mais</p><h2 id="keepsakes-title">O que você pode levar também</h2><p>Para deixar a brincadeira ainda mais divertida, lembrancinhas de Natal prontinhas para imprimir: bonitas, práticas e econômicas.</p></div></div>
        <div className={styles.carouselWindow} role="region" aria-label="Carrossel de lembrancinhas de Natal"><div className={styles.carouselTrack}>
          {[0, 1].map((copyIndex) => (
            <div className={styles.carouselGroup} key={copyIndex} aria-hidden={copyIndex === 1}>
              {keepsakeImages.map(({ src, alt }) => (
                <div className={styles.keepsakeCard} key={src}>
                  <Image className={styles.keepsakeImage} src={src} alt={alt} width={1080} height={1350} sizes="(max-width: 540px) 215px, (max-width: 1200px) 22vw, 270px" />
                </div>
              ))}
            </div>
          ))}
        </div></div>
      </section>

      <section className={styles.offerSection} id="oferta" aria-labelledby="offer-title"><div className={styles.offerCard}>
        <div className={styles.coupon}><TicketPercent size={20} aria-hidden="true" /><span>CUPOM <strong className={styles.couponBlink}>BLACK FRIDAY</strong> {couponApplied ? "APLICADO" : "DISPONÍVEL"}</span>{couponApplied && <BadgeCheck size={18} aria-hidden="true" />}</div>
        <p className={styles.offerEyebrow}>Seu Natal merece essa surpresa</p><h2 id="offer-title">Deixe tudo pronto para o seu <span>Amigo Secreto Natalino</span></h2>
        <p className={styles.offerDescription}>A brincadeira completa, fácil de abrir no celular e compartilhar com quem você gosta.</p>
        <div className={styles.priceBlock} aria-live="polite">
          {couponApplied ? <><span>De <s>R$ 39,90</s></span><strong>R$ 17,00</strong><small>Pagamento único com cupom</small></> : <><span>Preço do acesso</span><strong>R$ 39,90</strong><small>Pagamento único</small></>}
        </div>
        {!couponApplied && <button className={styles.applyCouponInline} type="button" onClick={() => setCouponPopupOpen(true)}>Aplicar cupom Black Friday e pagar R$ 17</button>}
        {!couponApplied ? <button className={styles.purchaseButton} type="button" onClick={() => setCouponPopupOpen(true)}>QUERO RECEBER AGORA! <ArrowRight size={20} aria-hidden="true" /></button> : <button className={`${styles.purchaseButton} natal-shinne`} type="button" onClick={() => void openCheckout(checkoutUrl)} disabled={checkoutBusy}>{checkoutBusy ? "PREPARANDO CHECKOUT..." : "QUERO RECEBER AGORA!"} <ArrowRight size={20} aria-hidden="true" /></button>}
        {checkoutError && !exitOfferOpen && <p className={styles.checkoutError} role="alert">{checkoutError}</p>}
        <p className={styles.lifetimeAccess}><Check size={16} aria-hidden="true" /> Acesso vitalício</p>
        <p className={styles.offerTrust}><ShieldCheck size={16} aria-hidden="true" /> Compra com 7 dias de garantia</p>
      </div></section>

      <section className={styles.guaranteeSection} aria-labelledby="guarantee-title"><div className={styles.guaranteeCard}><span className={styles.guaranteeIcon}><ShieldCheck size={34} aria-hidden="true" /></span><div><p className={styles.sectionEyebrow}>Sua compra protegida</p><h2 id="guarantee-title">7 dias de garantia</h2><p>Você pode conhecer o Amigo Secreto Natalino com tranquilidade. Se mudar de ideia, peça o reembolso em até 7 dias após a compra.</p></div></div></section>

      <section className={styles.faqSection} aria-labelledby="faq-title"><div className={styles.container}><div className={styles.centerIntro}><p className={styles.sectionEyebrow}>Tire suas dúvidas</p><h2 id="faq-title">Perguntas frequentes</h2></div><div className={styles.faqList}>{questions.map(({ question, answer }) => <details className={styles.faqItem} key={question}><summary>{question}<Plus size={19} aria-hidden="true" /></summary><p>{answer}</p></details>)}</div></div></section>

      <footer className={styles.footer}><div className={styles.footerInner}><span className={styles.footerBrand}><Gift size={19} aria-hidden="true" /> Amigo Secreto Natalino</span><p>Uma surpresa simples de organizar e gostosa de compartilhar.</p><small>© {new Date().getFullYear()} Amigo Secreto Natalino</small></div></footer>
    </main>
  );
}
