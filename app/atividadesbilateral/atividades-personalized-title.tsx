"use client";

import { useSyncExternalStore } from "react";

const storageKey = "atividades-bilaterais-quiz";

function getQuizSnapshot() {
  try {
    return window.sessionStorage.getItem(storageKey)
      ?? window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function subscribeToQuizChanges(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getPersonName(rawData: string | null) {
  try {
    if (!rawData) return "";
    const data: unknown = JSON.parse(rawData);
    if (!data || typeof data !== "object") return "";
    const personName = (data as Record<string, unknown>).personName;
    return typeof personName === "string" ? personName.trim() : "";
  } catch {
    return "";
  }
}

export default function AtividadesPersonalizedTitle() {
  const quizSnapshot = useSyncExternalStore(subscribeToQuizChanges, getQuizSnapshot, () => null);
  const personName = getPersonName(quizSnapshot);

  return personName ? `Personalizadas para ${personName}` : "Personalizadas para você";
}
