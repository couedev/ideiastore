"use client";

import { useEffect, useState } from "react";
import { Gift, LockKeyhole, LogOut, RefreshCw } from "lucide-react";
import PasswordForm from "./password-form";
import SecretSantaDashboard from "./secret-santa-dashboard";
import AppTabBar from "./app-tabbar";
import { signOut } from "../login/actions";

type PasswordSetup = "checking" | "required" | "complete" | "error";

export default function AplicativoPage() {
  const [passwordSetup, setPasswordSetup] = useState<PasswordSetup>("checking");

  useEffect(() => {
    let active = true;

    void fetch("/api/auth/password-status", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Não foi possível verificar o acesso.");
        return response.json() as Promise<{ needsPassword: boolean }>;
      })
      .then(({ needsPassword }) => {
        if (active) setPasswordSetup(needsPassword ? "required" : "complete");
      })
      .catch(() => {
        if (active) setPasswordSetup("error");
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
    <main className={`flex min-h-screen items-center justify-center bg-background px-5 pt-10 text-foreground ${passwordSetup === "complete" ? "pb-32" : "pb-10"}`}>
      <section
        className={`w-full rounded-[2rem] border border-[#15362C]/10 bg-white p-7 shadow-[0_24px_80px_rgba(21,54,44,0.10)] sm:p-10 ${passwordSetup === "complete" ? "max-w-3xl" : "max-w-lg"}`}
        aria-live="polite"
      >
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-[#15362C] text-[#F8F5EA]">
            <Gift size={24} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#721218]">
              Amigo Secreto
            </p>
            <p className="text-sm font-semibold text-[#15362C]/65">Natalino</p>
          </div>
        </div>

        {passwordSetup === "checking" && (
          <div className="py-6 text-center">
            <p className="text-lg font-semibold">Preparando seu acesso</p>
            <p className="mt-2 text-sm leading-6 text-[#15362C]/65">
              Estamos conferindo sua conta. Isso leva só um instante.
            </p>
          </div>
        )}

        {passwordSetup === "error" && (
          <div className="py-4 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Não conseguimos confirmar seu acesso</h1>
            <p className="mt-3 text-sm leading-6 text-[#15362C]/65">
              Confira sua conexão e tente novamente.
            </p>
            <button
              className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#15362C] px-5 font-semibold text-white transition hover:bg-[#15362C]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#721218]"
              type="button"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={17} aria-hidden="true" />
              Tentar novamente
            </button>
          </div>
        )}

        {passwordSetup === "required" && (
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#721218]">
              Quase lá
            </p>
            <h1 className="text-2xl font-bold tracking-tight">Crie uma senha para sua conta</h1>
            <p className="mt-3 mb-6 text-sm leading-6 text-[#15362C]/65">
              Use sua senha para voltar ao Amigo Secreto Natalino com facilidade.
            </p>
            <PasswordForm
              variant="onboarding"
              onComplete={() => setPasswordSetup("complete")}
            />
          </div>
        )}

        {passwordSetup === "complete" && (
          <div>
            <SecretSantaDashboard />

            <details className="mt-10 rounded-2xl border border-[#15362C]/10 bg-[#F8F5EA]/70 p-4">
              <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold marker:hidden">
                <LockKeyhole size={17} aria-hidden="true" />
                Configurações da conta
              </summary>
              <div className="mt-5 border-t border-[#15362C]/10 pt-5">
                <PasswordForm />
                <form action={signOut} className="mt-5">
                  <button
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#15362C]/20 px-4 text-sm font-semibold text-[#15362C] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#721218]"
                    type="submit"
                  >
                    <LogOut size={16} aria-hidden="true" />
                    Sair da conta
                  </button>
                </form>
              </div>
            </details>
          </div>
        )}
      </section>
    </main>
    {passwordSetup === "complete" && <AppTabBar active="sorteio" />}
    </>
  );
}
