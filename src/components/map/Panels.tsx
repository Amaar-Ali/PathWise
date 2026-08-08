import { useMemo, useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import type { DecisionDoc, DecisionNode } from "@/lib/decision-model";
import { collectTimeline, findNode, majorPaths, pathToNode } from "@/lib/decision-model";
import { cn } from "@/lib/utils";

export function DetailPanel({
  doc,
  nodeId,
  onClose,
  onSelect,
}: {
  doc: DecisionDoc;
  nodeId: string;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const node = findNode(doc.root, nodeId);
  const trail = pathToNode(doc.root, nodeId);
  if (!node) return null;

  return (
    <div key={nodeId} className="animate-rise space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <nav className="flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
            {trail.slice(0, -1).map((t) => (
              <button key={t.id} onClick={() => onSelect(t.id)} className="hover:text-foreground">
                {t.kind === "root" ? "Decision" : t.label}{" "}
                <span className="mx-1 opacity-50">/</span>
              </button>
            ))}
          </nav>
          <h3 className="mt-2 font-display text-[22px] leading-tight">{node.label}</h3>
          {node.summary && (
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{node.summary}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <Field label="Why consider it" value={node.why} />
      <Field label="Upside" value={node.upside} />
      <Field label="The tradeoff" value={node.tradeoff} />
      <Field label="Watch out for" value={node.watch} />
      <Field label="Next" value={node.next} />

      {(node.pros?.length || node.cons?.length) && (
        <div className="grid gap-4 sm:grid-cols-2">
          <List label="Holds up" items={node.pros} />
          <List label="Costs" items={node.cons} />
        </div>
      )}

      {node.children?.length ? (
        <div>
          <p className="rule-label mb-2">Leads to</p>
          <div className="space-y-1.5">
            {node.children.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className="flex w-full items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2 text-left text-[13px] transition-colors hover:border-accent"
              >
                <span>{c.label}</span>
                <ArrowLeft className="h-3.5 w-3.5 rotate-180 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | undefined }) {
  if (!value) return null;
  return (
    <div>
      <p className="rule-label mb-1.5">{label}</p>
      <p className="text-[14px] leading-relaxed">{value}</p>
    </div>
  );
}

function List({ label, items }: { label: string; items?: string[] | undefined }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="rule-label mb-1.5">{label}</p>
      <ul className="space-y-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
        {items.map((i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-border-strong" />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function InsightsPanel({
  doc,
  onSelect,
}: {
  doc: DecisionDoc;
  onSelect: (id: string) => void;
}) {
  const rec = doc.recommendation;
  const recPath = findNode(doc.root, rec.pathId);
  return (
    <div className="space-y-8">
      <section>
        <p className="rule-label mb-3">What stands out</p>
        <ul className="space-y-3.5">
          {doc.insights.map((i, idx) => (
            <li
              key={idx}
              className={cn(
                "border-l-2 pl-3 text-[14.5px] leading-relaxed",
                i.emphasis ? "border-accent" : "border-border",
              )}
            >
              {i.text}
            </li>
          ))}
        </ul>
      </section>

      <section className="surface-card p-4">
        <p className="rule-label mb-2">Where I land</p>
        <p className="font-display text-[19px] leading-snug">{rec.lean}</p>
        {recPath && (
          <button
            onClick={() => onSelect(rec.pathId)}
            className="mt-2 text-[12.5px] text-accent underline-offset-4 hover:underline"
          >
            Show {recPath.label} on the map
          </button>
        )}
        <div className="mt-4 space-y-4">
          <Field label="Why" value={rec.why} />
          <Field label="The downside" value={rec.downside} />
          <Field label="What I'm least certain about" value={rec.uncertain} />
          <Field label="What would change this" value={rec.couldChange} />
        </div>
      </section>

      <p className="text-[12.5px] leading-relaxed text-muted-foreground">
        This is a way of thinking about it, not a prediction. You know things about your situation
        that never made it into the map.
      </p>
    </div>
  );
}

export function TimelinePanel({
  doc,
  activePathId,
  onSelect,
}: {
  doc: DecisionDoc;
  activePathId: string | null;
  onSelect: (id: string) => void;
}) {
  const paths = majorPaths(doc);
  const [localId, setLocalId] = useState<string | null>(null);
  const currentId = activePathId ?? localId ?? paths[0]?.id ?? null;
  const current = currentId ? findNode(doc.root, currentId) : undefined;
  const rootPath = useMemo(() => {
    if (!currentId) return undefined;
    const trail = pathToNode(doc.root, currentId);
    return trail[1] ?? current;
  }, [currentId, doc.root, current]);
  const events = rootPath ? collectTimeline(rootPath) : [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1.5">
        {paths.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setLocalId(p.id);
              onSelect(p.id);
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-[12px] transition-colors",
              rootPath?.id === p.id
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border hover:border-border-strong",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {events.length === 0 ? (
        <p className="text-[13.5px] text-muted-foreground">
          This path doesn&apos;t have meaningful milestones yet.
        </p>
      ) : (
        <ol className="relative space-y-5 pl-5">
          <span className="absolute left-[3px] top-2 bottom-2 w-px bg-border" />
          <li className="relative">
            <span className="absolute -left-5 top-1.5 h-1.5 w-1.5 rounded-full bg-foreground" />
            <p className="rule-label">Now</p>
          </li>
          {events.map((e, i) => (
            <li key={`${e.nodeId}-${i}`} className="relative">
              <span className="absolute -left-5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
              <button onClick={() => onSelect(e.nodeId)} className="text-left">
                <p className="text-[14px] leading-snug">{e.label}</p>
                <p className="text-[12px] text-muted-foreground">{e.when}</p>
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function ComparePanel({
  doc,
  onSelect,
}: {
  doc: DecisionDoc;
  onSelect: (id: string) => void;
}) {
  const paths = majorPaths(doc);
  const [picked, setPicked] = useState<string[]>(paths.slice(0, 2).map((p) => p.id));

  const toggle = (id: string) =>
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id].slice(-3),
    );

  const chosen = paths.filter((p) => picked.includes(p.id));

  return (
    <div className="space-y-5">
      <div>
        <p className="rule-label mb-2">Compare up to three</p>
        <div className="flex flex-wrap gap-1.5">
          {paths.map((p) => (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-[12px] transition-colors",
                picked.includes(p.id)
                  ? "border-accent bg-accent-soft"
                  : "border-border hover:border-border-strong",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        {doc.criteria.map((c) => (
          <div key={c}>
            <p className="mb-2 text-[12.5px] font-medium">{c}</p>
            <div className="space-y-2">
              {chosen.map((p) => {
                const v = p.scores?.[c] ?? 0;
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelect(p.id)}
                    className="block w-full text-left"
                  >
                    <div className="mb-1 flex justify-between text-[11.5px] text-muted-foreground">
                      <span>{p.label}</span>
                      <span className="tabular-nums">{v}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-700"
                        style={{ width: `${Math.min(100, Math.max(0, v))}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-[12px] leading-relaxed text-muted-foreground">
        These criteria came from your situation, not a template. Higher isn&apos;t automatically
        better — more time cost is still time you spend.
      </p>
    </div>
  );
}

export function WhatIfPanel({
  doc,
  active,
  onToggle,
}: {
  doc: DecisionDoc;
  active: string[];
  onToggle: (id: string) => void;
}) {
  if (!doc.assumptions?.length) return null;
  return (
    <div className="space-y-2.5">
      <p className="rule-label">What if…</p>
      <div className="flex flex-wrap gap-1.5">
        {doc.assumptions.map((a) => (
          <button
            key={a.id}
            title={a.hint}
            onClick={() => onToggle(a.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-[12px] transition-all duration-300",
              active.includes(a.id)
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-card hover:border-border-strong",
            )}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function nodesAffectedBy(doc: DecisionDoc, active: string[]) {
  const stronger = new Set<string>();
  const weaker = new Set<string>();
  if (!active.length) return { stronger, weaker };
  const visit = (n: DecisionNode) => {
    if (n.strongerWhen?.some((a) => active.includes(a))) stronger.add(n.id);
    if (n.weakerWhen?.some((a) => active.includes(a))) weaker.add(n.id);
    n.children?.forEach(visit);
  };
  visit(doc.root);
  return { stronger, weaker };
}
