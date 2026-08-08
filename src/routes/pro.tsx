import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/site/SiteChrome";
import { PlansPricing } from "@/components/site/PlansPricing";
import { usePlan } from "@/hooks/use-plan";
import { useAuth } from "@/hooks/use-auth";

const TITLE = "PathWise Plans — Free, Pro, Premium";
const DESC =
  "Free, Pro and Premium: what each tier gives you. Pro and Premium are one-time purchases.";

export const Route = createFileRoute("/pro")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: Pro,
});

function Pro() {
  const { user } = useAuth();
  const { plan, loading } = usePlan();

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-5 py-16 md:py-20">
        <p className="rule-label animate-rise">Plans</p>
        <h1
          className="animate-rise mt-3 max-w-2xl font-display text-[clamp(1.9rem,4vw,2.8rem)] font-light leading-tight"
          style={{ animationDelay: "60ms" }}
        >
          Depth is the thing you&apos;re paying for. Not volume.
        </h1>
        <p
          className="animate-rise mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground"
          style={{ animationDelay: "120ms" }}
        >
          Every tier gives you a real map. Higher tiers give the map more room to go deeper before
          it stops. Pro and Premium are one-time purchases — not subscriptions.
        </p>

        <PlansPricing />

        <div
          className="animate-rise mt-12 rounded-xl border border-border bg-surface/60 p-6 md:p-7"
          style={{ animationDelay: "240ms" }}
        >
          <p className="font-display text-[19px] leading-snug">
            {!loading && user
              ? plan === "free"
                ? "You're on Free."
                : `You're on ${plan === "premium" ? "Premium" : "Pro"}.`
              : "Sign in before checkout."}
          </p>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
            Access unlocks after Paddle confirms payment (server webhook). Cancelled or failed
            checkouts grant nothing. Ownership sticks across logout/login.
          </p>
          <Link
            to="/decide"
            className="mt-4 inline-block text-[13.5px] text-accent underline-offset-4 hover:underline"
          >
            Map a decision →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
