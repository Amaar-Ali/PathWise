import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/site/SiteChrome";
import { LEGAL, POLICY_LINKS } from "@/lib/legal-meta";

const TITLE = "Contact & support — PathWise";
const DESC =
  "PathWise support channels, response times, and self-service help for product, billing, and privacy questions.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: ContactPage,
});

const SUPPORT_KINDS = [
  {
    title: "Product help",
    body: "Maps not generating, sign-in issues, saved decisions, What-If or comparison views, plan limits.",
  },
  {
    title: "Billing & access",
    body: "One-time Pro/Premium checkout via Paddle, missing unlock after payment, refunds — see Billing too.",
  },
  {
    title: "Privacy & account",
    body: "Data access, deletion, or other privacy requests under the Privacy Policy.",
  },
  {
    title: "Policy questions",
    body: "Terms, acceptable use, cookies, or the decision-map disclaimer.",
  },
] as const;

const SELF_SERVICE = [
  {
    href: "/#how-it-works",
    label: "How it works",
    body: "Four-step walkthrough of question → paths → consequences → explore.",
  },
  {
    to: "/decide" as const,
    label: "Start a decision",
    body: "Onboarding in the product: name the decision, answer a short context flow, get a map.",
  },
  {
    to: "/pro" as const,
    label: "Plans & pricing",
    body: "Free vs Pro ($4) vs Premium ($10) — one-time, not subscriptions.",
  },
  {
    to: "/billing" as const,
    label: "Billing & refunds",
    body: "How Paddle checkout, ownership, and refunds work.",
  },
] as const;

function ContactPage() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-5 py-14 md:py-20">
        <p className="rule-label animate-rise">Support</p>
        <h1
          className="animate-rise mt-3 font-display text-[clamp(1.9rem,4vw,2.75rem)] font-light leading-tight"
          style={{ animationDelay: "60ms" }}
        >
          Contact &amp; support
        </h1>
        <p
          className="animate-rise mt-4 text-[15px] leading-relaxed text-muted-foreground"
          style={{ animationDelay: "120ms" }}
        >
          PathWise is a small product. Support is email-based — calm, direct, and honest about
          timing. No phone line, live chat, or ticket portal yet.
        </p>

        <section className="animate-rise mt-12" style={{ animationDelay: "160ms" }}>
          <h2 className="font-display text-[1.35rem] font-normal leading-snug">
            What we can help with
          </h2>
          <ul className="mt-5 space-y-5">
            {SUPPORT_KINDS.map((item) => (
              <li
                key={item.title}
                className="border-t border-border/70 pt-4 first:border-0 first:pt-0"
              >
                <p className="text-[14.5px] font-medium">{item.title}</p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="animate-rise mt-12" style={{ animationDelay: "200ms" }}>
          <h2 className="font-display text-[1.35rem] font-normal leading-snug">
            Support channel
          </h2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-foreground/90">
            Email{" "}
            <a
              href={`mailto:${LEGAL.contactEmail}`}
              className="text-accent underline-offset-4 hover:underline"
            >
              <strong>{LEGAL.contactEmail}</strong>
            </a>
            . Same address is used as the Firebase Auth support email for Google sign-in.
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
            Please include: what you were trying to do, approximate time and browser/device, account
            email if signed in, and for privacy requests the right you want to exercise.
          </p>
        </section>

        <section className="animate-rise mt-12" style={{ animationDelay: "240ms" }}>
          <h2 className="font-display text-[1.35rem] font-normal leading-snug">
            Response times
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[14.5px] leading-relaxed text-foreground/90">
            <li>
              <strong>Free &amp; Pro:</strong> we aim to reply within a few business days for
              ordinary product, billing, and privacy email.
            </li>
            <li>
              <strong>Premium:</strong> same channel, with priority in the queue when volume is high
              (listed on Plans as priority support).
            </li>
            <li>Complex legal or data requests may take longer. This is not a real-time desk.</li>
          </ul>
        </section>

        <section className="animate-rise mt-12" style={{ animationDelay: "280ms" }}>
          <h2 className="font-display text-[1.35rem] font-normal leading-snug">
            Self-service first
          </h2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">
            Many answers live on the site — try these before emailing.
          </p>
          <ul className="mt-5 space-y-4">
            {SELF_SERVICE.map((item) => (
              <li key={item.label}>
                {"href" in item ? (
                  <a
                    href={item.href}
                    className="text-[14.5px] font-medium text-accent underline-offset-4 hover:underline"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    to={item.to}
                    className="text-[14.5px] font-medium text-accent underline-offset-4 hover:underline"
                  >
                    {item.label}
                  </Link>
                )}
                <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="animate-rise mt-12" style={{ animationDelay: "320ms" }}>
          <h2 className="font-display text-[1.35rem] font-normal leading-snug">Policies</h2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">
            Full policy set:
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[13.5px]">
            {POLICY_LINKS.filter((l) => l.to !== "/contact").map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <aside className="mt-14 border-t border-border/70 pt-8 text-[12.5px] leading-relaxed text-muted-foreground">
          <p>
            Legal entity and registered address are not finalized for publication (
            {LEGAL.legalEntityPlaceholder}). Firebase project: {LEGAL.firebaseProjectId}.
          </p>
        </aside>
      </main>
      <SiteFooter />
    </div>
  );
}
