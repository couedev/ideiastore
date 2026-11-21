"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CandyCane, Check, Copy, Eye, EyeOff, Gift, Plus, RefreshCw, Trash2, UsersRound } from "lucide-react";
import styles from "./secret-santa-dashboard.module.css";

type Participant = { id: string; position: number; name: string; token: string };
type Group = {
  id: string;
  budget: string;
  createdAt: string;
  myRecipient: string;
  participants: Participant[];
};
type DashboardData = {
  creatorName: string;
  groups: Array<{ id: string; budget: string; createdAt: string }>;
  group: Group | null;
};
type QuizDraft = { names: string[]; budget: string };

const quizStorageKey = "amigo-secreto-natalino-quiz";
const budgetOptions = ["Até R$ 50", "Até R$ 100", "Até R$ 200", "Qualquer valor"];

function readQuizDraft(): QuizDraft | null {
  for (const type of ["sessionStorage", "localStorage"] as const) {
    try {
      const raw = window[type].getItem(quizStorageKey);
      if (!raw) continue;
      const data = JSON.parse(raw) as { names?: unknown; budget?: unknown };
      if (!Array.isArray(data.names) || data.names.length < 2 || data.names.length > 99
        || !data.names.every((name) => typeof name === "string")) continue;
      const names = (data.names as string[]).map((name) => name.trim());
      if (names.some((name) => !name || name.length > 60)) continue;
      if (new Set(names.map((name) => name.toLocaleLowerCase("pt-BR"))).size !== names.length) continue;
      return { names, budget: typeof data.budget === "string" && budgetOptions.includes(data.budget) ? data.budget : "" };
    } catch {
      // Um rascunho antigo ou inacessível não impede a criação de um novo sorteio.
    }
  }
  return null;
}

async function fetchDashboard(groupId?: string): Promise<DashboardData> {
  const url = groupId ? `/api/amigo-secreto?grupo=${encodeURIComponent(groupId)}` : "/api/amigo-secreto";
  const response = await fetch(url, { cache: "no-store" });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error || "Não foi possível carregar o sorteio.");
  return result as DashboardData;
}

export default function SecretSantaDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [names, setNames] = useState<string[]>(["", ""]);
  const [budget, setBudget] = useState("");
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);
  const [createdGroupId, setCreatedGroupId] = useState("");
  const [showMine, setShowMine] = useState(false);
  const [copiedId, setCopiedId] = useState("");
  const [manualLink, setManualLink] = useState("");

  useEffect(() => {
    let active = true;
    void fetchDashboard()
      .then((result) => {
        if (!active) return;
        setData(result);
        if (!result.group) {
          const draft = readQuizDraft();
          setNames(draft?.names ?? [result.creatorName, ""]);
          setBudget(draft?.budget ?? "");
          setFormOpen(true);
        }
      })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Não foi possível carregar o sorteio."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function loadGroup(groupId?: string) {
    setLoading(true);
    setError("");
    setShowMine(false);
    setCopiedId("");
    setManualLink("");
    try {
      const result = await fetchDashboard(groupId);
      setData(result);
      setFormOpen(false);
      setCreatedGroupId("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar o sorteio.");
    } finally {
      setLoading(false);
    }
  }

  function startAnotherGroup() {
    if (!data) return;
    setNames([data.creatorName, ""]);
    setBudget("");
    setNameError("");
    setCreatedGroupId("");
    setFormOpen(true);
    setShowMine(false);
  }

  function addParticipant() {
    if (names.length < 99) setNames((current) => [...current, ""]);
  }

  async function createGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = names.map((name) => name.replace(/\s+/g, " ").trim());
    if (normalized.some((name) => !name || name.length > 60)) {
      setNameError("Preencha todos os nomes com até 60 caracteres.");
      return;
    }
    if (new Set(normalized.map((name) => name.toLocaleLowerCase("pt-BR"))).size !== normalized.length) {
      setNameError("Cada participante precisa ter um nome diferente.");
      return;
    }

    setSaving(true);
    setNameError("");
    try {
      const response = await fetch("/api/amigo-secreto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: normalized, budget }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || typeof result?.groupId !== "string") {
        throw new Error(result?.error || "Não foi possível fazer o sorteio.");
      }
      setCreatedGroupId(result.groupId);
      await loadGroup(result.groupId);
    } catch (cause) {
      setNameError(cause instanceof Error ? cause.message : "Não foi possível fazer o sorteio.");
    } finally {
      setSaving(false);
    }
  }

  async function copyInvitation(participant: Participant) {
    const link = new URL(`/amigo-secreto/${participant.token}`, window.location.origin).toString();
    setManualLink("");
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(participant.id);
    } catch {
      setCopiedId("");
      setManualLink(link);
    }
  }

  if (loading && !data) return <p className={styles.status}>Carregando seu Amigo Secreto Natalino...</p>;
  if (!data) return (
    <div className={styles.errorState} role="alert">
      <p>{error || "Não foi possível carregar seu acesso."}</p>
      <button type="button" onClick={() => window.location.reload()}><RefreshCw size={16} /> Tentar novamente</button>
    </div>
  );

  return (
    <div className={styles.dashboard}>
      <p className={styles.eyebrow}><CandyCane size={15} aria-hidden="true" /> Seu Amigo Secreto Natalino</p>
      <h1>{formOpen ? "Vamos fazer o seu sorteio" : "Sua brincadeira está pronta!"}</h1>
      <p className={styles.intro}>{formOpen
        ? "Confirme os nomes antes de sortear. Depois, cada pessoa terá seu próprio link para descobrir quem tirou."
        : "Envie um link para cada participante. O primeiro nome é o seu, e você pode ver quem tirou."}</p>

      {error && <p className={styles.error} role="alert">{error}</p>}

      {formOpen ? (
        <form className={styles.form} onSubmit={createGroup}>
          <div className={styles.formHeader}><UsersRound size={20} aria-hidden="true" /><div><strong>Participantes</strong><span>{names.length} pessoas no grupo</span></div></div>
          <div className={styles.fields}>
            {names.map((name, index) => (
              <div className={styles.nameRow} key={index}>
                <label htmlFor={`draw-name-${index}`}>{index === 0 ? "Seu nome (organizador)" : `Participante ${index + 1}`}</label>
                <div className={styles.inputWrap}>
                  <input id={`draw-name-${index}`} value={name} onChange={(event) => { setNames((current) => current.map((item, currentIndex) => currentIndex === index ? event.target.value : item)); setNameError(""); }} maxLength={60} autoComplete="off" placeholder={index === 0 ? "Seu nome" : "Nome da pessoa"} required />
                  {index > 0 && names.length > 2 && <button type="button" onClick={() => setNames((current) => current.filter((_, currentIndex) => currentIndex !== index))} aria-label={`Remover participante ${index + 1}`}><Trash2 size={17} aria-hidden="true" /></button>}
                </div>
              </div>
            ))}
          </div>
          <button className={styles.add} type="button" onClick={addParticipant} disabled={names.length >= 99}><Plus size={17} aria-hidden="true" /> Adicionar participante</button>
          <label className={styles.budgetLabel} htmlFor="draw-budget">Valor sugerido para o presente</label>
          <select id="draw-budget" className={styles.budgetSelect} value={budget} onChange={(event) => setBudget(event.target.value)}>
            <option value="">Ainda não definido</option>
            {budgetOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          {nameError && <p className={styles.error} role="alert">{nameError}</p>}
          {createdGroupId && <div className={styles.createdNotice} role="status"><p>O sorteio foi criado, mas a lista não carregou. Tente abrir o grupo sem fazer um novo sorteio.</p><button type="button" onClick={() => void loadGroup(createdGroupId)}>Abrir sorteio criado</button></div>}
          <button className={styles.primary} type="submit" disabled={saving || Boolean(createdGroupId)}><Gift size={19} aria-hidden="true" /> {saving ? "Fazendo sorteio..." : "FAZER SORTEIO"}</button>
          {data.group && <button className={styles.cancel} type="button" onClick={() => setFormOpen(false)}>Voltar ao sorteio atual</button>}
        </form>
      ) : data.group ? (
        <div className={styles.groupArea}>
          {data.groups.length > 1 && (
            <div className={styles.groupPicker}>
              <label htmlFor="saved-group">Escolher sorteio</label>
              <select id="saved-group" value={data.group.id} onChange={(event) => void loadGroup(event.target.value)} disabled={loading}>
                {data.groups.map((group, index) => <option key={group.id} value={group.id}>Sorteio {data.groups.length - index} · {new Date(group.createdAt).toLocaleDateString("pt-BR")}</option>)}
              </select>
            </div>
          )}
          <div className={styles.groupHeader}>
            <div><strong>Participantes</strong><span>{data.group.participants.length} pessoas no grupo{data.group.budget ? ` · Presente ${data.group.budget.toLowerCase()}` : ""}</span></div>
            <span className={styles.groupIcon}><Gift size={21} aria-hidden="true" /></span>
          </div>
          <ol className={styles.list}>
            {data.group.participants.map((participant, index) => (
              <li className={styles.participant} key={participant.id}>
                <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.person}><strong>{participant.name}</strong>{index === 0 && <small>Você · organizador</small>}</span>
                {index === 0 ? (
                  <button className={styles.action} type="button" onClick={() => setShowMine((shown) => !shown)} aria-expanded={showMine}>
                    {showMine ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}{showMine ? "Ocultar" : "Ver"}
                  </button>
                ) : (
                  <button className={styles.action} type="button" onClick={() => void copyInvitation(participant)}>
                    {copiedId === participant.id ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}{copiedId === participant.id ? "Copiado" : "Copiar"}
                  </button>
                )}
              </li>
            ))}
          </ol>
          {showMine && <div className={styles.myResult} role="status"><span>Você tirou</span><strong>{data.group.myRecipient}</strong><p>Guarde a surpresa até a hora da revelação!</p></div>}
          {manualLink && <div className={styles.manualLink}><label htmlFor="manual-invite-link">Copie o link manualmente:</label><input id="manual-invite-link" value={manualLink} readOnly onFocus={(event) => event.target.select()} /></div>}
          <p className={styles.hint}>Toque em “Copiar” e envie o link para a pessoa certa. Cada convite é individual.</p>
          <button className={styles.newGroup} type="button" onClick={startAnotherGroup}><Plus size={17} aria-hidden="true" /> Criar outro amigo secreto</button>
        </div>
      ) : null}
    </div>
  );
}
