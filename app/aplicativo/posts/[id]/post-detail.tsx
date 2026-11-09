"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Copy, ExternalLink, Image as ImageIcon } from "lucide-react";
import type { PostImagem } from "../../posts";
import styles from "./post-detail.module.css";

const promptText =
  "Use a primeira imagem apenas como referência de estilo, enquadramento e composição. Crie uma arte original para minha loja usando o produto da segunda imagem. Preserve o produto real, sem inventar características. Não copie marcas, logotipos ou textos da referência. Deixe a arte pronta para uma publicação no Instagram.";

export default function PostDetail({ post }: { post: PostImagem }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [promptCopied, setPromptCopied] = useState(false);

  async function copyImage() {
    setCopyState("idle");
    try {
      if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
        throw new Error("A cópia de imagens não está disponível neste navegador.");
      }

      const response = await fetch(`/api/posts/${encodeURIComponent(post.id)}/image`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Não foi possível carregar a imagem.");

      const bitmap = await createImageBitmap(await response.blob());
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Não foi possível preparar a imagem.");
      context.drawImage(bitmap, 0, 0);
      bitmap.close();

      const png = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Não foi possível preparar a imagem."));
        }, "image/png");
      });

      await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(promptText);
      setPromptCopied(true);
      window.setTimeout(() => setPromptCopied(false), 2200);
    } catch {
      setPromptCopied(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link className={styles.backLink} href="/aplicativo">
          <ArrowLeft size={17} aria-hidden="true" />
          Voltar para as ideias
        </Link>

        <header className={styles.heading}>
          <p className={styles.eyebrow}>Inspiração para sua loja</p>
          <h1>Use esta imagem como referência</h1>
          <p>Veja a imagem inteira e use a ideia para criar um post com os produtos da sua loja.</p>
        </header>

        <figure className={styles.imageCard}>
          <Image
            className={styles.image}
            src={post.imagem}
            alt="Imagem de referência para criar um post de loja"
            fill
            priority
            sizes="(max-width: 760px) 100vw, 760px"
          />
        </figure>

        <div className={styles.imageActions}>
          <button className={styles.copyButton} type="button" onClick={copyImage}>
            {copyState === "copied" ? <Check size={18} /> : <Copy size={18} />}
            {copyState === "copied" ? "Imagem copiada" : "Copiar imagem"}
          </button>
          <a className={styles.openButton} href={post.imagem} target="_blank" rel="noreferrer">
            <ExternalLink size={17} aria-hidden="true" />
            Abrir imagem
          </a>
        </div>
        {copyState === "error" && (
          <p className={styles.copyMessage} role="alert">
            Não foi possível copiar neste navegador. Abra a imagem e salve-a no dispositivo.
          </p>
        )}
        {copyState === "copied" && (
          <p className={styles.copyMessage} role="status">
            Pronto! Agora você pode colar a imagem no ChatGPT ou no Gemini.
          </p>
        )}

        <section className={styles.instructions} aria-labelledby="instructions-title">
          <div className={styles.instructionsTitle}>
            <span className={styles.instructionsIcon}><ImageIcon size={19} aria-hidden="true" /></span>
            <div>
              <p className={styles.eyebrow}>Do exemplo ao seu post</p>
              <h2 id="instructions-title">Como usar esta referência</h2>
            </div>
          </div>
          <ol className={styles.steps}>
            <li>Separe uma foto do produto que você quer divulgar na sua loja.</li>
            <li>Copie esta imagem e envie-a no ChatGPT ou no Gemini junto com a foto do seu produto.</li>
            <li>Use o texto abaixo para pedir uma arte inspirada no exemplo, adaptada à sua loja.</li>
          </ol>

          <div className={styles.promptCard}>
            <p>{promptText}</p>
            <button className={styles.promptButton} type="button" onClick={copyPrompt}>
              {promptCopied ? <Check size={16} /> : <Copy size={16} />}
              {promptCopied ? "Prompt copiado" : "Copiar prompt"}
            </button>
          </div>
          <p className={styles.tip}>
            Troque “Instagram” pelo formato que você precisa e peça para incluir o nome, as cores e as informações da sua loja.
          </p>
        </section>
      </div>
    </main>
  );
}
