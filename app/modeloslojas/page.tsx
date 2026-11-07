
import { Montserrat } from "next/font/google";
import Image from "next/image";
import { Check, ChevronDown, Image as ImageIcon, Play, ShieldCheck } from "lucide-react";
import styles from "./page.module.css";
import "./shinne.css";
import DepoimentosCarousel from "./depoimentos-carousel";
import OfertaEssencialAction from "./oferta-essencial-action";
import MetaPageView from "./meta-page-view";
import { checkoutLinks } from "./checkout-links";
import heroImage from "../../public/Ideias que inspiram sua loja.webp";
import reveillonImage from "../../public/Carrossel de Réveillon Glamouroso.webp";
import blackFridayImage from "../../public/Carrossel promocional Black Friday.webp";
import natalImage from "../../public/Ideias de Natal em Reels Festivos.webp";
import postsImage from "../../public/Carrossel de Moda Rosa e Neutro.webp";
import bonusImage from "../../public/Infinite Carousel Video Cards.webp";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

function SparkleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const reelIdeas = [
  {
    image: "/carrossel/reels-01.webp",
    label: "NOVIDADE NA LOJA",
    title: "Mostre a peça que acabou de chegar",
  },
  {
    image: "/carrossel/reels-02.webp",
    label: "DICA RÁPIDA",
    title: "Três formas de usar o mesmo produto",
  },
  {
    image: "/carrossel/reels-03.webp",
    label: "BASTIDORES",
    title: "Prepare um pedido junto com a cliente",
  },
  {
    image: "/carrossel/reels-04.webp",
    label: "VITRINE DA SEMANA",
    title: "Destaque seus favoritos para a estação",
  },
  {
    image: "/carrossel/reels-05.webp",
    label: "COMBINAÇÃO PERFEITA",
    title: "Monte um look completo com peças da loja",
  },
  {
    image: "/carrossel/reels-06.webp",
    label: "IDEIA DE CONTEÚDO",
    title: "Crie um vídeo para apresentar sua loja",
  },
  {
    image: "/carrossel/reels-07.webp",
    label: "MOSTRE SEU PRODUTO",
    title: "Destaque os detalhes que fazem a diferença",
  },
  {
    image: "/carrossel/reels-08.webp",
    label: "INSPIRAÇÃO PARA REELS",
    title: "Transforme uma ideia simples em conteúdo",
  },
];

const conteudosIncluidos: Array<{
  titulo: string;
  subtitulo: string;
  imagem?: typeof reveillonImage;
  altImagem?: string;
  aviso?: string;
}> = [
  {
    titulo: "IDEIAS DE REELS PARA VENDER NO FIM DE ANO",
    imagem: reveillonImage,
    altImagem: "Montagem de Reels de Réveillon para vender no fim de ano",
    subtitulo: "Conteúdos para apresentar seus produtos e aproveitar as vendas da temporada.",
  },
  {
    titulo: "IDEIAS DE REELS DE BLACK FRIDAY",
    imagem: blackFridayImage,
    altImagem: "Montagem de vídeos promocionais para Black Friday",
    subtitulo: "Escolha um modelo de vídeo para divulgar sua promoção de fim de ano.",
  },
  {
    titulo: "IDEIAS DE VÍDEOS DE NATAL",
    imagem: natalImage,
    altImagem: "Montagem de ideias de Reels festivos para o Natal",
    subtitulo: "Crie conteúdos com clima natalino e destaque opções para presentear.",
  },
  {
    titulo: "IDEIAS DE POST PARA SUA LOJA",
    imagem: postsImage,
    altImagem: "Exemplos de carrosséis de moda em tons de rosa e neutro",
    subtitulo: "Inspirações para manter o perfil da sua loja sempre atualizado.",
    aviso:
      "Você pode copiar esses modelos de post com um clique e enviar para o ChatGPT ou Gemini junto com sua imagem de referência para criar uma versão para a sua loja.",
  },
];

const recursosEssenciais = [
  "+100 ideias de Reels",
  "Ideias de vídeos Trends virais",
  "Ideias de posts para sua loja",
  "Acesso com um clique pelo app",
  "Acesso vitalício",
];

const ofertas = [
  {
    nome: "ESSENCIAL",
    preco: "17",
    descricao: "As ideias para começar a postar com praticidade.",
    recursos: recursosEssenciais,
    botao: "QUERO O ESSENCIAL",
    completo: false,
  },
  {
    nome: "COMPLETO",
    preco: "37",
    descricao: "Mais conteúdos para aproveitar cada campanha do fim de ano.",
    recursos: [
      ...recursosEssenciais,
      "Vídeos para o Natal",
      "Reels para a Black Friday",
      "Ideias de Reels para o fim de ano",
      "Atualizações sem custo com novas ideias",
    ],
    botao: "QUERO O COMPLETO",
    completo: true,
  },
];

const perguntasFrequentes = [
  {
    pergunta: "E se eu não gostar?",
    resposta:
      "Você pode experimentar à vontade. Se não gostar, peça reembolso em até 7 dias após a compra.",
  },
  {
    pergunta: "Como eu recebo?",
    resposta:
      "Assim que concluir a compra, as instruções de acesso chegam no e-mail informado no pagamento.",
  },
  {
    pergunta: "Demora quanto tempo para receber?",
    resposta: "O acesso é imediato. O e-mail chega em menos de 1 minuto após a compra.",
  },
  {
    pergunta: "É um app?",
    resposta:
      "Sim. Você acessa como um aplicativo e pode adicioná-lo à tela inicial do celular para abrir quando quiser.",
  },
  {
    pergunta: "Tem mensalidade?",
    resposta: "Não. O pagamento é único e o acesso é vitalício.",
  },
  {
    pergunta: "Vou receber novas ideias?",
    resposta:
      "No plano Completo, você recebe atualizações com novas ideias sem custo adicional.",
  },
];

export default function ModelosLojasPage() {
  return (
    <>
    <MetaPageView />
    <main className={`${styles.page} ${montserrat.className}`}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.ambientGlow} aria-hidden="true" />

        <div className={styles.container}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowIcon}>
              <SparkleIcon size={14} />
            </span>
            IDEIAS PRONTAS PARA SUA LOJA
          </div>

          <h1 className={styles.headline} id="hero-title">
            Mais de <span className={styles.gradientText}>100 ideias</span>{" "}
            de Reels para sua loja{" "}
            <span className={styles.gradientText}>
              vender mais no fim de ano.
            </span>
          </h1>

          <p className={styles.description}>
            Você não precisa perder tempo pensando no que postar! Tenha ideias de Reels prontas para criar conteúdos todos os dias e <strong>aproveitar as vendas de fim de ano.</strong>
          </p>

          <div className={styles.mediaWrapper}>
            <div className={styles.mediaGlow} aria-hidden="true" />

            <div className={styles.mediaFrame}>
              <Image
                className={styles.heroImage}
                src={heroImage}
                alt="Mulher segurando o celular com o app Ideias Store e exemplos de vídeos ao redor"
                priority
              />
            </div>

            <span className={styles.floatingSparkle} aria-hidden="true">
              <SparkleIcon size={27} />
            </span>
          </div>

          <div className={styles.actionArea}>
            <a className={styles.cta} href="#ofertas">
              <span>EU QUERO!</span>
              <ArrowIcon />
            </a>

            <p className={styles.ctaCaption}>
              <SparkleIcon size={13} />
              Inspire-se, crie e destaque sua loja!
            </p>
          </div>
        </div>
      </section>

      <section className={styles.accessSection} aria-labelledby="access-title">
        <div className={styles.accessHeader}>
          <p className={styles.accessEyebrow}>SEU CONTEÚDO, SEM COMPLICAÇÃO</p>
          <h2 className={styles.accessTitle} id="access-title">
            IDEIAS PRA VOCÊ ACESSAR COM UM{" "}
            <span className={styles.gradientText}>ÚNICO CLIQUE!</span>
          </h2>
          <p className={styles.accessDescription}>
            Não é um curso chato que voce compra e nunca mais ver. O Ideias Store fica
            a um clique,<strong > na tela do seu celular como um app.</strong>
          </p>
        </div>

        <div
          className={styles.carouselViewport}
          role="region"
          aria-label="Exemplos de ideias de Reels"
        >
          <div className={styles.carouselTrack}>
            <div className={styles.carouselGroup} role="list">
              {reelIdeas.map((idea) => (
                <article className={styles.ideaCard} key={idea.label} role="listitem">
                  <Image
                    className={styles.ideaImage}
                    src={idea.image}
                    alt={idea.title}
                    fill
                    sizes="(max-width: 480px) 220px, (max-width: 768px) 240px, 270px"
                  />
                  <span className={styles.playBadge} aria-hidden="true">
                    <Play size={22} fill="currentColor" strokeWidth={1.5} />
                  </span>
                  <span className={styles.ideaAccent} aria-hidden="true" />
                </article>
              ))}
            </div>

            <div className={styles.carouselGroup} aria-hidden="true">
              {reelIdeas.map((idea) => (
                <article className={styles.ideaCard} key={`repeat-${idea.label}`}>
                  <Image
                    className={styles.ideaImage}
                    src={idea.image}
                    alt=""
                    fill
                    sizes="(max-width: 480px) 220px, (max-width: 768px) 240px, 270px"
                  />
                  <span className={styles.playBadge} aria-hidden="true">
                    <Play size={22} fill="currentColor" strokeWidth={1.5} />
                  </span>
                  <span className={styles.ideaAccent} aria-hidden="true" />
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.focusSection} aria-labelledby="focus-title">
        <div className={styles.focusContent}>
          <h2 className={styles.focusTitle} id="focus-title">
            SE PREOCUPE APENAS EM VENDER
          </h2>
          <p className={styles.focusDescription}>
            <strong>Tenha ideias de vídeos e posts</strong> para publicar todos os dias. {" "}
            <strong>Pare de se preocupar</strong> com o que postar e foque no que importa: {" "}
            <strong>vender.</strong>
          </p>
        </div>
      </section>

      <section className={styles.deliverySection} aria-labelledby="delivery-title">
        <div className={styles.deliveryHeader}>
          <p className={styles.accessEyebrow}>CONTEÚDO PARA SUA LOJA</p>
          <h2 className={styles.accessTitle} id="delivery-title">
            O QUE VOCÊ <span className={styles.gradientText}>VAI RECEBER!</span>
          </h2>
          <p className={styles.accessDescription}>
            Ideias práticas para criar conteúdo e divulgar sua loja em cada momento do fim de ano.
          </p>
        </div>

        <div className={styles.deliveryGrid}>
          {conteudosIncluidos.map((conteudo) => (
            <article className={styles.deliveryCard} key={conteudo.titulo}>
              <h3 className={styles.deliveryTitle}>{conteudo.titulo}</h3>
              <p className={styles.deliverySubtitle}>{conteudo.subtitulo}</p>
              <div
                className={`${styles.deliveryImageSpace} ${conteudo.imagem ? styles.deliveryImageFilled : ""}`}
                role={conteudo.imagem ? undefined : "img"}
                aria-label={conteudo.imagem ? undefined : `Espaço reservado para imagem: ${conteudo.titulo}`}
              >
                {conteudo.imagem ? (
                  <Image
                    className={styles.deliveryImage}
                    src={conteudo.imagem}
                    alt={conteudo.altImagem ?? conteudo.titulo}
                    fill
                    sizes="(max-width: 480px) calc(100vw - 74px), (max-width: 768px) 45vw, 500px"
                  />
                ) : (
                  <ImageIcon size={30} strokeWidth={1.5} aria-hidden="true" />
                )}
              </div>
              {conteudo.aviso && (
                <p className={styles.deliveryNote}>
                  <SparkleIcon size={15} />
                  <span>{conteudo.aviso}</span>
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      <DepoimentosCarousel />

      <section className={styles.bonusSection} aria-labelledby="bonus-title">
        <div className={styles.bonusHeader}>
          <p className={styles.accessEyebrow}>BÔNUS ESPECIAL POR TEMPO LIMITADO</p>
          <h2 className={styles.accessTitle} id="bonus-title">
            RECEBA TOTALMENTE <span className={styles.gradientText}>GRÁTIS</span>
          </h2>
          <p className={styles.accessDescription}>
            Adquirindo nos próximos <strong className={styles.bonusTime}>10 minutos</strong>, você recebe também:
          </p>
          <h3 className={styles.bonusTitle}>IDEIAS DE VÍDEOS TRENDS</h3>
          <p className={styles.bonusDescription}>
            Com altas chances de viralizar e inspirar seu próximo conteúdo.
          </p>
        </div>

        <div className={styles.bonusImageSpace}>
          <Image
            className={styles.bonusImage}
            src={bonusImage}
            alt="Montagem de ideias de vídeos Trends em tons rosados"
            fill
            sizes="(max-width: 900px) calc(100vw - 36px), 860px"
          />
        </div>

        <div className={styles.actionArea}>
          <a className={styles.cta} href="#ofertas">
            <span>QUERO O BÔNUS</span>
            <ArrowIcon />
          </a>
        </div>
      </section>

      <section className={styles.offersSection} id="ofertas" aria-labelledby="offers-title">
        <div className={styles.offersHeader}>
          <p className={styles.accessEyebrow}>ESCOLHA SEU ACESSO</p>
          <h2 className={styles.accessTitle} id="offers-title">
            IDEIAS PARA SUA LOJA <span className={styles.gradientText}>VENDER MAIS</span>
          </h2>
          <p className={styles.accessDescription}>
            Escolha o pacote que combina com os conteúdos que você quer criar.
          </p>
        </div>

        <div className={styles.offersGrid}>
          {ofertas.map((oferta) => (
            <article
              className={`${styles.offerCard} ${oferta.completo ? styles.offerCardFeatured : ""}`}
              key={oferta.nome}
            >
              {oferta.completo && <span className={styles.offerBadge}>PACOTE COMPLETO</span>}
              <div className={styles.offerTop}>
                <h3 className={styles.offerName}>{oferta.nome}</h3>
                <p className={styles.offerDescription}>{oferta.descricao}</p>
                <p className={styles.offerPrice} aria-label={`R$ ${oferta.preco},00`}>
                  <span className={styles.offerCurrency}>R$</span>
                  <span className={styles.offerAmount}>{oferta.preco}</span>
                  <span className={styles.offerCents}>,00</span>
                </p>
              </div>

              <ul className={styles.offerFeatures}>
                {oferta.recursos.map((recurso) => (
                  <li className={styles.offerFeature} key={recurso}>
                    <span className={styles.offerCheck} aria-hidden="true">
                      <Check size={15} strokeWidth={2.7} />
                    </span>
                    <span>{recurso}</span>
                  </li>
                ))}
              </ul>

              {oferta.completo ? (
                <a
                  className={`${styles.offerButton} ${styles.offerButtonFeatured} complete-offer-shinne`}
                  href={checkoutLinks.completo}
                >
                  {oferta.botao}
                  <ArrowIcon />
                </a>
              ) : (
                <OfertaEssencialAction />
              )}
              <p className={styles.offerPaymentNote}>Pagamento único</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.faqSection} aria-labelledby="faq-title">
        <div className={styles.faqHeader}>
          <p className={styles.accessEyebrow}>TIRE SUAS DÚVIDAS</p>
          <h2 className={styles.accessTitle} id="faq-title">
            PERGUNTAS <span className={styles.gradientText}>FREQUENTES</span>
          </h2>
        </div>

        <div className={styles.faqList}>
          {perguntasFrequentes.map((item, index) => (
            <details className={styles.faqItem} key={item.pergunta} open={index === 0}>
              <summary className={styles.faqQuestion}>
                <span>{item.pergunta}</span>
                <ChevronDown className={styles.faqChevron} size={20} aria-hidden="true" />
              </summary>
              <p className={styles.faqAnswer}>{item.resposta}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.guaranteeSection} aria-labelledby="guarantee-title">
        <div className={styles.guaranteeContent}>
          <span className={styles.guaranteeIcon} aria-hidden="true">
            <ShieldCheck size={39} strokeWidth={1.7} />
          </span>
          <p className={styles.guaranteeEyebrow}>SUA COMPRA SEM RISCO</p>
          <h2 className={styles.guaranteeTitle} id="guarantee-title">
            GARANTIA DE <span>7 DIAS</span> OU SEU DINHEIRO DE VOLTA
          </h2>
          <p className={styles.guaranteeDescription}>
            Experimente o Ideias Store por 7 dias. Se não gostar, solicite o reembolso dentro desse prazo.
          </p>
          <div className={styles.actionArea}>
            <a className={styles.cta} href="#ofertas">
              <span>EU ACEITO A PROPOSTA</span>
              <ArrowIcon />
            </a>
          </div>
        </div>
      </section>
    </main>

    <footer className={`${styles.siteFooter} ${montserrat.className}`}>
      <div className={styles.footerMain}>
        <div className={styles.footerBrand}>
          <Image
            className={styles.footerLogo}
            src="/icon/icon-storeideias-512.png"
            alt=""
            width={40}
            height={40}
          />
          <div>
            <strong>Ideias Store</strong>
            <p>Ideias para criar conteúdo e vender mais na sua loja.</p>
          </div>
        </div>
        <nav className={styles.footerNav} aria-label="Links do rodapé">
          <a href="#hero-title">Início</a>
          <a href="#ofertas">Ofertas</a>
          <a href="#faq-title">Perguntas frequentes</a>
        </nav>
      </div>
      <p className={styles.footerBottom}>© Ideias Store. Todos os direitos reservados.</p>
    </footer>
    </>
  );
}
