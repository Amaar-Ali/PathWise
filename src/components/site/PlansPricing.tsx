import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { SignInDialog } from "@/components/auth/SignInDialog";
import { useAuth } from "@/hooks/use-auth";
import { usePlan } from "@/hooks/use-plan";
import {
  isPaddleConfigured,
  openPlanCheckout,
  setPaddleAccessRefreshHandler,
} from "@/lib/paddle-client";
import { planRank, type PlanId } from "@/lib/plan";
import { cn } from "@/lib/utils";

type Plan = {
  id: PlanId;
  name: string;
  price: string;
  priceNote: string;
  line: string;
  featured?: boolean;
  badge?: string;
  cta: "start" | "buy";
  ctaLabel: string;
  items: string[];
};

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    priceNote: "USD · Always free to start",
    line: "For decisions you will come back to.",
    cta: "start",
    ctaLabel: "Start a decision",
    items: [
      "Guest: 1 medium-detail map per day, no signup",
      "Free account: 1 high-detail + 2 medium maps / month",
      "Decision tree: paths, consequences, further decisions, outcomes",
      "Insights, timeline, and in-map comparison views",
      "What-If toggles on the map you just built",
      "History in this browser (account sync expanding)",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$4",
    priceNote: "USD one-time · ₹249 INR · Most people pick this",
    line: "For people making a lot of consequential calls.",
    featured: true,
    badge: "Recommended",
    cta: "buy",
    ctaLabel: "Buy Pro",
    items: [
      "10 high-detail maps per month",
      "25 medium-detail maps per month",
      "Wider trees — more branches and consequence layers per path",
      "What-If exploration on every saved map",
      "Criteria comparison within each decision map",
      "Full saved decision history (permanent Pro access)",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$10",
    priceNote: "USD one-time · ₹800 INR · Everything unlocked",
    line: "When the stakes are high and you want every branch explored.",
    cta: "buy",
    ctaLabel: "Buy Premium",
    items: [
      "Unlimited high-detail maps — no monthly cap",
      "Unlimited medium-detail maps — no monthly cap",
      "Infinite map depth — branches keep going until you stop",
      "Unlimited What-If exploration on every saved map",
      "Unlimited cross-map compares across your full history",
      "Infinite decision history · early tools · priority support",
    ],
  },
];

const compareRows: { feature: string; free: string; pro: string; premium: string }[] = [
  {
    feature: "Medium-detail maps",
    free: "2 / mo · guest 1 / day",
    pro: "25 / month",
    premium: "Unlimited",
  },
  {
    feature: "High-detail maps",
    free: "1 / month",
    pro: "10 / month",
    premium: "Unlimited",
  },
  {
    feature: "Map depth",
    free: "Standard tree depth",
    pro: "Wider trees, more layers",
    premium: "Infinite",
  },
  {
    feature: "What-If exploration",
    free: "Current map only",
    pro: "All saved maps",
    premium: "Unlimited · all maps",
  },
  {
    feature: "Views",
    free: "Insights · timeline · compare",
    pro: "Same + richer criteria",
    premium: "Unlimited cross-map compare",
  },
  {
    feature: "Decision history",
    free: "Browser · account when synced",
    pro: "Full history",
    premium: "Infinite history",
  },
  {
    feature: "Purchase",
    free: "—",
    pro: "One-time",
    premium: "One-time",
  },
];

function ownedLabel(current: PlanId, target: PlanId): string | null {
  if (current === target) return "Current plan";
  if (target === "pro" && current === "premium") return "Included in Premium";
  return null;
}

export function PlansPricing() {
  const { user, loading: authLoading } = useAuth();
  const { plan, loading: planLoading, refreshPlan } = usePlan();
  const [signInOpen, setSignInOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<"pro" | "premium" | null>(null);
  const [busyPlan, setBusyPlan] = useState<"pro" | "premium" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setPaddleAccessRefreshHandler(() => {
      setStatus("Payment received. Unlocking after confirmation…");
      let tries = 0;
      const tick = async () => {
        tries += 1;
        const next = await refreshPlan();
        if (planRank(next) > planRank("free") || tries >= 12) {
          setStatus(
            planRank(next) > planRank("free")
              ? `You're on ${next === "premium" ? "Premium" : "Pro"}.`
              : "Payment received. Access updates in a moment — refresh if needed.",
          );
          return;
        }
        window.setTimeout(() => void tick(), 1500);
      };
      void tick();
    });
    return () => setPaddleAccessRefreshHandler(null);
  }, [refreshPlan]);

  useEffect(() => {
    if (!user || !pendingPlan) return;
    const planToBuy = pendingPlan;
    setPendingPlan(null);
    void startCheckout(planToBuy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pendingPlan]);

  async function startCheckout(target: "pro" | "premium") {
    setError(null);
    setStatus(null);

    if (!user) {
      setPendingPlan(target);
      setSignInOpen(true);
      return;
    }

    if (plan === target || (target === "pro" && plan === "premium")) {
      setStatus(ownedLabel(plan, target) ?? "Already owned.");
      return;
    }

    if (!isPaddleConfigured()) {
      setError("Checkout not configured yet. Add Paddle env vars.");
      return;
    }

    setBusyPlan(target);
    try {
      await openPlanCheckout({
        plan: target,
        userId: user.uid,
        email: user.email,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open checkout.");
    } finally {
      setBusyPlan(null);
    }
  }

  return (
    <>
      <div className="mt-12 grid items-stretch gap-4 lg:grid-cols-3">
        {plans.map((item, i) => {
          const owned = ownedLabel(plan, item.id);
          const isCurrent = plan === item.id;
          const buying = busyPlan === item.id;

          return (
            <article
              key={item.id}
              className={cn(
                "animate-rise relative flex flex-col rounded-xl border p-6 transition-transform duration-300",
                item.featured
                  ? "z-10 border-accent bg-card shadow-[var(--shadow-panel)] lg:-my-2 lg:px-7 lg:py-8"
                  : "surface-card hover:-translate-y-0.5",
                isCurrent && "ring-1 ring-accent/40",
              )}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              {item.badge && !owned && (
                <span className="absolute -top-3 left-6 rounded-full bg-accent px-2.5 py-1 text-[10.5px] font-semibold tracking-[0.12em] text-accent-foreground uppercase">
                  {item.badge}
                </span>
              )}
              {owned && (
                <span className="absolute -top-3 left-6 rounded-full border border-border bg-background px-2.5 py-1 text-[10.5px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  {owned}
                </span>
              )}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="rule-label">{item.name}</p>
                  <p className="mt-3 font-display text-[clamp(1.8rem,3vw,2.2rem)] font-light leading-none tracking-tight">
                    {item.price}
                  </p>
                  <p className="mt-1.5 text-[12.5px] text-muted-foreground">{item.priceNote}</p>
                </div>
                {item.featured && (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden />
                )}
              </div>

              <p className="mt-5 font-display text-[17px] leading-snug">{item.line}</p>

              <ul className="mt-6 flex-1 space-y-2.5 text-[13.5px] leading-relaxed text-muted-foreground">
                {item.items.map((line) => (
                  <li key={line} className="flex gap-2.5">
                    <Check
                      className={cn(
                        "mt-0.5 h-3.5 w-3.5 shrink-0",
                        item.featured ? "text-accent" : "text-muted-foreground",
                      )}
                      strokeWidth={2.2}
                      aria-hidden
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                {item.cta === "start" ? (
                  <Link
                    to="/decide"
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-[14px] font-medium transition-colors hover:border-border-strong"
                  >
                    {item.ctaLabel}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Link>
                ) : owned ? (
                  <button
                    type="button"
                    disabled
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-[14px] font-medium text-muted-foreground"
                  >
                    {owned}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={buying || authLoading || planLoading}
                    onClick={() => void startCheckout(item.id as "pro" | "premium")}
                    className={cn(
                      "group inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0",
                      item.featured
                        ? "bg-foreground text-background"
                        : "border border-border bg-background hover:border-border-strong",
                    )}
                  >
                    {buying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {buying ? "Opening checkout…" : item.ctaLabel}
                    {!buying && (
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    )}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {(error || status) && (
        <p
          className={cn(
            "mt-6 rounded-md border px-4 py-3 text-[13.5px] leading-relaxed",
            error
              ? "border-destructive/30 bg-destructive/5 text-destructive"
              : "border-border bg-card text-muted-foreground",
          )}
        >
          {error ?? status}
        </p>
      )}

      <section className="animate-rise mt-16" style={{ animationDelay: "180ms" }}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="rule-label">Compare</p>
            <h2 className="mt-2 font-display text-[clamp(1.35rem,2.4vw,1.7rem)] leading-tight">
              What changes as you go up.
            </h2>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card shadow-[var(--shadow-soft)]">
          <table className="w-full min-w-[560px] border-collapse text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-border bg-surface/80">
                <th className="px-4 py-3.5 font-medium text-muted-foreground">Feature</th>
                <th className="px-4 py-3.5 font-medium">Free</th>
                <th className="px-4 py-3.5 font-medium text-accent">Pro</th>
                <th className="px-4 py-3.5 font-medium">Premium</th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map((row) => (
                <tr key={row.feature} className="border-b border-border/70 last:border-0">
                  <th scope="row" className="px-4 py-3.5 font-medium text-foreground">
                    {row.feature}
                  </th>
                  <td className="px-4 py-3.5 text-muted-foreground">{row.free}</td>
                  <td className="bg-accent-soft/25 px-4 py-3.5 text-foreground">{row.pro}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{row.premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />
    </>
  );
}
