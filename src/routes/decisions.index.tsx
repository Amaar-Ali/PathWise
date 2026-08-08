import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site/SiteChrome";
import { deleteDecision, loadDecisions } from "@/lib/decision-store";
import { findNode } from "@/lib/decision-model";
import type { DecisionDoc } from "@/lib/decision-model";

const TITLE = "My decisions — PathWise";
const DESC = "A library of the decisions you've mapped with PathWise.";

export const Route = createFileRoute("/decisions/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: Decisions,
});

function Decisions() {
  const [docs, setDocs] = useState<DecisionDoc[] | null>(null);
  useEffect(() => setDocs(loadDecisions()), []);

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <p className="rule-label">Your library</p>
        <h1 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.6rem)] font-light leading-tight">
          My decisions
        </h1>

        {docs && docs.length === 0 && (
          <div className="mt-10 rounded-lg border border-border bg-card p-6">
            <p className="font-display text-[18px]">Nothing mapped yet.</p>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
              When you map a decision it lands here, so you can come back to it as things change.
            </p>
            <div className="mt-4 flex gap-4 text-[13.5px]">
              <Link to="/decide" className="text-accent underline-offset-4 hover:underline">
                Start a decision →
              </Link>
              <Link
                to="/decisions/$id"
                params={{ id: "sample" }}
                className="text-muted-foreground hover:text-foreground"
              >
                Or open the sample map
              </Link>
            </div>
          </div>
        )}

        <ul className="mt-10 divide-y divide-border border-y border-border">
          {docs?.map((d) => {
            const rec = findNode(d.root, d.recommendation?.pathId ?? "");
            return (
              <li key={d.id} className="flex items-center justify-between gap-4 py-5">
                <div className="min-w-0">
                  <Link
                    to="/decisions/$id"
                    params={{ id: d.id }}
                    className="font-display text-[19px] leading-snug hover:text-accent"
                  >
                    {d.title}
                  </Link>
                  <p className="mt-1 text-[12.5px] text-muted-foreground">
                    {new Date(d.createdAt).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {rec ? ` · leaning ${rec.label}` : ""} · {d.depth} detail
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-[12.5px]">
                  <Link
                    to="/decisions/$id"
                    params={{ id: d.id }}
                    className="text-accent underline-offset-4 hover:underline"
                  >
                    Continue
                  </Link>
                  <button
                    onClick={() => {
                      deleteDecision(d.id);
                      setDocs(loadDecisions());
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
