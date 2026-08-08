import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/site/SiteChrome";
import { LEGAL, POLICY_LINKS } from "@/lib/legal-meta";

type LegalPageProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function LegalPage({ title, description, children }: LegalPageProps) {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-5 py-14 md:py-20">
        <p className="rule-label">Policies</p>
        <h1 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.75rem)] font-light leading-tight">
          {title}
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{description}</p>
        <p className="mt-5 text-[12.5px] text-muted-foreground">
          Effective: {LEGAL.effectiveDate}
          <span className="mx-2 text-border-strong">·</span>
          Last updated: {LEGAL.lastUpdated}
        </p>

        <div className="prose-legal mt-10 space-y-9">{children}</div>

        <aside className="mt-14 border-t border-border/70 pt-8">
          <p className="rule-label">Related</p>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[13px]">
            {POLICY_LINKS.map((link) => (
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
          <p className="mt-6 text-[12.5px] leading-relaxed text-muted-foreground">
            These documents are standard product policies for {LEGAL.productName}. They reduce
            ambiguity and legal risk, but they are not a substitute for counsel. Have a qualified
            lawyer review them before a public launch or paid offering.
          </p>
        </aside>
      </main>
      <SiteFooter />
    </div>
  );
}

type LegalSectionProps = {
  id?: string;
  title: string;
  children: ReactNode;
};

export function LegalSection({ id, title, children }: LegalSectionProps) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="font-display text-[1.35rem] font-normal leading-snug">{title}</h2>
      <div className="mt-3 space-y-3 text-[14.5px] leading-relaxed text-foreground/90 [&_a]:text-accent [&_a]:underline-offset-4 [&_a:hover]:underline [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
