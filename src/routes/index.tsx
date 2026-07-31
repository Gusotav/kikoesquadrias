import { createFileRoute } from "@tanstack/react-router";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import logoAsset from "@/assets/LOGO.png.asset.json";
import logoWhiteAsset from "@/assets/LOGO_BRANCA.png.asset.json";
import heroAsset from "@/assets/Hero.jpeg.asset.json";
import g17Asset from "@/assets/1_58.jpg.asset.json";
import g25Asset from "@/assets/1_51.jpg.asset.json";

import {
  casa_na_arvore as driveCasaNaArvore,
  escritorio_qnco as driveEscritorioQnco,
  obra_rio as driveObraRio,
} from "@/assets/drive";
import {
  fazenda_da_grama as driveFazendaDaGrama,
  haras_indaiatuba as driveHarasIndaiatuba,
  marcelo_baracat as driveMarceloBaracat,
  obra_enrique_junior as driveObraEnriqueJunior,
  obra_haras as driveObraHaras,
} from "@/assets/drive2";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:image", content: heroAsset.url },
      { name: "twitter:image", content: heroAsset.url },
    ],
    links: [{ rel: "preload", as: "image", href: heroAsset.url, fetchpriority: "high" } as never],
  }),
  component: KikoLanding,
});

/* ----------------------------- hooks ----------------------------- */

function useScrolled(threshold = 60) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function useActiveSection(ids: string[], offset = 120) {
  const [active, setActive] = useState<string>(ids[0] ?? "");
  useEffect(() => {
    const onScroll = () => {
      const pos = window.scrollY + offset;
      let current = ids[0] ?? "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= pos) current = id;
      }
      // hero / top — none active
      if (window.scrollY < offset) current = "";
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ids, offset]);
  return active;
}

/* ----------------------------- primitives ----------------------------- */

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    if (el.classList.contains("reveal-in")) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("reveal-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} data-reveal className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function Eyebrow({ children, tone = "dark" }: { children: ReactNode; tone?: "dark" | "light" }) {
  return (
    <p
      className={`flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.28em] ${
        tone === "dark" ? "text-graphite" : "text-white/60"
      }`}
    >
      <span className="h-px w-6 bg-accent" />
      {children}
    </p>
  );
}

function Button({
  children,
  variant = "primary",
  href,
  onClick,
  type = "button",
  className = "",
  ariaLabel,
}: {
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline";
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  ariaLabel?: string;
}) {
  const base =
    "group inline-flex items-center justify-center gap-2 px-6 py-3 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors duration-300 rounded-none";
  const styles = {
    primary: "bg-primary text-primary-foreground hover:bg-[color:var(--kiko-blue-deep)]",
    ghost: "bg-transparent border border-current/25 hover:border-current/70",
    outline: "bg-transparent text-primary border border-primary/25 hover:border-primary",
  }[variant];

  const content = (
    <>
      <span>{children}</span>
      <svg className="h-2.5 w-2.5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
      </svg>
    </>
  );

  if (href) {
    return (
      <a href={href} aria-label={ariaLabel} className={`${base} ${styles} ${className}`}>
        {content}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} aria-label={ariaLabel} className={`${base} ${styles} ${className}`}>
      {content}
    </button>
  );
}

/* ----------------------------- Nav ----------------------------- */

const NAV_LINKS = [
  { label: "Sobre", href: "#sobre" },
  { label: "Diferenciais", href: "#diferenciais" },
  { label: "Portfólio", href: "#portfolio" },
  { label: "Qualidade", href: "#qualidade" },
  { label: "Contato", href: "#contato" },
];

function Navbar() {
  const scrolled = useScrolled(80);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(NAV_LINKS.map((l) => l.href.slice(1)));

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "border-b border-border bg-white/92 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="container-kiko flex h-16 items-center justify-between md:h-[72px]">
        <a href="#top" className="flex items-center" aria-label="Kiko Esquadrias — Início">
          <img
            src={scrolled ? logoAsset.url : logoWhiteAsset.url}
            alt="Kiko Esquadrias"
            width={168}
            height={46}
            className="h-9 w-auto transition-opacity duration-300 md:h-12"
            style={{ filter: scrolled ? "none" : "brightness(0) invert(1)" }}
          />
        </a>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Principal">
          {NAV_LINKS.map((l) => {
            const isActive = active === l.href.slice(1);
            return (
              <a
                key={l.href}
                href={l.href}
                className={`relative text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 ${
                  isActive
                    ? scrolled
                      ? "text-primary"
                      : "text-white"
                    : scrolled
                      ? "text-graphite hover:text-primary"
                      : "text-white/75 hover:text-white"
                }`}
              >
                {l.label}
                <span
                  className={`absolute -bottom-1.5 left-0 h-px bg-accent transition-all duration-500 ${
                    isActive ? "w-full opacity-100" : "w-0 opacity-0"
                  }`}
                />
              </a>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <a
            href="#contato"
            className={`inline-flex items-center border px-5 py-2.5 text-[11px] uppercase tracking-[0.16em] transition-colors duration-300 ${
              scrolled
                ? "border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                : "border-white/35 text-white hover:bg-white hover:text-primary"
            }`}
          >
            Solicitar Orçamento
          </a>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          className={`relative z-50 flex h-10 w-10 items-center justify-center transition-colors lg:hidden ${
            scrolled || open ? "text-primary" : "text-white"
          }`}
        >
          <span className="sr-only">Menu</span>
          <div className="relative h-4 w-6">
            <span className={`absolute left-0 top-0 h-px w-full bg-current transition-all duration-300 ${open ? "top-2 rotate-45" : ""}`} />
            <span className={`absolute left-0 top-2 h-px w-full bg-current transition-opacity duration-300 ${open ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 top-4 h-px w-full bg-current transition-all duration-300 ${open ? "top-2 -rotate-45" : ""}`} />
          </div>
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 top-0 bg-white text-primary transition-all duration-500 lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
      >
        <div className="container-kiko flex h-full flex-col justify-between pb-10 pt-24">
          <nav className="flex flex-col" aria-label="Menu móvel">
            {NAV_LINKS.map((l, i) => {
              const isActive = active === l.href.slice(1);
              return (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`relative border-b border-border py-4 font-display text-lg font-medium tracking-tight transition-colors hover:text-graphite ${isActive ? "text-primary" : ""}`}
                style={{
                  transform: open ? "translateY(0)" : "translateY(16px)",
                  opacity: open ? 1 : 0,
                  transition: `all 450ms cubic-bezier(0.22,1,0.36,1) ${100 + i * 50}ms`,
                }}
              >
                <span className="mr-3 text-[10px] font-normal text-graphite/50">0{i + 1}</span>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="space-y-5">
            <Button href="#contato" variant="primary" onClick={() => setOpen(false)} className="w-full !py-4">
              Solicitar Orçamento
            </Button>
            <p className="text-[10px] uppercase tracking-[0.22em] text-graphite">Kiko Esquadrias · Desde 1991</p>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ----------------------------- Hero ----------------------------- */

function Hero() {
  return (
    <section id="top" className="relative isolate h-[100svh] min-h-[100dvh] overflow-hidden bg-[color:var(--kiko-blue-deep)] text-white">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroAsset.url}
          alt="Residência de alto padrão com esquadrias de alumínio Kiko"
          className="h-full w-full object-cover"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-[color:var(--kiko-blue-deep)]/35" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[color:var(--kiko-blue-deep)]/75 to-transparent" />
      </div>

      <div className="container-kiko relative flex h-full flex-col justify-end pb-14 pt-32 md:pb-20">
        <Reveal>
          <Eyebrow tone="light">Esquadrias em alumínio · Desde 1991</Eyebrow>
        </Reveal>

        <Reveal delay={120}>
          <h1 className="mt-6 max-w-3xl font-display text-[2rem] font-medium leading-[1.15] tracking-[-0.02em] sm:text-5xl md:text-[3.25rem]">
            Kiko. Esquadrias que transformam projetos<br />em arte.
          </h1>
        </Reveal>

        <Reveal delay={240}>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
            Desde 1991, soluções em alumínio que unem design, engenharia, precisão e excelência.
          </p>
        </Reveal>

        <Reveal delay={340}>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#contato"
              className="inline-flex items-center justify-center gap-2 bg-white px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] text-primary transition-colors hover:bg-white/90"
            >
              Solicitar Orçamento
            </a>
            <a
              href="#portfolio"
              className="inline-flex items-center justify-center gap-2 border border-white/30 px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] text-white transition-colors hover:border-white"
            >
              Ver Portfólio
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------- Sobre ----------------------------- */

function Sobre() {
  return (
    <section id="sobre" className="bg-background py-24 md:py-36">
      <div className="container-kiko">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-6">
            <Reveal>
              <div className="overflow-hidden">
                <img
                  src={g17Asset.url}
                  alt="Detalhe técnico de esquadria em alumínio com ferragens de precisão"
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-6 lg:pt-6">
            <Reveal>
              <Eyebrow>A Kiko</Eyebrow>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="mt-5 max-w-md font-display text-2xl font-medium leading-[1.2] tracking-[-0.02em] text-primary md:text-[2rem]">
                Não são apenas esquadrias. São sonhos realizados.
              </h2>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-6 max-w-xl text-sm leading-[1.85] text-graphite md:text-[15px]">
                Fabricação própria para obras de alto padrão. Construímos nossa história pautados
                na excelência técnica e na personalização. Nossos valores estão presentes em cada
                entrega: satisfação do cliente, responsabilidade, senso de dono, trabalho em equipe
                e gratidão.
              </p>
            </Reveal>

            <div className="mt-12 grid grid-cols-1 gap-px bg-border sm:grid-cols-3">
              {[
                ["Desde", "1991"],
                ["Fabricação", "Própria"],
                ["Projetos", "Personalizados"],
              ].map(([k, v], i) => (
                <Reveal key={v} delay={260 + i * 90}>
                  <div className="h-full bg-background py-6 sm:px-5 sm:py-7">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-graphite">{k}</div>
                    <div className="mt-2 font-display text-lg font-medium tracking-tight text-primary">{v}</div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={520}>
              <p className="mt-8 text-xs leading-relaxed text-graphite">
                Em 2026, a Kiko Esquadrias completa 35 anos de atuação.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Diferenciais ----------------------------- */

const DIFERENCIAIS = [
  {
    title: "Design e Sofisticação",
    body: "Perfis próprios para uma estética minimalista e grandes vãos.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <rect x="5" y="5" width="22" height="22" stroke="currentColor" strokeWidth="1" />
        <path d="M16 5v22" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
  {
    title: "Desempenho Térmico e Acústico",
    body: "Isolamento de alto nível para o máximo conforto.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="16" cy="16" r="10.5" stroke="currentColor" strokeWidth="1" />
        <circle cx="16" cy="16" r="5.5" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
  {
    title: "Durabilidade Superior",
    body: "Alumínio premium resistente ao tempo, com acabamento impecável.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M16 4l11 5.5v13L16 28 5 22.5v-13L16 4z" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
  {
    title: "100% Personalizado",
    body: "Peças desenvolvidas sob medida para o projeto do seu arquiteto.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M5 21l8-8 4 4L27 7" stroke="currentColor" strokeWidth="1" />
        <path d="M20 7h7v7" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
];

function Diferenciais() {
  return (
    <section id="diferenciais" className="bg-surface py-24 md:py-36">
      <div className="container-kiko">
        <Reveal>
          <Eyebrow>Diferenciais</Eyebrow>
        </Reveal>
        <Reveal delay={90}>
          <h2 className="mt-5 max-w-lg font-display text-2xl font-medium leading-[1.2] tracking-[-0.02em] text-primary md:text-[2rem]">
            Precisão que valoriza o seu projeto.
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {DIFERENCIAIS.map((d, i) => (
            <Reveal key={d.title} delay={i * 90} className="h-full">
              <article className="flex h-full flex-col bg-surface p-7 md:p-8">
                <div className="h-7 w-7 text-primary/70">{d.icon}</div>
                <h3 className="mt-8 font-display text-[15px] font-medium leading-snug text-primary">
                  {d.title}
                </h3>
                <p className="mt-3 text-[13px] leading-relaxed text-graphite">{d.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Portfólio ----------------------------- */

type Obra = {
  slug: string;
  nome: string;
  capa: string;
  fotos: string[];
};

const OBRAS: Obra[] = [
  {
    slug: "marcelo-baracat",
    nome: "Marcelo Baracat",
    capa: driveMarceloBaracat[0],
    fotos: driveMarceloBaracat,
  },
  {
    slug: "casa-na-arvore",
    nome: "Casa na Árvore",
    capa: driveCasaNaArvore[0],
    fotos: driveCasaNaArvore,
  },
  {
    slug: "haras-indaiatuba",
    nome: "Haras Indaiatuba",
    capa: driveHarasIndaiatuba[0],
    fotos: driveHarasIndaiatuba,
  },
  {
    slug: "obra-haras",
    nome: "Obra Haras",
    capa: driveObraHaras[0],
    fotos: driveObraHaras,
  },
  {
    slug: "fazenda-da-grama",
    nome: "Fazenda da Grama",
    capa: driveFazendaDaGrama[0],
    fotos: driveFazendaDaGrama,
  },
  {
    slug: "obra-enrique-junior",
    nome: "Obra Enrique Júnior",
    capa: driveObraEnriqueJunior[0],
    fotos: driveObraEnriqueJunior,
  },
  {
    slug: "escritorio-qnco",
    nome: "Escritório QNCO",
    capa: driveEscritorioQnco[0],
    fotos: driveEscritorioQnco,
  },
  {
    slug: "obra-rio",
    nome: "Obra Rio",
    capa: driveObraRio[0],
    fotos: driveObraRio,
  },
];



function Portfolio() {
  const [obra, setObra] = useState<Obra | null>(null);
  const [idx, setIdx] = useState(0);

  const close = useCallback(() => setObra(null), []);
  const prev = useCallback(() => {
    setIdx((i) => (obra ? (i - 1 + obra.fotos.length) % obra.fotos.length : i));
  }, [obra]);
  const next = useCallback(() => {
    setIdx((i) => (obra ? (i + 1) % obra.fotos.length : i));
  }, [obra]);

  useEffect(() => {
    if (!obra) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [obra, close, prev, next]);

  const openObra = (o: Obra) => {
    setObra(o);
    setIdx(0);
  };

  return (
    <section id="portfolio" className="bg-background py-24 md:py-36">
      <div className="container-kiko">
        <Reveal>
          <Eyebrow>Portfólio</Eyebrow>
        </Reveal>
        <Reveal delay={90}>
          <h2 className="mt-5 max-w-lg font-display text-2xl font-medium leading-[1.2] tracking-[-0.02em] text-primary md:text-[2rem]">
            Obras que assinam nossa excelência.
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-14">
          {OBRAS.map((o, i) => (
            <Reveal key={o.slug} delay={(i % 4) * 90}>
              <button
                type="button"
                onClick={() => openObra(o)}
                className="group block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label={`Abrir galeria da obra ${o.nome}`}
              >
                <div className="relative overflow-hidden bg-surface">
                  <img
                    src={o.capa}
                    alt={`Capa da obra ${o.nome}`}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                  />
                  <span className="pointer-events-none absolute inset-0 bg-[color:var(--kiko-blue-deep)]/0 transition-colors duration-500 group-hover:bg-[color:var(--kiko-blue-deep)]/15" />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-white/90 px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="11" cy="11" r="7" />
                      <line x1="20" y1="20" x2="16.65" y2="16.65" />
                    </svg>
                    Ver galeria
                  </span>
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-border pt-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-[15px] font-medium tracking-tight text-primary">
                      {o.nome}
                    </h3>
                    
                  </div>
                  <span className="shrink-0 text-[11px] tabular-nums text-graphite">{o.fotos.length}</span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {obra && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galeria da obra ${obra.nome}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[color:var(--kiko-blue-deep)]/97"
          onClick={close}
        >
          <div className="pointer-events-none absolute left-5 top-5 max-w-[60%] text-white md:left-8 md:top-7">
            <div className="font-display text-sm font-medium tracking-tight">{obra.nome}</div>
            
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); close(); }}
            aria-label="Fechar galeria"
            className="absolute right-5 top-5 grid h-10 w-10 place-items-center border border-white/25 text-white transition hover:border-white md:right-8 md:top-7"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Imagem anterior"
            className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center border border-white/25 text-white transition hover:border-white md:left-8 md:h-12 md:w-12"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Próxima imagem"
            className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center border border-white/25 text-white transition hover:border-white md:right-8 md:h-12 md:w-12"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <figure className="pointer-events-none relative flex h-full w-full items-center justify-center px-4 py-24 md:px-24 md:py-20">
            <img
              key={obra.fotos[idx]}
              src={obra.fotos[idx]}
              alt={`${obra.nome} — foto ${idx + 1} de ${obra.fotos.length}`}
              onClick={(e) => e.stopPropagation()}
              loading="eager"
              decoding="async"
              className="pointer-events-auto max-h-full max-w-full object-contain"
            />
          </figure>

          <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] tabular-nums tracking-[0.2em] text-white/70">
            {String(idx + 1).padStart(2, "0")} / {String(obra.fotos.length).padStart(2, "0")}
          </div>
        </div>
      )}
    </section>
  );
}

/* ----------------------------- Qualidade ----------------------------- */

function Qualidade() {
  return (
    <section id="qualidade" className="bg-surface py-24 md:py-36">
      <div className="container-kiko">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-6 lg:order-2">
            <Reveal>
              <img
                src={g25Asset.url}
                alt="Detalhe de esquadria em alumínio integrada à alvenaria de pedra"
                loading="lazy"
                decoding="async"
                className="aspect-[3/4] w-full object-cover lg:aspect-[4/5]"
              />
            </Reveal>
          </div>

          <div className="lg:col-span-5 lg:order-1">
            <Reveal>
              <Eyebrow>Qualidade e execução</Eyebrow>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="mt-5 font-display text-2xl font-medium leading-[1.2] tracking-[-0.02em] text-primary md:text-[2rem]">
                Excelência em cada etapa.
              </h2>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-6 text-sm leading-[1.85] text-graphite md:text-[15px]">
                Obras de alto padrão exigem execução exata. Nossa entrega baseia-se na
                responsabilidade técnica e na qualidade inegociável, garantindo que seu
                investimento seja executado com a precisão exigida.
              </p>
            </Reveal>

            <div className="mt-10 space-y-px bg-border">
              {[
                ["Responsabilidade técnica", "Engenharia dedicada em cada projeto."],
                ["Precisão milimétrica", "Produção própria com controle de tolerâncias."],
                ["Cronograma", "Planejamento tratado como compromisso."],
                ["Acabamento", "Conferência em todas as etapas da instalação."],
              ].map(([t, d], i) => (
                <Reveal key={t} delay={260 + i * 70}>
                  <div className="bg-surface py-4">
                    <div className="text-[13px] font-medium text-primary">{t}</div>
                    <div className="mt-1 text-[13px] text-graphite">{d}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Contato ----------------------------- */

function Contato() {
  const [sent, setSent] = useState(false);
  const [perfil, setPerfil] = useState<"proprietario" | "arquiteto">("proprietario");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section id="contato" className="bg-background py-24 md:py-36">
      <div className="container-kiko">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <Reveal>
              <img src={logoAsset.url} alt="Kiko Esquadrias" className="h-10 w-auto" />
            </Reveal>
            <Reveal delay={90}>
              <h2 className="mt-10 max-w-sm font-display text-2xl font-medium leading-[1.2] tracking-[-0.02em] text-primary md:text-[2rem]">
                O acabamento que o seu projeto exige.
              </h2>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-graphite md:text-[15px]">
                Integramos design, segurança e excelência. Fale com nossos especialistas.
              </p>
            </Reveal>
            <Reveal delay={260}>
              <div className="mt-10 space-y-3 border-t border-border pt-8 text-sm">
                <a
                  href="mailto:kikoesquadrias@kikoesquadrias.com.br"
                  className="block text-primary transition-colors hover:text-graphite"
                >
                  kikoesquadrias@kikoesquadrias.com.br
                </a>
                <a
                  href="https://instagram.com/kiko.esquadriasoficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-primary transition-colors hover:text-graphite"
                >
                  @kiko.esquadriasoficial
                </a>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal delay={140}>
              <div className="border border-border p-6 md:p-9">
                {sent ? (
                  <div className="py-14 text-center">
                    <div className="mx-auto grid h-11 w-11 place-items-center border border-border">
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-primary">
                        <path d="M4 12l5 5L20 6" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                    </div>
                    <h3 className="mt-6 font-display text-lg font-medium text-primary">
                      Recebemos seu contato.
                    </h3>
                    <p className="mt-3 text-sm text-graphite">
                      Nossa equipe retornará em breve com um atendimento personalizado.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="space-y-7">
                    <div>
                      <label htmlFor="nome" className="text-[10px] uppercase tracking-[0.22em] text-graphite">
                        Nome
                      </label>
                      <input
                        id="nome"
                        name="nome"
                        required
                        autoComplete="name"
                        className="mt-2 w-full border-b border-border bg-transparent py-2.5 text-[15px] text-primary placeholder:text-graphite/50 focus:border-primary focus:outline-none"
                        placeholder="Seu nome"
                      />
                    </div>
                    <div>
                      <label htmlFor="whatsapp" className="text-[10px] uppercase tracking-[0.22em] text-graphite">
                        WhatsApp
                      </label>
                      <input
                        id="whatsapp"
                        name="whatsapp"
                        type="tel"
                        required
                        autoComplete="tel"
                        className="mt-2 w-full border-b border-border bg-transparent py-2.5 text-[15px] text-primary placeholder:text-graphite/50 focus:border-primary focus:outline-none"
                        placeholder="(00) 00000-0000"
                      />
                    </div>

                    <fieldset>
                      <legend className="text-[10px] uppercase tracking-[0.22em] text-graphite">Perfil</legend>
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {([
                          ["proprietario", "Proprietário da Obra"],
                          ["arquiteto", "Arquiteto / Engenheiro"],
                        ] as const).map(([v, l]) => (
                          <label
                            key={v}
                            className={`cursor-pointer border px-4 py-3 text-center text-[11px] uppercase tracking-[0.14em] transition-colors ${
                              perfil === v
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border text-graphite hover:border-primary/40"
                            }`}
                          >
                            <input
                              type="radio"
                              name="perfil"
                              value={v}
                              checked={perfil === v}
                              onChange={() => setPerfil(v)}
                              className="sr-only"
                            />
                            {l}
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <div className="pt-1">
                      <Button type="submit" variant="primary" className="w-full !py-4">
                        Solicitar Orçamento
                      </Button>
                      <p className="mt-4 text-[11px] leading-relaxed text-graphite">
                        Ao enviar, você concorda com o contato comercial em conformidade com a LGPD.
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Footer ----------------------------- */

function Footer() {
  return (
    <footer className="bg-[color:var(--kiko-blue-deep)] text-white/55">
      <div className="container-kiko py-14">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <img
              src={logoWhiteAsset.url}
              alt="Kiko Esquadrias"
              className="h-8 w-auto"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <p className="mt-5 max-w-sm text-[13px] leading-relaxed">
              Esquadrias em alumínio para obras de alto padrão. Design, engenharia e precisão
              desde 1991.
            </p>
          </div>

          <nav className="md:col-span-3 md:col-start-7" aria-label="Navegação secundária">
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/35">Navegação</div>
            <ul className="mt-4 space-y-2 text-[13px]">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="transition-colors hover:text-white">{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/35">Contato</div>
            <ul className="mt-4 space-y-2 text-[13px]">
              <li>
                <a href="mailto:kikoesquadrias@kikoesquadrias.com.br" className="transition-colors hover:text-white">
                  kikoesquadrias@kikoesquadrias.com.br
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/kiko.esquadriasoficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  @kiko.esquadriasoficial
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-[11px] md:flex-row md:items-center">
          <p>Kiko Esquadrias — Desde 1991</p>
          <p>© {new Date().getFullYear()} Kiko Esquadrias. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

/* ----------------------------- Cookies ----------------------------- */

function CookieBar() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem("kiko_cookies")) setShow(true);
    } catch { /* noop */ }
  }, []);
  if (!show) return null;
  return (
    <div className="fixed inset-x-3 bottom-3 z-40 md:inset-x-auto md:bottom-6 md:right-6 md:max-w-sm">
      <div className="border border-border bg-white p-4 shadow-sm">
        <p className="text-[12px] leading-relaxed text-graphite">
          Utilizamos cookies para melhorar sua experiência de navegação.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => {
              try { localStorage.setItem("kiko_cookies", "1"); } catch { /* noop */ }
              setShow(false);
            }}
            className="flex-1 bg-primary px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-[color:var(--kiko-blue-deep)]"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Page ----------------------------- */

function KikoLanding() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <Sobre />
      <Diferenciais />
      <Portfolio />
      <Qualidade />
      <Contato />
      <Footer />
      <CookieBar />
    </main>
  );
}
