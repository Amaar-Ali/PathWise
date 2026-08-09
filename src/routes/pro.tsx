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

        <ul
          className="animate-rise mt-8 grid max-w-3xl gap-3 text-[14px] leading-relaxed text-muted-foreground sm:grid-cols-3"
          style={{ animationDelay: "150ms" }}
        >
          <li>
            <span className="font-medium text-foreground">Free</span> — try real maps with
            guest/account limits.
          </li>
          <li>
            <span className="font-medium text-foreground">Pro · $4</span> — more maps, wider trees,
            full history.
          </li>
          <li>
            <span className="font-medium text-foreground">Premium · $10</span> — unlimited depth,
            priority email support.
          </li>
        </ul>

        <PlansPricing />

        <section
          className="animate-rise mt-16 border-t border-border/70 pt-12"
          style={{ animationDelay: "220ms" }}
        >
          <p className="rule-label">Who this is for</p>
          <h2 className="mt-2 max-w-xl font-display text-[clamp(1.35rem,2.4vw,1.7rem)] leading-tight">
            People weighing forks that matter — jobs, moves, money, commitments.
          </h2>
          <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-muted-foreground">
            PathWise solves foggy high-stakes choices by mapping options, consequences, and
            tradeoffs before you commit. Not a quiz. Not a prediction engine. Start free; upgrade
            once when you need more depth or monthly maps.
          </p>
          <ol className="mt-6 max-w-xl space-y-2 text-[14px] leading-relaxed text-muted-foreground">
            <li>
              <strong className="font-medium text-foreground">1.</strong>{" "}
              <Link to="/decide" className="text-accent underline-offset-4 hover:underline">
                Start a decision
              </Link>{" "}
              — name the question.
            </li>
            <li>
              <strong className="font-medium text-foreground">2.</strong> Answer the short context
              flow.
            </li>
            <li>
              <strong className="font-medium text-foreground">3.</strong> Explore the map; buy Pro or
              Premium only if you hit Free limits or want more depth.
            </li>
          </ol>
        </section>

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
            checkouts grant nothing. Ownership sticks across logout/login. Support is email — see{" "}
            <Link to="/contact" className="text-accent underline-offset-4 hover:underline">
              Contact &amp; support
            </Link>{" "}
            for channels and response times.
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
