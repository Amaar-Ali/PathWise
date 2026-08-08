import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bookmark } from "lucide-react";
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

function Workspace() {
  const { id } = useParams({ from: "/decisions/$id" });
  const [doc, setDoc] = useState<DecisionDoc | null>(null);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("insights");
  const [whatIf, setWhatIf] = useState<string[]>([]);

  useEffect(() => {
    setDoc(id === "sample" ? sampleDecision : (loadDecision(id) ?? null));
    setReady(true);
  }, [id]);

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
    if (nodeId) setTab("detail");
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

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <SiteNav />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section className="relative min-h-[52vh] flex-1">
          <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-start justify-between gap-4 px-5 pb-5 pt-16">
            <div className="pointer-events-auto max-w-md">
              <p className="rule-label">{doc.depth === "high" ? "High detail" : "Medium detail"}</p>
              <h1 className="mt-1 font-display text-[20px] leading-snug">{doc.title}</h1>
            </div>
          </div>

          <DecisionMap
            root={doc.root}
            selectedId={selected}
            onSelect={select}
            emphasized={affected.stronger}
            dimmed={affected.weaker}
          />

          <div className="pointer-events-none absolute bottom-20 left-5 max-w-sm lg:bottom-5">
            <div
              className="pointer-events-auto rounded-lg border border-border bg-card/90 p-3.5 backdrop-blur-sm"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              <WhatIfPanel
                doc={doc}
                active={whatIf}
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
          </div>
        </section>

        <aside className="flex w-full shrink-0 flex-col border-t border-border bg-surface lg:h-auto lg:w-[400px] lg:border-l lg:border-t-0">
          <div className="flex items-center gap-1 border-b border-border px-3 py-2">
            {(["insights", "detail", "timeline", "compare"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-[12.5px] capitalize transition-colors",
                  tab === t
                    ? "bg-card text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
              </button>
            ))}
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
        </aside>
      </div>
    </div>
  );
}
