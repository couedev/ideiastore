"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Heart,
  House,
  LogOut,
  Play,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import styles from "./page.module.css";
import { videos } from "./videos";
import { postsImagens } from "./posts";
import PasswordForm from "./password-form";
import PwaInstallPrompt from "./pwa-install-prompt";
import { signOut } from "../login/actions";

const categorias = ["Todos", "Trends", "Post", "Natal", "Black Friday"] as const;
type CategoriaFiltro = (typeof categorias)[number];
type Aba = "home" | "favoritos" | "perfil";
const videosPorPagina = 10;
const conteudos = [
  ...videos.map((video) => ({ ...video, tipo: "video" as const })),
  ...postsImagens.map((post) => ({ ...post, categoria: "Post" as const, tipo: "imagem" as const })),
];

const abas: { id: Aba; label: string; icon: typeof House }[] = [
  { id: "home", label: "Início", icon: House },
  { id: "favoritos", label: "Favoritos", icon: Heart },
  { id: "perfil", label: "Perfil", icon: UserRound },
];

export default function AplicativoPage() {
  const [categoria, setCategoria] = useState<CategoriaFiltro>("Todos");
  const [aba, setAba] = useState<Aba>("home");
  const [pagina, setPagina] = useState(1);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [videoAberto, setVideoAberto] = useState<string | null>(null);
  const [conteudosEmOrdem, setConteudosEmOrdem] = useState(conteudos);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const embaralhados = [...conteudos];

      for (let indice = embaralhados.length - 1; indice > 0; indice -= 1) {
        const aleatorio = Math.floor(Math.random() * (indice + 1));
        [embaralhados[indice], embaralhados[aleatorio]] = [
          embaralhados[aleatorio],
          embaralhados[indice],
        ];
      }

      setConteudosEmOrdem(embaralhados);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const conteudosVisiveis = useMemo(() => {
    return conteudosEmOrdem.filter((conteudo) => {
      const naCategoria = categoria === "Todos" || conteudo.categoria === categoria;
      const naAba = aba !== "favoritos" || favoritos.includes(conteudo.id);
      return naCategoria && naAba;
    });
  }, [aba, categoria, favoritos, conteudosEmOrdem]);

  const totalPaginas = Math.max(1, Math.ceil(conteudosVisiveis.length / videosPorPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const conteudosDaPagina = conteudosVisiveis.slice(
    (paginaAtual - 1) * videosPorPagina,
    paginaAtual * videosPorPagina,
  );

  const alternarFavorito = (id: string) => {
    setFavoritos((atuais) =>
      atuais.includes(id) ? atuais.filter((favorito) => favorito !== id) : [...atuais, id],
    );
  };

  const videoAtivo = videos.find((video) => video.id === videoAberto);
  const titulo = aba === "favoritos" ? "Seus favoritos" : "Ideias para sua loja";
  const subtitulo =
    aba === "favoritos"
      ? "Guarde aqui os vídeos que você quer rever."
      : "Inspiração pronta para virar conteúdo.";

  return (
    <main className={styles.screen}>
      <PwaInstallPrompt />
      <div className={styles.phone}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              <Image
                className={styles.brandImage}
                src="/icon/icon-storeideias-512.png"
                alt=""
                width={34}
                height={34}
                priority
              />
            </span>
            <span>ideastore</span>
          </div>
          <button
            className={styles.avatar}
            type="button"
            aria-label="Abrir perfil"
            onClick={() => setAba("perfil")}
          >
            <UserRound size={18} />
          </button>
        </header>

        <section className={styles.content}>
          {aba === "perfil" ? (
            <>
              <div className={styles.intro}>
                <p className={styles.eyebrow}>Sua conta</p>
                <h1 className={styles.heading}>Perfil</h1>
                <p className={styles.subheading}>Um espaço para organizar suas inspirações.</p>
              </div>
              <div className={styles.profileCard}>
                <div className={styles.profileAvatar}>
                  <UserRound size={30} />
                </div>
                <h2 className={styles.profileName}>Sua loja</h2>
                <p className={styles.profileDescription}>
                  Em breve, você poderá personalizar seu perfil e deixar suas ideias ainda mais a sua cara.
                </p>
                <PasswordForm />
                <form action={signOut}>
                  <button className={styles.signOutButton} type="submit">
                    <LogOut size={15} /> Sair da minha conta
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              <div className={styles.intro}>
                <p className={styles.eyebrow}>Conteúdo que inspira</p>
                <h1 className={styles.heading}>{titulo}</h1>
                <p className={styles.subheading}>{subtitulo}</p>
              </div>

              <nav className={styles.chips} aria-label="Filtrar vídeos por categoria">
                {categorias.map((item) => (
                  <button
                    className={`${styles.chip} ${categoria === item ? styles.chipActive : ""}`}
                    type="button"
                    key={item}
                    aria-pressed={categoria === item}
                    onClick={() => {
                      setCategoria(item);
                      setPagina(1);
                    }}
                  >
                    {item}
                  </button>
                ))}
              </nav>

              <div className={styles.sectionLine}>
                <h2 className={styles.sectionTitle}>
                  {aba === "favoritos" ? "Salvos por você" : "Para se inspirar"}
                </h2>
                <span className={styles.sectionCount}>
                  {conteudosVisiveis.length} {categoria === "Post" ? "imagens" : "itens"}
                </span>
              </div>

              {conteudosVisiveis.length > 0 ? (
                conteudosDaPagina.map((conteudo) => {
                  const salvo = favoritos.includes(conteudo.id);
                  const tituloConteudo = conteudo.tipo === "video" ? conteudo.titulo : "Ideia para sua loja";
                  const descricaoConteudo = conteudo.tipo === "video"
                    ? conteudo.descricao
                    : "Uma ideia visual para sua loja.";
                  return (
                    <article className={`${styles.videoCard} ${conteudo.tipo === "imagem" ? styles.postCard : ""}`} key={conteudo.id}>
                      {conteudo.tipo === "imagem" ? (
                        <Image
                          className={styles.videoBackdrop}
                          src={conteudo.imagem}
                          alt="Ideia visual para post de loja"
                          fill
                          sizes="(max-width: 480px) 100vw, 440px"
                        />
                      ) : (
                        <div
                          className={styles.videoBackdrop}
                          role="img"
                          aria-label={`Previa do video: ${conteudo.titulo}`}
                          style={{ backgroundImage: `url(https://drive.google.com/thumbnail?id=${conteudo.arquivoId}&sz=w1200)` }}
                        />
                      )}
                      <span className={styles.duration}>{conteudo.tipo === "imagem" ? "POST" : "VIDEO"}</span>
                      {conteudo.tipo === "video" && (
                        <button
                          className={styles.playButton}
                          type="button"
                          aria-label={`Reproduzir ${conteudo.titulo}`}
                          onClick={() => setVideoAberto(conteudo.id)}
                        >
                          <Play size={23} fill="currentColor" strokeWidth={1.5} />
                        </button>
                      )}
                      <div className={styles.videoInfo}>
                        <div className={styles.videoCopy}>
                          <span className={styles.videoTag}>{conteudo.categoria}</span>
                          <h3 className={styles.videoTitle}>{tituloConteudo}</h3>
                          <p className={styles.videoDescription}>{descricaoConteudo}</p>
                        </div>
                        <button
                          className={`${styles.favoriteButton} ${salvo ? styles.favoriteActive : ""}`}
                          type="button"
                          aria-label={salvo ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                          aria-pressed={salvo}
                          onClick={() => alternarFavorito(conteudo.id)}
                        >
                          <Heart size={19} fill={salvo ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>
                    {aba === "favoritos" ? <Bookmark size={22} /> : <Sparkles size={22} />}
                  </span>
                  <h3 className={styles.emptyTitle}>
                    {aba === "favoritos" ? "Seus favoritos aparecem aqui" : "Novas ideias a caminho"}
                  </h3>
                  <p className={styles.emptyText}>
                    {aba === "favoritos"
                      ? "Toque no coração de um vídeo para salvá-lo e encontrar depois."
                      : "Estamos preparando mais vídeos para essa categoria."}
                  </p>
                </div>
              )}
              {totalPaginas > 1 && (
                <nav className={styles.pagination} aria-label="Paginação dos vídeos">
                  <button
                    className={styles.pageButton}
                    type="button"
                    aria-label="Página anterior"
                    disabled={paginaAtual === 1}
                    onClick={() => setPagina((atual) => Math.max(1, atual - 1))}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className={styles.pageLabel}>
                    Página {paginaAtual} de {totalPaginas}
                  </span>
                  <button
                    className={styles.pageButton}
                    type="button"
                    aria-label="Próxima página"
                    disabled={paginaAtual === totalPaginas}
                    onClick={() => setPagina((atual) => Math.min(totalPaginas, atual + 1))}
                  >
                    <ChevronRight size={18} />
                  </button>
                </nav>
              )}
              {aba === "home" && (
                <p className={styles.helper}>
                  <Sparkles size={13} /> Toque no vídeo para assistir à inspiração completa
                </p>
              )}
            </>
          )}
        </section>

        <nav className={styles.tabbar} aria-label="Navegação principal">
          {abas.map(({ id, label, icon: Icon }) => (
            <button
              className={`${styles.tabButton} ${aba === id ? styles.tabActive : ""}`}
              type="button"
              key={id}
              aria-label={label}
              aria-current={aba === id ? "page" : undefined}
              onClick={() => {
                setAba(id);
                setPagina(1);
              }}
            >
              <Icon size={21} strokeWidth={aba === id ? 2.4 : 1.8} />
            </button>
          ))}
        </nav>
      </div>

      {videoAtivo && (
        <div
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-label={videoAtivo.titulo}
          onClick={(event) => {
            if (event.target === event.currentTarget) setVideoAberto(null);
          }}
        >
          <div className={styles.modalPanel}>
            <button
              className={styles.modalClose}
              type="button"
              aria-label="Fechar vídeo"
              onClick={() => setVideoAberto(null)}
            >
              <X size={20} />
            </button>
            <iframe
              className={styles.iframe}
              src={`https://drive.google.com/file/d/${videoAtivo.arquivoId}/preview`}
              title={videoAtivo.titulo}
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </main>
  );
}
