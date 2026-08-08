import { Link, useRouterState } from "@tanstack/react-router";
import { AuthControls } from "@/components/auth/AuthControls";
import { PathMark } from "@/components/site/PathMark";
import { LEGAL, POLICY_LINKS } from "@/lib/legal-meta";

const NAV = [
  { to: "/decide", label: "Explore" },
  { to: "/decisions", label: "Decisions" },
  { to: "/pro", label: "Plans" },
] as const;

export function SiteNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="pw-float">
      <nav className="pw-float__inner" aria-label="Primary">
        <Link to="/" className="pw-float__brand">
          <PathMark className="pw-float__mark" />
          <span className="pw-float__name">PathWise</span>
        </Link>

        <div className="pw-float__end">
          <ul className="pw-float__links">
            {NAV.map((item) => {
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="pw-float__link"
                    data-active={active ? "true" : "false"}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <AuthControls />
        </div>
      </nav>
    </header>
  );
}

export { PathMark };

const FOOTER_PRODUCT = [
  { to: "/decide", label: "Explore" },
  { to: "/decisions", label: "My Decisions" },
  { to: "/pro", label: "Plans" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70 bg-surface/40">
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-14">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-2">
              <PathMark />
              <span className="text-[12px] font-semibold tracking-[0.18em] uppercase text-foreground">
                {LEGAL.productName}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-muted-foreground">
              For decisions that deserve more than an answer. Maps paths, consequences, and
              tradeoffs — you stay in charge.
            </p>
            <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">
              Nothing here predicts the future. It helps you think.
            </p>
          </div>

          <div>
            <p className="rule-label">Product</p>
            <ul className="mt-3 space-y-2 text-[13px]">
              {FOOTER_PRODUCT.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="rule-label">Policies & guidelines</p>
            <ul className="mt-3 columns-1 gap-x-6 space-y-2 text-[13px] sm:columns-2">
              {POLICY_LINKS.map((link) => (
                <li key={link.to} className="break-inside-avoid">
                  <Link
                    to={link.to}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border/70 pt-6 text-[12px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {LEGAL.productName}. All rights reserved.
          </p>
          <p>
            Support:{" "}
            <a
              href={`mailto:${LEGAL.contactEmail}`}
              className="text-foreground/80 underline-offset-4 hover:underline"
            >
              {LEGAL.contactEmail}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
