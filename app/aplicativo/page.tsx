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
import { signOut } from "../login/actions";

const categorias = ["Todos", "Trends", "Post", "Natal", "Black Friday"] as const;
type CategoriaFiltro = (typeof categorias)[number];
type Aba = "home" | "favoritos" | "perfil";
const videosPorPagina = 10;

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
  const [videosEmOrdem, setVideosEmOrdem] = useState(videos);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const embaralhados = [...videos];

      for (let indice = embaralhados.length - 1; indice > 0; indice -= 1) {
        const aleatorio = Math.floor(Math.random() * (indice + 1));
        [embaralhados[indice], embaralhados[aleatorio]] = [
          embaralhados[aleatorio],
          embaralhados[indice],
        ];
      }

      setVideosEmOrdem(embaralhados);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const videosVisiveis = useMemo(() => {
    return videosEmOrdem.filter((video) => {
      const naCategoria = categoria === "Todos" || video.categoria === categoria;
      const naAba = aba !== "favoritos" || favoritos.includes(video.id);
      return naCategoria && naAba;
    });
  }, [aba, categoria, favoritos, videosEmOrdem]);

  const totalPaginas = Math.max(1, Math.ceil(videosVisiveis.length / videosPorPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const videosDaPagina = videosVisiveis.slice(
    (paginaAtual - 1) * videosPorPagina,
    paginaAtual * videosPorPagina,
  );

  const alternarFavorito = (id: string) => {
    setFavoritos((atuais) =>
      atuais.includes(id) ? atuais.filter((favorito) => favorito !== id) : [...atuais, id],
    );
  };

  const videoAtivo = videosEmOrdem.find((video) => video.id === videoAberto);
  const titulo = aba === "favoritos" ? "Seus favoritos" : "Ideias para sua loja";
  const subtitulo =
    aba === "favoritos"
      ? "Guarde aqui os vídeos que você quer rever."
      : "Inspiração pronta para virar conteúdo.";

  return (
    <main className={styles.screen}>
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
                  {videosVisiveis.length} {videosVisiveis.length === 1 ? "vídeo" : "vídeos"}
                </span>
              </div>

              {videosVisiveis.length > 0 ? (
                videosDaPagina.map((video) => {
                  const salvo = favoritos.includes(video.id);
                  return (
                    <article className={styles.videoCard} key={video.id}>
                      <div
                        className={styles.videoBackdrop}
                        role="img"
                        aria-label={`Prévia do vídeo: ${video.titulo}`}
                        style={{
                          backgroundImage: `url(https://drive.google.com/thumbnail?id=${video.arquivoId}&sz=w1200)`,
                          backgroundPosition: "center",
                          backgroundSize: "cover",
                        }}
                      />
                      <span className={styles.duration}>VÍDEO</span>
                      <button
                        className={styles.playButton}
                        type="button"
                        aria-label={`Reproduzir ${video.titulo}`}
                        onClick={() => setVideoAberto(video.id)}
                      >
                        <Play size={23} fill="currentColor" strokeWidth={1.5} />
                      </button>
                      <div className={styles.videoInfo}>
                        <div className={styles.videoCopy}>
                          <span className={styles.videoTag}>{video.categoria}</span>
                          <h3 className={styles.videoTitle}>{video.titulo}</h3>
                          <p className={styles.videoDescription}>{video.descricao}</p>
                        </div>
                        <button
                          className={`${styles.favoriteButton} ${salvo ? styles.favoriteActive : ""}`}
                          type="button"
                          aria-label={salvo ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                          aria-pressed={salvo}
                          onClick={() => alternarFavorito(video.id)}
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
