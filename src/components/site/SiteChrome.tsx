import { Link, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthControls } from "@/components/auth/AuthControls";
import { PathMark } from "@/components/site/PathMark";
import { LEGAL, POLICY_LINKS } from "@/lib/legal-meta";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { to: "/decide", label: "Explore" },
  { to: "/decisions", label: "Decisions" },
  { to: "/pro", label: "Plans" },
] as const;

type SiteNavProps = {
  /** When set, hide the nav once this element scrolls fully past the top. */
  hideAfterId?: string;
};

export function SiteNav({ hideAfterId }: SiteNavProps = {}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!hideAfterId) {
      setVisible(true);
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const section = document.getElementById(hideAfterId);
      if (!section) {
        setVisible(true);
        return;
      }

      // How it works (tall sticky block) is the last nav screen.
      // #demo sits right after it — hide the instant demo reaches the top.
      const demo = document.getElementById("demo");
      const edge = demo?.getBoundingClientRect().top ?? section.getBoundingClientRect().bottom;
      setVisible(edge > 0);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [hideAfterId]);

  return (
    <header
      className="pw-float"
      data-visible={visible ? "true" : "false"}
      aria-hidden={visible ? undefined : true}
    >
      <nav className="pw-float__inner" aria-label="Primary">
        <Link to="/" className="pw-float__brand">
          <PathMark className="pw-float__mark" />
          <span className="pw-float__name">PathWise</span>
        </Link>

        <div className="pw-float__end">
          <ul className="pw-float__links pw-float__links--desktop">
            {NAV.map((item) => {
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="pw-float__link"
                    data-active={active ? "true" : "false"}
                    tabIndex={visible ? undefined : -1}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="pw-float__menu"
                aria-label="Open menu"
                tabIndex={visible ? undefined : -1}
              >
                <Menu className="h-4 w-4" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {NAV.map((item) => (
                <DropdownMenuItem key={item.to} asChild>
                  <Link to={item.to}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <AuthControls disabled={!visible} />
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
