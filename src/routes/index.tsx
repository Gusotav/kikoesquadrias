import { createFileRoute } from "@tanstack/react-router";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import logoAsset from "@/assets/LOGO.png.asset.json";
import logoWhiteAsset from "@/assets/LOGO_BRANCA.png.asset.json";
import heroAsset from "@/assets/Hero.jpeg.asset.json";
import g1Asset from "@/assets/1_54.jpg.asset.json";
import g2Asset from "@/assets/1_60.jpg.asset.json";
import g3Asset from "@/assets/1_25.jpg.asset.json";
import g4Asset from "@/assets/1_11.jpg.asset.json";
import g5Asset from "@/assets/1_3.jpg.asset.json";
import g6Asset from "@/assets/1_1.jpg.asset.json";
import g7Asset from "@/assets/1_2.jpg.asset.json";
import g8Asset from "@/assets/1_4.jpg.asset.json";
import g9Asset from "@/assets/1_5.jpg.asset.json";
import g10Asset from "@/assets/1_6.jpg.asset.json";
import g11Asset from "@/assets/1_7.jpg.asset.json";
import g12Asset from "@/assets/1_8.jpg.asset.json";
import g13Asset from "@/assets/1_9.jpg.asset.json";

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

function useReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("reveal-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

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

function useCountUp(target: number, start: boolean, duration = 1600) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration]);
  return n;
}

/* ----------------------------- primitives ----------------------------- */

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <div data-reveal className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
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
    "group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[13px] font-medium tracking-wider uppercase transition-all duration-300 overflow-hidden rounded-none";
  const styles = {
    primary:
      "bg-accent text-accent-foreground hover:bg-[color:var(--kiko-blue)] hover:text-white",
    ghost:
      "bg-transparent text-current border border-current/30 hover:border-current hover:bg-current/5",
    outline:
      "bg-transparent text-primary border border-primary/40 hover:border-primary hover:bg-primary hover:text-primary-foreground",
  }[variant];

  const content = (
    <>
      <span className="relative z-10">{children}</span>
      <svg className="relative z-10 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 12 12" fill="none" aria-hidden>
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
  { label: "Projetos", href: "#projetos" },
  { label: "Compromisso", href: "#compromisso" },
  { label: "Contato", href: "#contato" },
];

function Navbar() {
  const scrolled = useScrolled(80);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-border shadow-[0_1px_0_0_rgba(44,52,91,0.04)]"
          : "bg-transparent"
      }`}
    >
      <div className="container-kiko flex h-16 items-center justify-between md:h-20">
        <a href="#top" className="flex items-center gap-2" aria-label="Kiko Esquadrias — Início">
          <img
            src={scrolled ? logoAsset.url : logoWhiteAsset.url}
            alt="Kiko Esquadrias"
            width={140}
            height={40}
            className="h-8 w-auto md:h-9 transition-opacity duration-300"
            style={{ filter: scrolled ? "none" : "brightness(0) invert(1)" }}
          />
        </a>

        <nav className="hidden lg:flex items-center gap-9" aria-label="Principal">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-[13px] tracking-wider uppercase transition-colors duration-300 relative ${
                scrolled ? "text-primary hover:text-accent" : "text-white/85 hover:text-white"
              }`}
            >
              <span>{l.label}</span>
              <span className="absolute -bottom-1.5 left-0 h-px w-full origin-right scale-x-0 bg-accent transition-transform duration-500 hover:origin-left" />
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button href="#contato" variant="primary" className="!py-3 !px-5">
            Solicitar Orçamento
          </Button>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          className={`lg:hidden relative z-50 flex h-10 w-10 items-center justify-center transition-colors ${
            scrolled || open ? "text-primary" : "text-white"
          }`}
        >
          <span className="sr-only">Menu</span>
          <div className="relative h-4 w-6">
            <span
              className={`absolute left-0 top-0 h-px w-full bg-current transition-all duration-300 ${
                open ? "top-2 rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-2 h-px w-full bg-current transition-opacity duration-300 ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-4 h-px w-full bg-current transition-all duration-300 ${
                open ? "top-2 -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-0 top-0 bg-primary text-primary-foreground transition-all duration-500 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div className="container-kiko flex h-full flex-col justify-between pt-24 pb-10">
          <nav className="flex flex-col gap-1" aria-label="Menu móvel">
            {NAV_LINKS.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="group border-b border-white/10 py-4 font-display text-2xl font-semibold tracking-tight transition-colors hover:text-accent"
                style={{
                  transform: open ? "translateY(0)" : "translateY(20px)",
                  opacity: open ? 1 : 0,
                  transition: `all 500ms cubic-bezier(0.22,1,0.36,1) ${120 + i * 60}ms`,
                }}
              >
                <span className="mr-3 text-xs font-normal text-white/40">0{i + 1}</span>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="space-y-6">
            <Button href="#contato" variant="primary" onClick={() => setOpen(false)} className="w-full !py-4">
              Solicitar Orçamento
            </Button>
            <p className="text-xs text-white/50 tracking-wider uppercase">Kiko Esquadrias · Desde 1989</p>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ----------------------------- Hero ----------------------------- */

function Hero() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const tick = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      el.style.setProperty("--mx", cx.toFixed(3));
      el.style.setProperty("--my", cy.toFixed(3));
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="top" ref={ref} className="relative isolate min-h-[100svh] overflow-hidden bg-[color:var(--kiko-blue-deep)] text-white">
      {/* Layered image with parallax */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 scale-110"
          style={{
            transform: "translate3d(calc(var(--mx,0) * -14px), calc(var(--my,0) * -14px), 0) scale(1.08)",
            transition: "transform 400ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <img
            src={heroAsset.url}
            alt="Residência de alto padrão com esquadrias de alumínio Kiko"
            className="h-full w-full object-cover"
            fetchPriority="high"
            decoding="async"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--kiko-blue-deep)] via-[color:var(--kiko-blue-deep)]/60 to-[color:var(--kiko-blue-deep)]/30" />
        <div
          className="absolute inset-0 opacity-40 mix-blend-overlay"
          style={{
            background:
              "radial-gradient(600px at calc(50% + var(--mx,0) * 60px) calc(50% + var(--my,0) * 60px), rgba(255,255,255,0.18), transparent 60%)",
          }}
        />
      </div>

      <div className="container-kiko relative flex min-h-[100svh] flex-col justify-between pt-28 pb-10 md:pt-32">
        <div
          className="flex items-center gap-3 text-[11px] tracking-[0.24em] uppercase text-white/70"
          data-reveal
        >
          <span className="h-px w-8 bg-accent" />
          Esquadrias artesanais em alumínio · Desde 1989
        </div>

        <div className="max-w-4xl">
          <Reveal delay={120}>
            <h1 className="font-display text-[2.5rem] leading-[1.02] font-semibold tracking-[-0.03em] sm:text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem]">
              Esquadrias que <br className="hidden sm:block" />
              <span className="italic font-normal text-white/80">transformam</span> projetos em{" "}
              <span className="relative inline-block">
                arte
                <span className="absolute -bottom-1 left-0 h-[3px] w-full origin-left bg-accent" style={{ animation: "kiko-line-grow 1200ms 800ms cubic-bezier(0.22,1,0.36,1) both" }} />
              </span>
              .
            </h1>
          </Reveal>
          <Reveal delay={280}>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 md:mt-8 md:text-lg">
              Mais de 35 anos de solidez desenvolvendo soluções artesanais em alumínio para
              quem exige exclusividade e conforto absoluto.
            </p>
          </Reveal>
          <Reveal delay={420}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button href="#contato" variant="primary">Solicitar Orçamento</Button>
              <Button href="https://wa.me/5500000000000" variant="ghost" className="!text-white !border-white/30 hover:!border-white">
                Falar com Especialista
              </Button>
            </div>
          </Reveal>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-6 border-t border-white/10 pt-6 md:mt-20 md:grid-cols-4 md:gap-10 md:pt-8">
          {[
            ["35+", "anos de tradição"],
            ["850+", "projetos executados"],
            ["90k m²", "de esquadrias entregues"],
            ["Sul · SE · CO", "regiões atendidas"],
          ].map(([v, l], i) => (
            <Reveal key={l} delay={500 + i * 90}>
              <div>
                <div className="font-display text-xl font-semibold md:text-2xl">{v}</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/55">{l}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 hidden justify-center md:flex">
        <div className="h-10 w-px bg-white/40 animate-pulse" />
      </div>
    </section>
  );
}

/* ----------------------------- Sobre ----------------------------- */

function Sobre() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setInView(true),
      { threshold: 0.3 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const stats = [
    { n: useCountUp(35, inView), suffix: "", label: "anos de tradição e solidez" },
    { n: useCountUp(850, inView), suffix: "+", label: "projetos executados" },
    { n: useCountUp(90, inView), suffix: "k m²", label: "de esquadrias entregues" },
    { n: useCountUp(100, inView), suffix: "%", label: "compromisso com excelência" },
  ];

  return (
    <section id="sobre" className="relative bg-surface py-20 md:py-32" ref={ref}>
      <div className="container-kiko">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow">A Kiko</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-4 font-display text-3xl leading-[1.08] font-semibold tracking-tight text-primary md:text-5xl">
                Não são apenas esquadrias.{" "}
                <span className="italic font-normal text-graphite">São sonhos realizados.</span>
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal delay={160}>
              <p className="text-base leading-relaxed text-graphite md:text-lg">
                Guiados pela gratidão e pelo senso de dono, entregamos segurança, inovação e
                bem-estar em cada detalhe. Nossa missão é oferecer excelência contínua,
                garantindo a satisfação total de arquitetos e proprietários nas regiões Sul,
                Sudeste e Centro-Oeste do país.
              </p>
            </Reveal>
            <Reveal delay={260}>
              <div className="hairline mt-10" />
            </Reveal>

            <div className="mt-10 grid grid-cols-2 gap-8 sm:gap-10">
              {stats.map((s, i) => (
                <Reveal key={s.label} delay={320 + i * 100}>
                  <div>
                    <div className="font-display text-4xl font-semibold tracking-tight text-primary md:text-5xl">
                      {s.n}
                      <span className="text-accent">{s.suffix}</span>
                    </div>
                    <div className="mt-2 text-xs uppercase tracking-[0.18em] text-graphite">
                      {s.label}
                    </div>
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

/* ----------------------------- Diferenciais ----------------------------- */

const DIFERENCIAIS = [
  {
    num: "01",
    title: "Visual clean e moderno",
    body:
      "Desenvolvemos nossos próprios perfis para garantir vãos maiores, mais luz natural e um visual que não interfere na decoração.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <rect x="4" y="4" width="24" height="24" stroke="currentColor" strokeWidth="1.2" />
        <path d="M16 4v24M4 16h24" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Tranquilidade o ano todo",
    body:
      "Nossas esquadrias ajudam a barrar calor, frio e ruído, criando conforto e silêncio dentro de casa.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.2" />
        <path d="M16 6v20M6 16h20" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 3" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Feito para durar gerações",
    body:
      "Alumínio de alto padrão, baixa manutenção, alta durabilidade e valorização real do imóvel ao longo do tempo.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M16 3l11 6v14l-11 6-11-6V9l11-6z" stroke="currentColor" strokeWidth="1.2" />
        <path d="M16 3v26M5 9l22 12M27 9L5 21" stroke="currentColor" strokeWidth="1.2" opacity=".5" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "100% sob medida",
    body:
      "Cada peça é produzida de forma artesanal e milimétrica para respeitar o projeto original em cada detalhe.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M4 20l8-8 4 4 12-12" stroke="currentColor" strokeWidth="1.2" />
        <path d="M20 4h8v8" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
];

function Diferenciais() {
  return (
    <section id="diferenciais" className="relative bg-background py-20 md:py-32">
      <div className="container-kiko">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow">Diferenciais</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-4 font-display text-3xl leading-[1.08] font-semibold tracking-tight text-primary md:text-5xl">
                O detalhe invisível que valoriza sua casa e protege sua família.
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <Reveal delay={160}>
              <p className="text-graphite">
                Cada projeto Kiko é resultado da união entre engenharia de precisão,
                estética arquitetônica e cuidado artesanal — do desenho ao acabamento.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
          {DIFERENCIAIS.map((d, i) => (
            <Reveal key={d.num} delay={i * 100} className="h-full">
              <article className="group relative flex h-full flex-col justify-between bg-background p-8 transition-colors duration-500 hover:bg-surface md:p-10">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 text-primary transition-colors duration-500 group-hover:text-accent">
                    {d.icon}
                  </div>
                  <span className="font-display text-xs tracking-widest text-graphite/60">{d.num}</span>
                </div>
                <div className="mt-16">
                  <h3 className="font-display text-xl font-semibold text-primary md:text-2xl">
                    {d.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-graphite">{d.body}</p>
                </div>
                <div className="mt-8 h-px w-8 bg-accent transition-all duration-500 group-hover:w-16" />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Projetos ----------------------------- */

const PROJETOS = [
  {
    img: g1Asset.url,
    name: "Residência Iporanga",
    loc: "São Paulo · SP",
    tipo: "Portas de correr + folhas pivotantes",
    dest: "Vãos amplos com veneziana em madeira e alumínio",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    img: g2Asset.url,
    name: "Casa da Serra",
    loc: "Petrópolis · RJ",
    tipo: "Fachada envidraçada estrutural",
    dest: "Perfis mínimos e vidro laminado acústico",
    span: "",
  },
  {
    img: g3Asset.url,
    name: "Retiro do Mar",
    loc: "Angra dos Reis · RJ",
    tipo: "Guillotine + brises artesanais",
    dest: "Integração total com o entorno natural",
    span: "md:col-span-2",
  },
  {
    img: g11Asset.url,
    name: "Cobertura Beira-Mar",
    loc: "Rio de Janeiro · RJ",
    tipo: "Sistema de correr panorâmico",
    dest: "Vãos contínuos com vista para o oceano",
    span: "",
  },
  {
    img: g7Asset.url,
    name: "Apartamento Vista Praia",
    loc: "Rio de Janeiro · RJ",
    tipo: "Esquadrias de correr em vidro temperado",
    dest: "Máxima entrada de luz e ventilação natural",
    span: "md:col-span-2",
  },
  {
    img: g4Asset.url,
    name: "Residência Noturna",
    loc: "Belo Horizonte · MG",
    tipo: "Portas de correr em pele de vidro",
    dest: "Estrutura em alumínio negro fosco",
    span: "",
  },
  {
    img: g12Asset.url,
    name: "Refúgio na Mata",
    loc: "Nova Lima · MG",
    tipo: "Fachada estrutural com pele de vidro",
    dest: "Diálogo entre arquitetura e paisagem",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    img: g6Asset.url,
    name: "Chalé Voronoi",
    loc: "Campos do Jordão · SP",
    tipo: "Painéis autorais em módulos geométricos",
    dest: "Desenho exclusivo em alumínio e madeira",
    span: "",
  },
  {
    img: g8Asset.url,
    name: "Casa Voronoi · Interior",
    loc: "Campos do Jordão · SP",
    tipo: "Divisórias artesanais em recorte único",
    dest: "Detalhamento milimétrico em série pequena",
    span: "",
  },
  {
    img: g9Asset.url,
    name: "Residência Ipanema",
    loc: "Rio de Janeiro · RJ",
    tipo: "Correr multi-folhas piso a teto",
    dest: "Perfil ultra-slim com vidro insulado",
    span: "md:col-span-2",
  },
  {
    img: g13Asset.url,
    name: "Pavilhão na Floresta",
    loc: "Interior · SP",
    tipo: "Pele de vidro contínua",
    dest: "Integração total interior · exterior",
    span: "md:col-span-2",
  },
  {
    img: g5Asset.url,
    name: "Escritório Corporativo",
    loc: "Rio de Janeiro · RJ",
    tipo: "Divisórias em vidro estrutural",
    dest: "Precisão milimétrica em escala comercial",
    span: "",
  },
  {
    img: g10Asset.url,
    name: "Sala de Reuniões",
    loc: "Rio de Janeiro · RJ",
    tipo: "Sistema modular em alumínio branco",
    dest: "Acústica e transparência integradas",
    span: "",
  },
];

function Projetos() {
  return (
    <section id="projetos" className="relative bg-[color:var(--kiko-blue-deep)] py-20 text-white md:py-32">
      <div className="container-kiko">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <Reveal>
              <p className="eyebrow">Projetos</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-4 font-display text-3xl leading-[1.08] font-semibold tracking-tight md:text-5xl">
                Obras que assinam <br />
                <span className="italic font-normal text-white/70">nossa excelência.</span>
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <Reveal delay={160}>
              <Button href="#contato" variant="ghost" className="!text-white !border-white/30 hover:!border-white">
                Iniciar seu projeto
              </Button>
            </Reveal>
          </div>
        </div>

        <div className="mt-14 grid auto-rows-[220px] grid-cols-1 gap-3 sm:auto-rows-[240px] md:grid-cols-4 md:gap-4 lg:auto-rows-[280px]">
          {PROJETOS.map((p, i) => (
            <Reveal key={p.name} delay={i * 80} className={`h-full ${p.span}`}>
              <figure className="group relative h-full w-full overflow-hidden bg-white/5">
                <img
                  src={p.img}
                  alt={`${p.name} — ${p.tipo}`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-90 transition-opacity duration-500" />
                <figcaption className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-base font-semibold md:text-lg">{p.name}</h3>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">{p.loc}</span>
                  </div>
                  <div className="mt-1 max-h-0 overflow-hidden opacity-0 transition-all duration-500 group-hover:max-h-32 group-hover:opacity-100 md:mt-2">
                    <p className="text-xs text-white/80">{p.tipo}</p>
                    <p className="mt-1 text-xs text-white/55">{p.dest}</p>
                  </div>
                  {/* Always visible on mobile */}
                  <p className="mt-1 text-xs text-white/70 md:hidden">{p.tipo}</p>
                </figcaption>
                <span className="absolute left-4 top-4 h-6 w-6 border-l border-t border-white/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="absolute right-4 bottom-4 h-6 w-6 border-r border-b border-white/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Compromisso ----------------------------- */

function Compromisso() {
  return (
    <section id="compromisso" className="relative bg-surface py-20 md:py-32">
      <div className="container-kiko">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-6">
            <Reveal>
              <div className="relative overflow-hidden">
                <img
                  src={g4Asset.url}
                  alt="Detalhe premium de esquadria Kiko"
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 border-t-2 border-accent bg-white/95 p-5">
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-3xl font-semibold text-primary">01</span>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-graphite">
                      Compromisso técnico
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-6">
            <Reveal delay={120}>
              <p className="eyebrow">Compromisso com a qualidade</p>
            </Reveal>
            <Reveal delay={180}>
              <h2 className="mt-4 font-display text-3xl leading-[1.08] font-semibold tracking-tight text-primary md:text-5xl">
                A escolha segura para o seu investimento de alto padrão.
              </h2>
            </Reveal>
            <Reveal delay={260}>
              <p className="mt-6 text-base leading-relaxed text-graphite md:text-lg">
                Sabemos que a escolha das esquadrias define o sucesso ou a dor de cabeça de
                uma obra. Por isso, não toleramos quebras de compromisso. Nossa entrega é
                fundamentada na responsabilidade técnica, qualidade dos serviços prestados e
                em garantir que sua casa seja entregue exatamente como você sonhou.
              </p>
            </Reveal>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {[
                ["Responsabilidade técnica", "Engenharia dedicada em cada projeto."],
                ["Precisão artesanal", "Milímetros que fazem a diferença."],
                ["Prazo respeitado", "Cronograma tratado como compromisso."],
                ["Acabamento impecável", "Fiscalização em todas as etapas."],
              ].map(([t, d], i) => (
                <Reveal key={t} delay={320 + i * 80}>
                  <div className="flex gap-3 border-t border-border pt-4">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-accent" />
                    <div>
                      <div className="text-sm font-semibold text-primary">{t}</div>
                      <div className="mt-1 text-xs text-graphite">{d}</div>
                    </div>
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

/* ----------------------------- Form / CTA ----------------------------- */

function Contato() {
  const [sent, setSent] = useState(false);
  const [perfil, setPerfil] = useState<"proprietario" | "arquiteto">("proprietario");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Placeholder — integrar com backend/CRM em fase 2
    setSent(true);
  };

  return (
    <section id="contato" className="relative overflow-hidden bg-primary py-20 text-primary-foreground md:py-32">
      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{
        backgroundImage:
          "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />

      <div className="container-kiko relative">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Reveal>
              <p className="eyebrow !text-accent">Contato</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-4 font-display text-3xl leading-[1.05] font-semibold tracking-tight md:text-5xl lg:text-6xl">
                Dê o acabamento que a sua obra de alto padrão merece.
              </h2>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/70 md:text-lg">
                Integramos segurança, exclusividade e inovação no seu projeto. Fale com nossa
                equipe comercial.
              </p>
            </Reveal>

            <Reveal delay={280}>
              <div className="mt-10 space-y-4 border-t border-white/10 pt-8 text-sm text-white/70">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/50">Atendimento comercial</div>
                  <a href="https://wa.me/5500000000000" className="mt-1 block font-display text-lg text-white hover:text-accent">
                    +55 (00) 00000-0000
                  </a>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/50">E-mail</div>
                  <a href="mailto:contato@kikoesquadrias.com.br" className="mt-1 block font-display text-lg text-white hover:text-accent">
                    contato@kikoesquadrias.com.br
                  </a>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-6">
            <Reveal delay={200}>
              <div className="relative border border-white/15 bg-white/[0.03] p-6 backdrop-blur-sm md:p-10">
                {sent ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center border border-accent">
                      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-accent">
                        <path d="M4 12l5 5L20 6" stroke="currentColor" strokeWidth="1.6" />
                      </svg>
                    </div>
                    <h3 className="mt-6 font-display text-2xl font-semibold">Recebemos seu contato.</h3>
                    <p className="mt-3 text-sm text-white/70">
                      Nossa equipe comercial retornará em breve com uma consultoria personalizada.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="nome" className="text-[11px] uppercase tracking-[0.2em] text-white/60">
                        Nome completo
                      </label>
                      <input
                        id="nome"
                        name="nome"
                        required
                        autoComplete="name"
                        className="mt-2 w-full border-b border-white/25 bg-transparent py-2.5 text-base text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
                        placeholder="Seu nome"
                      />
                    </div>
                    <div>
                      <label htmlFor="whatsapp" className="text-[11px] uppercase tracking-[0.2em] text-white/60">
                        WhatsApp
                      </label>
                      <input
                        id="whatsapp"
                        name="whatsapp"
                        type="tel"
                        required
                        autoComplete="tel"
                        className="mt-2 w-full border-b border-white/25 bg-transparent py-2.5 text-base text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
                        placeholder="(00) 00000-0000"
                      />
                    </div>

                    <fieldset>
                      <legend className="text-[11px] uppercase tracking-[0.2em] text-white/60">Perfil</legend>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {([
                          ["proprietario", "Proprietário da Obra"],
                          ["arquiteto", "Arquiteto · Engenheiro"],
                        ] as const).map(([v, l]) => (
                          <label
                            key={v}
                            className={`cursor-pointer border px-4 py-3 text-center text-xs uppercase tracking-wider transition-all ${
                              perfil === v
                                ? "border-accent bg-accent text-accent-foreground"
                                : "border-white/25 text-white/70 hover:border-white/60"
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

                    <div className="pt-2">
                      <Button type="submit" variant="primary" className="w-full !py-4">
                        Solicitar Orçamento
                      </Button>
                      <p className="mt-4 text-[11px] leading-relaxed text-white/45">
                        Ao enviar você concorda com nossa{" "}
                        <a href="#privacidade" className="underline hover:text-white">Política de Privacidade</a>{" "}
                        e com o contato comercial em conformidade com a LGPD.
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
    <footer className="bg-[color:var(--kiko-blue-deep)] text-white/60">
      <div className="container-kiko py-14">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <img
              src={logoWhiteAsset.url}
              alt="Kiko Esquadrias"
              className="h-9 w-auto"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <p className="mt-5 max-w-sm text-sm leading-relaxed">
              Esquadrias artesanais em alumínio para obras residenciais de alto padrão.
              Solidez, precisão e conforto absoluto desde 1989.
            </p>
          </div>

          <nav className="md:col-span-3 md:col-start-7" aria-label="Navegação secundária">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">Navegação</div>
            <ul className="mt-4 space-y-2 text-sm">
              {NAV_LINKS.map((l) => (
                <li key={l.href}><a href={l.href} className="hover:text-white">{l.label}</a></li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">Contato</div>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="https://wa.me/5500000000000" className="hover:text-white">+55 (00) 00000-0000</a></li>
              <li><a href="mailto:contato@kikoesquadrias.com.br" className="hover:text-white">contato@kikoesquadrias.com.br</a></li>
              <li><a href="https://instagram.com/kikoesquadrias" className="hover:text-white">@kikoesquadrias</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Kiko Esquadrias. Todos os direitos reservados.</p>
          <div className="flex flex-wrap gap-4">
            <a href="#privacidade" className="hover:text-white">Política de Privacidade</a>
            <a href="#termos" className="hover:text-white">Termos de Uso</a>
            <a href="#lgpd" className="hover:text-white">LGPD</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ----------------------------- Cookies + Whatsapp float ----------------------------- */

function CookieBar() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem("kiko_cookies")) setShow(true);
    } catch { /* noop */ }
  }, []);
  if (!show) return null;
  return (
    <div className="fixed inset-x-3 bottom-3 z-40 md:inset-x-auto md:right-6 md:bottom-6 md:max-w-md">
      <div className="border border-border bg-white p-4 shadow-lg md:p-5">
        <p className="text-xs leading-relaxed text-graphite">
          Utilizamos cookies para melhorar sua experiência de navegação. Ao continuar, você
          concorda com nossa{" "}
          <a href="#privacidade" className="text-primary underline hover:text-accent">Política de Privacidade</a>.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => {
              try { localStorage.setItem("kiko_cookies", "1"); } catch { /* noop */ }
              setShow(false);
            }}
            className="flex-1 bg-primary px-4 py-2 text-xs uppercase tracking-wider text-primary-foreground hover:bg-accent"
          >
            Aceitar
          </button>
          <a
            href="#privacidade"
            className="flex-1 border border-border px-4 py-2 text-center text-xs uppercase tracking-wider text-primary hover:border-primary"
          >
            Saber mais
          </a>
        </div>
      </div>
    </div>
  );
}

function WhatsappFloat() {
  return (
    <a
      href="https://wa.me/5500000000000"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com especialista via WhatsApp"
      className="fixed bottom-4 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-[0_10px_30px_-8px_rgba(233,52,71,0.5)] transition-transform hover:scale-105 md:bottom-24 md:right-6 md:h-14 md:w-14"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 md:h-7 md:w-7" aria-hidden>
        <path d="M17.5 14.4c-.3-.15-1.7-.85-2-.95-.27-.1-.47-.15-.66.15-.2.3-.76.95-.93 1.15-.17.2-.34.22-.63.07-.3-.15-1.24-.46-2.36-1.46-.87-.78-1.46-1.73-1.63-2.03-.17-.3-.02-.46.13-.6.13-.13.3-.34.44-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.66-1.6-.9-2.19-.24-.58-.49-.5-.66-.51h-.56c-.2 0-.5.07-.77.37-.27.3-1.02 1-1.02 2.43s1.05 2.82 1.2 3.02c.15.2 2.07 3.16 5.02 4.43.7.3 1.25.48 1.68.62.7.22 1.34.19 1.85.12.56-.08 1.7-.7 1.95-1.37.24-.68.24-1.26.17-1.38-.07-.12-.27-.2-.56-.35zM12.05 3.5C7.3 3.5 3.5 7.3 3.5 12.05c0 1.5.4 2.95 1.14 4.25L3.5 20.5l4.34-1.13c1.25.68 2.66 1.05 4.2 1.05h.01c4.75 0 8.55-3.8 8.55-8.55S16.8 3.5 12.05 3.5z"/>
      </svg>
    </a>
  );
}

/* ----------------------------- Page ----------------------------- */

function KikoLanding() {
  useReveal();
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <Sobre />
      <Diferenciais />
      <Projetos />
      <Compromisso />
      <Contato />
      <Footer />
      <CookieBar />
      <WhatsappFloat />
    </main>
  );
}
