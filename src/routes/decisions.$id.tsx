import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bookmark, Laptop, PanelRightClose, PanelRightOpen, X } from "lucide-react";
import { SiteNav } from "@/components/site/SiteChrome";
import { DecisionMap } from "@/components/map/DecisionMap";
import {
  ComparePanel,
  DetailPanel,
  InsightsPanel,
  TimelinePanel,
  WhatIfPanel,
  nodesAffectedBy,
} from "@/components/map/Panels";
import type { DecisionDoc } from "@/lib/decision-model";
import { pathToNode } from "@/lib/decision-model";
import { loadDecision } from "@/lib/decision-store";
import { sampleDecision } from "@/lib/sample-decision";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/decisions/$id")({
  head: () => ({
    meta: [
      { title: "Your decision map — PathWise" },
      {
        name: "description",
        content: "Explore the paths, consequences and outcomes of your decision.",
      },
      { property: "og:title", content: "Your decision map — PathWise" },
      {
        property: "og:description",
        content: "Explore the paths, consequences and outcomes of your decision.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Workspace,
});

type Tab = "insights" | "detail" | "timeline" | "compare";

const TABS: Tab[] = ["insights", "detail", "timeline", "compare"];
const MOBILE_TIP_KEY = "pw-mobile-desktop-tip";
const ASIDE_OPEN_KEY = "pw-desktop-aside-open";

function Workspace() {
  const { id } = useParams({ from: "/decisions/$id" });
  const [doc, setDoc] = useState<DecisionDoc | null>(null);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("insights");
  const [whatIf, setWhatIf] = useState<string[]>([]);
  const [whatIfOpen, setWhatIfOpen] = useState(true);
  /** Mobile sheet — null = closed; map stays full-bleed underneath. */
  const [mobileSheet, setMobileSheet] = useState<Tab | null>(null);
  const [showMobileTip, setShowMobileTip] = useState(false);
  /** Desktop / laptop sidebar. */
  const [asideOpen, setAsideOpen] = useState(true);

  useEffect(() => {
    setDoc(id === "sample" ? sampleDecision : (loadDecision(id) ?? null));
    setReady(true);
  }, [id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const narrow = window.matchMedia("(max-width: 1023px)").matches;
    if (narrow && !sessionStorage.getItem(MOBILE_TIP_KEY)) {
      setShowMobileTip(true);
    }
    const stored = localStorage.getItem(ASIDE_OPEN_KEY);
    if (stored === "0") setAsideOpen(false);
  }, []);

  const setAside = (open: boolean) => {
    setAsideOpen(open);
    localStorage.setItem(ASIDE_OPEN_KEY, open ? "1" : "0");
  };

  const affected = useMemo(
    () =>
      doc
        ? nodesAffectedBy(doc, whatIf)
        : { stronger: new Set<string>(), weaker: new Set<string>() },
    [doc, whatIf],
  );

  const activePathId = useMemo(() => {
    if (!doc || !selected) return null;
    return pathToNode(doc.root, selected)[1]?.id ?? null;
  }, [doc, selected]);

  const select = (nodeId: string | null) => {
    setSelected(nodeId);
    if (nodeId) {
      setTab("detail");
      setMobileSheet("detail");
      setAside(true);
    }
  };

  const dismissTip = () => {
    sessionStorage.setItem(MOBILE_TIP_KEY, "1");
    setShowMobileTip(false);
  };

  const toggleMobileTab = (t: Tab) => {
    setTab(t);
    setMobileSheet((prev) => (prev === t ? null : t));
  };

  if (!ready) return <div className="min-h-screen" />;

  if (!doc) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <div className="mx-auto max-w-lg px-5 py-28">
          <h1 className="font-display text-[26px] leading-snug">
            I can&apos;t find that decision.
          </h1>
          <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">
            Decisions are kept in this browser for now. If you opened this on another device, it
            won&apos;t be here yet.
          </p>
          <Link
            to="/decide"
            className="mt-6 inline-block text-[13.5px] text-accent underline-offset-4 hover:underline"
          >
            Start a new one →
          </Link>
        </div>
      </div>
    );
  }

  const hasAssumptions = Boolean(doc.assumptions?.length);
  const sheetTab = mobileSheet ?? tab;

  return (
    <div className="flex h-dvh flex-col overflow-hidden pt-[var(--pw-nav-offset)]">
      <SiteNav />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section className="relative min-h-0 flex-1">
          <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-start justify-between gap-3 px-4 pb-8 pt-3 max-lg:px-3.5 max-lg:pb-6 max-lg:pt-2 lg:gap-4 lg:px-5 lg:pb-5 lg:pt-4">
            <div className="pointer-events-auto max-w-md max-lg:max-w-[min(100%,18.5rem)]">
              <p className="rule-label max-lg:text-[0.625rem]">
                {doc.depth === "high" ? "High detail" : "Medium detail"}
              </p>
              <h1 className="mt-1 font-display text-[20px] leading-snug max-lg:mt-0.5 max-lg:line-clamp-2 max-lg:text-[16px] max-lg:tracking-[-0.02em]">
                {doc.title}
              </h1>
            </div>

            {/* Desktop: reopen collapsed sidebar */}
            {!asideOpen && (
              <button
                type="button"
                onClick={() => setAside(true)}
                className="pointer-events-auto hidden items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-2 text-[12.5px] text-muted-foreground backdrop-blur-sm transition-colors hover:border-border-strong hover:text-foreground lg:inline-flex"
                style={{ boxShadow: "var(--shadow-soft)" }}
                aria-label="Open sidebar"
              >
                <PanelRightOpen className="h-3.5 w-3.5" />
                Panel
              </button>
            )}
          </div>

          <DecisionMap
            root={doc.root}
            selectedId={selected}
            onSelect={select}
            emphasized={affected.stronger}
            dimmed={affected.weaker}
          />

          {/* Desktop what-if — map card. No what-if on mobile. */}
          {hasAssumptions && (
            <div className="pointer-events-none absolute bottom-5 left-5 z-10 hidden max-w-sm lg:block">
              {whatIfOpen ? (
                <div
                  className="pointer-events-auto rounded-lg border border-border bg-card/90 p-3.5 backdrop-blur-sm"
                  style={{ boxShadow: "var(--shadow-soft)" }}
                >
                  <div className="mb-2.5 flex items-start justify-between gap-3">
                    <p className="rule-label">What if…</p>
                    <button
                      type="button"
                      onClick={() => {
                        setWhatIfOpen(false);
                        setWhatIf([]);
                      }}
                      className="-mr-1 -mt-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      aria-label="Close what if"
                      title="Close"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <WhatIfPanel
                    doc={doc}
                    active={whatIf}
                    hideLabel
                    onToggle={(a) =>
                      setWhatIf((prev) =>
                        prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
                      )
                    }
                  />
                  {whatIf.length > 0 && (
                    <p className="mt-2.5 text-[11.5px] leading-relaxed text-muted-foreground">
                      Paths that get stronger are ringed; the ones that weaken have stepped back.
                    </p>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setWhatIfOpen(true)}
                  className="pointer-events-auto rounded-full border border-border bg-card/90 px-3 py-1.5 text-[12px] text-muted-foreground backdrop-blur-sm transition-colors hover:border-border-strong hover:text-foreground"
                  style={{ boxShadow: "var(--shadow-soft)" }}
                >
                  What if…
                </button>
              )}
            </div>
          )}

          {/* Mobile tip — laptop / desktop for the full experience */}
          {showMobileTip && !mobileSheet && (
            <div className="absolute inset-x-3 top-[4.75rem] z-30 lg:hidden">
              <div
                className="animate-rise flex items-start gap-3 rounded-2xl border border-border/80 bg-card/92 px-3.5 py-3 backdrop-blur-md"
                style={{ boxShadow: "var(--shadow-panel)" }}
                role="status"
              >
                <Laptop className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium leading-snug">Better on a computer</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                    Open PathWise on a laptop or desktop for a clearer map and the full experience.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={dismissTip}
                  className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="Dismiss"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Mobile floating panel — opens from bottom bar, tall to near nav */}
          {mobileSheet && (
            <div className="absolute inset-0 z-20 lg:hidden">
              <button
                type="button"
                className="absolute inset-0 bg-foreground/10 backdrop-blur-[2px]"
                aria-label="Close panel"
                onClick={() => setMobileSheet(null)}
              />
              <div
                className="animate-rise absolute inset-x-3 top-3 bottom-3 flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-[var(--shadow-panel)] backdrop-blur-xl"
                role="dialog"
                aria-modal="true"
                aria-label={sheetTab}
              >
                <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3.5">
                  <p className="font-display text-[17px] capitalize tracking-[-0.02em]">{sheetTab}</p>
                  <button
                    type="button"
                    onClick={() => setMobileSheet(null)}
                    className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
                  <div className="space-y-8 text-[15px] leading-relaxed [&_.rule-label]:mb-2.5 [&_.surface-card]:p-5 [&_li]:text-[15px] [&_li]:leading-[1.65] [&_p]:text-[15px] [&_p]:leading-[1.65]">
                    {sheetTab === "insights" && <InsightsPanel doc={doc} onSelect={select} />}
                    {sheetTab === "detail" &&
                      (selected ? (
                        <DetailPanel
                          doc={doc}
                          nodeId={selected}
                          onClose={() => {
                            setSelected(null);
                            setMobileSheet(null);
                          }}
                          onSelect={select}
                        />
                      ) : (
                        <p className="text-[15px] leading-relaxed text-muted-foreground">
                          Tap a node on the map — I&apos;ll open its detail here.
                        </p>
                      ))}
                    {sheetTab === "timeline" && (
                      <TimelinePanel doc={doc} activePathId={activePathId} onSelect={select} />
                    )}
                    {sheetTab === "compare" && <ComparePanel doc={doc} onSelect={select} />}
                  </div>
                </div>

                <div className="border-t border-border/60 px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <Bookmark className="h-3.5 w-3.5 shrink-0 text-accent" />
                    <p className="min-w-0 flex-1 text-[12px] text-muted-foreground">
                      Saved in this browser.
                    </p>
                    <Link
                      to="/pro"
                      className="shrink-0 text-[12px] text-accent underline-offset-4 hover:underline"
                    >
                      Keep it →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Desktop / laptop aside — collapsible */}
        <aside
          className={cn(
            "relative z-0 hidden min-h-0 shrink-0 flex-col border-border bg-surface transition-[width,opacity,border-color] duration-300 ease-[var(--ease-out-soft)] lg:flex lg:border-l",
            asideOpen
              ? "w-[400px] border-l opacity-100"
              : "w-0 border-l-transparent opacity-0 pointer-events-none overflow-hidden",
          )}
          aria-hidden={!asideOpen}
        >
          <div className="flex w-[400px] min-h-0 flex-1 flex-col">
            <div className="flex items-center gap-1 border-b border-border px-3 py-2">
              <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "shrink-0 rounded-md px-2.5 py-1.5 text-[12.5px] capitalize transition-colors",
                      tab === t
                        ? "bg-card text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setAside(false)}
                className="ml-1 shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <PanelRightClose className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {tab === "insights" && <InsightsPanel doc={doc} onSelect={select} />}
              {tab === "detail" &&
                (selected ? (
                  <DetailPanel
                    doc={doc}
                    nodeId={selected}
                    onClose={() => setSelected(null)}
                    onSelect={select}
                  />
                ) : (
                  <p className="text-[13.5px] leading-relaxed text-muted-foreground">
                    Pick a node on the map and I&apos;ll open it here — the map stays where you left
                    it.
                  </p>
                ))}
              {tab === "timeline" && (
                <TimelinePanel doc={doc} activePathId={activePathId} onSelect={select} />
              )}
              {tab === "compare" && <ComparePanel doc={doc} onSelect={select} />}
            </div>

            <div className="border-t border-border p-4">
              <div className="flex items-start gap-2.5">
                <Bookmark className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <div>
                  <p className="text-[13px] font-medium">Want to keep this decision?</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                    It&apos;s saved in this browser. An account keeps it anywhere, plus a high-detail
                    decision each period.
                  </p>
                  <Link
                    to="/pro"
                    className="mt-1.5 inline-block text-[12.5px] text-accent underline-offset-4 hover:underline"
                  >
                    What an account adds →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile bottom tab bar */}
        <nav
          className="relative z-30 shrink-0 border-t border-border/80 bg-card/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-md lg:hidden"
          style={{ boxShadow: "0 -8px 24px -18px oklch(0.3 0.02 60 / 35%)" }}
          aria-label="Map panels"
        >
          <div className="grid grid-cols-4 gap-0.5">
            {TABS.map((t) => {
              const active = mobileSheet === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleMobileTab(t)}
                  className={cn(
                    "rounded-xl px-1 py-2.5 text-[11.5px] font-medium capitalize tracking-wide transition-colors",
                    active
                      ? "bg-foreground text-background"
                      : "text-muted-foreground active:bg-secondary",
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
