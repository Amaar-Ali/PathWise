import { createFileRoute, Link } from "@tanstack/react-router";
import { useLayoutEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site/SiteChrome";
import { ScrollTree } from "@/components/landing/ScrollTree";
import { DecisionMap } from "@/components/map/DecisionMap";
import { sampleDecision } from "@/lib/sample-decision";
import { findNode } from "@/lib/decision-model";

const TITLE = "PathWise";
const DESC =
  "PathWise turns complicated decisions into paths you can explore — an interactive map of options, consequences and outcomes, before you commit.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteNav hideAfterId="how-it-works" />
      <main>
        <Hero />
        <ScrollTree />
        <DemoSection />
        <Different />
        <StartBand />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const target = { x: 0, y: 0 };
    const head = { x: 0, y: 0 };
    const mid = { x: 0, y: 0 };
    const tail = { x: 0, y: 0 };
    let raf: number | null = null;
    let tracking = false;

    const paint = () => {
      const layer = section.querySelector<HTMLElement>(".hero-atmosphere") ?? section;
      layer.style.setProperty("--hero-mx", `${head.x}px`);
      layer.style.setProperty("--hero-my", `${head.y}px`);
      layer.style.setProperty("--hero-t1x", `${mid.x}px`);
      layer.style.setProperty("--hero-t1y", `${mid.y}px`);
      layer.style.setProperty("--hero-t2x", `${tail.x}px`);
      layer.style.setProperty("--hero-t2y", `${tail.y}px`);
    };

    const snapAll = (x: number, y: number) => {
      target.x = x;
      target.y = y;
      head.x = x;
      head.y = y;
      mid.x = x;
      mid.y = y;
      tail.x = x;
      tail.y = y;
      paint();
    };

    const centerGlow = () => {
      const { width, height } = section.getBoundingClientRect();
      snapAll(width * 0.5, height * 0.42);
    };

    const still = (a: { x: number; y: number }, b: { x: number; y: number }, eps = 0.45) =>
      Math.abs(a.x - b.x) <= eps && Math.abs(a.y - b.y) <= eps;

    const tick = () => {
      head.x += (target.x - head.x) * 0.28;
      head.y += (target.y - head.y) * 0.28;
      mid.x += (head.x - mid.x) * 0.12;
      mid.y += (head.y - mid.y) * 0.12;
      tail.x += (mid.x - tail.x) * 0.07;
      tail.y += (mid.y - tail.y) * 0.07;
      paint();
      if (still(head, target) && still(mid, head) && still(tail, mid)) {
        head.x = target.x;
        head.y = target.y;
        mid.x = target.x;
        mid.y = target.y;
        tail.x = target.x;
        tail.y = target.y;
        paint();
        raf = null;
      } else {
        raf = requestAnimationFrame(tick);
      }
    };

    const moveTo = (clientX: number, clientY: number) => {
      if (!tracking) return;
      const rect = section.getBoundingClientRect();
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        return;
      }
      target.x = clientX - rect.left;
      target.y = clientY - rect.top;
      if (raf == null) raf = requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => moveTo(event.clientX, event.clientY);
    const onMouseMove = (event: MouseEvent) => moveTo(event.clientX, event.clientY);

    const syncMode = () => {
      tracking = !reduceMotion.matches;
      section.dataset["heroGlowTrack"] = tracking ? "on" : "off";
      centerGlow();
      if (raf != null) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    };

    const onResize = () => {
      if (!tracking) centerGlow();
    };

    syncMode();
    section.addEventListener("pointermove", onPointerMove, { passive: true });
    section.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    reduceMotion.addEventListener("change", syncMode);

    return () => {
      section.removeEventListener("pointermove", onPointerMove);
      section.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      reduceMotion.removeEventListener("change", syncMode);
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-dvh flex-col overflow-hidden border-b border-border/70"
      data-hero-glow-track="on"
    >
      <div className="hero-atmosphere" aria-hidden>
        <div className="hero-atmosphere__wash" />
        <div className="hero-atmosphere__cursor-hue" data-hue="tail" />
        <div className="hero-atmosphere__cursor-hue" data-hue="mid" />
        <div className="hero-atmosphere__cursor-hue" data-hue="head" />
        <div className="hero-atmosphere__grain" />
        <div className="hero-atmosphere__vignette" />
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-5 pb-16 pt-24 sm:pb-20 sm:pt-28 md:py-28">
        <div className="mx-auto w-full max-w-2xl text-center">
          <p className="rule-label animate-rise">An interactive decision companion</p>
          <h1
            className="animate-rise mt-4 font-display text-[clamp(1.85rem,7vw,4.1rem)] font-light leading-[1.05] text-balance-tight sm:mt-5"
            style={{ animationDelay: "60ms" }}
          >
            Some decisions deserve more than an answer.
          </h1>
          <p
            className="animate-rise mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:mt-6 sm:text-[17px]"
            style={{ animationDelay: "140ms" }}
          >
            PathWise turns complicated decisions into paths you can explore — so you can see what
            each choice could lead to before you make it.
          </p>
          <div
            className="animate-rise mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center"
            style={{ animationDelay: "220ms" }}
          >
            <Link
              to="/decide"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-[14px] font-medium text-background transition-transform duration-300 hover:-translate-y-0.5 sm:py-2.5"
            >
              Start a decision
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-[14px] transition-colors hover:border-border-strong sm:py-2.5"
            >
              See how it works
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoSection() {
  const [selected, setSelected] = useState<string | null>(null);
  const node = selected ? findNode(sampleDecision.root, selected) : undefined;

  return (
    <section id="demo" className="border-y border-border/70 bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="max-w-lg">
            <p className="rule-label">A real map, in miniature</p>
            <h2 className="mt-3 font-display text-[clamp(1.55rem,4.5vw,2.4rem)] leading-tight text-balance-tight">
              Drag it. Zoom it. Open a path.
            </h2>
            <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground sm:text-[15px]">
              Zooming out shows the major paths. Zooming in reveals consequences, tradeoffs and the
              decisions waiting further down each route.
            </p>
          </div>
          <Link
            to="/decide"
            className="text-[13.5px] text-accent underline-offset-4 hover:underline"
          >
            Try it with your own decision →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:mt-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="surface-card h-[min(58vh,420px)] overflow-hidden sm:h-[480px] lg:h-[520px]">
            <DecisionMap
              root={sampleDecision.root}
              selectedId={selected}
              onSelect={setSelected}
              compact
            />
          </div>
          <aside className="surface-card p-4 sm:p-5">
            {node ? (
              <div key={node.id} className="animate-rise">
                <p className="rule-label">{node.kind}</p>
                <h3 className="mt-2 font-display text-[18px] leading-snug sm:text-[19px]">
                  {node.label}
                </h3>
                {node.summary && (
                  <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                    {node.summary}
                  </p>
                )}
                {node.tradeoff && (
                  <p className="mt-4 border-t border-border pt-3 text-[13px] leading-relaxed">
                    <span className="rule-label mr-1.5">Tradeoff</span>
                    {node.tradeoff}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-[13.5px] leading-relaxed text-muted-foreground">
                <p className="rule-label mb-2">Sample decision</p>
                <p>{sampleDecision.question}</p>
                <p className="mt-4">
                  Tap any node to inspect it. The map keeps its place while you read.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}

function Different() {
  const items = [
    {
      title: "It maps, it doesn't lecture",
      body: "Most tools hand you a wall of pros and cons. PathWise gives you a structure you can move through.",
    },
    {
      title: "Depth on demand",
      body: "Start with the three or four paths that actually exist. Go deeper only where you're curious.",
    },
    {
      title: "Honest about uncertainty",
      body: "PathWise will lean one way and tell you exactly what it's least sure about. You stay in charge.",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20 md:py-24">
      <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
        {items.map((i) => (
          <div key={i.title}>
            <div className="mb-4 h-px w-10 bg-accent" />
            <h3 className="font-display text-[19px] leading-snug sm:text-[20px]">{i.title}</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">{i.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function StartBand() {
  return (
    <section className="border-t border-border/70 bg-foreground text-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-14 sm:py-20 md:flex-row md:items-end md:justify-between">
        <h2 className="max-w-xl font-display text-[clamp(1.6rem,5vw,2.7rem)] font-light leading-tight text-balance-tight">
          What are you trying to decide?
        </h2>
        <Link
          to="/decide"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-background px-5 py-3 text-[14px] font-medium text-foreground transition-transform duration-300 hover:-translate-y-0.5 sm:w-fit sm:py-2.5"
        >
          Start a decision
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
