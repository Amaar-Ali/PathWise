import { useEffect, useRef, useState } from "react";

export function ScrollTree() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const raw = total > 0 ? -rect.top / total : 0;
      setP(Math.min(1, Math.max(0, raw)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const seg = (from: number, to: number) => Math.min(1, Math.max(0, (p - from) / (to - from)));
  const ease = (v: number) => 1 - Math.pow(1 - v, 3);

  const trunk = ease(seg(0.02, 0.2));
  const split = ease(seg(0.2, 0.42));
  const leaves = ease(seg(0.45, 0.7));
  const labels = ease(seg(0.55, 0.8));

  const line = (len: number, progress: number) => ({
    strokeDasharray: len,
    strokeDashoffset: len * (1 - progress),
  });

  return (
    <section id="how-it-works" ref={sectionRef} className="pw-scroll-tree relative">
      <div className="pw-scroll-tree__sticky">
        <div className="pw-scroll-tree__grid">
          <div className="pw-scroll-tree__copy">
            <p className="rule-label">How it works</p>
            <h2 className="mt-3 font-display text-[clamp(1.65rem,4vw,2.8rem)] leading-[1.1] text-balance-tight">
              A decision isn&apos;t a paragraph. It&apos;s a shape.
            </h2>
            <div className="mt-5 space-y-3 text-[14.5px] leading-relaxed text-muted-foreground sm:mt-6 sm:space-y-4 sm:text-[15px]">
              <Step
                active={trunk > 0.4}
                text="You start with the thing you're actually deciding."
              />
              <Step
                active={split > 0.4}
                text="It splits into the paths that are genuinely available to you."
              />
              <Step
                active={leaves > 0.4}
                text="Each path carries its own consequences, tradeoffs and next decisions."
              />
              <Step
                active={labels > 0.6}
                text="Then you explore — instead of reading someone else's conclusion."
              />
            </div>
          </div>

          <div className="pw-scroll-tree__visual" aria-hidden>
            <svg viewBox="0 0 520 460" className="h-auto w-full max-h-[42vh] md:max-h-none">
              <g stroke="var(--border-strong)" strokeWidth="1.6" fill="none" strokeLinecap="round">
                <path
                  d="M260 70 L260 150"
                  style={line(80, trunk)}
                  stroke="var(--accent)"
                  strokeWidth="2"
                />
                <path d="M260 150 C 260 195, 140 195, 140 240" style={line(140, split)} />
                <path d="M260 150 C 260 195, 380 195, 380 240" style={line(140, split)} />
                <path d="M140 270 C 140 315, 70 315, 70 360" style={line(130, leaves)} />
                <path d="M140 270 C 140 315, 210 315, 210 360" style={line(130, leaves)} />
                <path d="M380 270 C 380 315, 310 315, 310 360" style={line(130, leaves)} />
                <path d="M380 270 C 380 315, 450 315, 450 360" style={line(130, leaves)} />
              </g>

              <Node x={260} y={60} r={7} shown={p > 0.01} accent />
              <Node x={140} y={255} r={6} shown={split > 0.75} />
              <Node x={380} y={255} r={6} shown={split > 0.9} />
              <Node x={70} y={372} r={4.5} shown={leaves > 0.8} />
              <Node x={210} y={372} r={4.5} shown={leaves > 0.88} />
              <Node x={310} y={372} r={4.5} shown={leaves > 0.94} />
              <Node x={450} y={372} r={4.5} shown={leaves > 0.99} />

              <Label x={260} y={38} text="The decision" shown={p > 0.05} display />
              <Label x={140} y={246} text="Path A" shown={labels > 0.2} />
              <Label x={380} y={246} text="Path B" shown={labels > 0.45} />
              <Label x={70} y={396} text="Outcome" shown={labels > 0.7} small />
              <Label x={210} y={396} text="Next choice" shown={labels > 0.8} small />
              <Label x={310} y={396} text="Tradeoff" shown={labels > 0.88} small />
              <Label x={450} y={396} text="Outcome" shown={labels > 0.95} small />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

function Step({ active, text }: { active: boolean; text: string }) {
  return (
    <p
      className="flex gap-3 transition-all duration-500"
      style={{ opacity: active ? 1 : 0.35, transform: active ? "none" : "translateY(4px)" }}
    >
      <span
        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-500"
        style={{ background: active ? "var(--accent)" : "var(--border-strong)" }}
      />
      <span style={{ color: active ? "var(--foreground)" : undefined }}>{text}</span>
    </p>
  );
}

function Node({
  x,
  y,
  r,
  shown,
  accent,
}: {
  x: number;
  y: number;
  r: number;
  shown: boolean;
  accent?: boolean;
}) {
  return (
    <circle
      cx={x}
      cy={y}
      r={shown ? r : 0}
      fill={accent ? "var(--accent)" : "var(--background)"}
      stroke={accent ? "var(--accent)" : "var(--foreground)"}
      strokeWidth="1.6"
      style={{ transition: "r 500ms var(--ease-out-soft)" }}
    />
  );
}

function Label({
  x,
  y,
  text,
  shown,
  display,
  small,
}: {
  x: number;
  y: number;
  text: string;
  shown: boolean;
  display?: boolean;
  small?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fill={display ? "var(--foreground)" : "var(--muted-foreground)"}
      fontSize={display ? 17 : small ? 11 : 13}
      fontFamily={display ? "var(--font-display)" : "var(--font-sans)"}
      stroke={display ? undefined : "var(--background)"}
      strokeWidth={display ? undefined : small ? 2.5 : 3.5}
      style={{
        opacity: shown ? 1 : 0,
        transition: "opacity 600ms var(--ease-out-soft)",
        paintOrder: display ? undefined : "stroke fill",
      }}
    >
      {text}
    </text>
  );
}
