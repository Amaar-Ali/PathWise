import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/site/LegalDoc";
import { LEGAL } from "@/lib/legal-meta";

const TITLE = "Acceptable Use Policy — PathWise";
const DESC = "Rules for using PathWise responsibly, including user-submitted content guidelines.";

export const Route = createFileRoute("/acceptable-use")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: AcceptableUse,
});

function AcceptableUse() {
  return (
    <LegalPage
      title="Acceptable Use Policy"
      description="PathWise is a thinking tool. This Acceptable Use Policy (and community guidelines for user-submitted content) explains what you may and may not do when using the service. It supplements the Terms of Service."
    >
      <LegalSection title="1. Be a good steward of the tool">
        <p>
          Use PathWise to explore real decisions in good faith. Do not use it to harass people,
          commit crimes, evade the law, or cause severe harm. You are responsible for how you
          interpret and act on any map or insight.
        </p>
      </LegalSection>

      <LegalSection title="2. Prohibited activities">
        <p>You may not:</p>
        <ul>
          <li>Break the law or encourage others to break the law through the service.</li>
          <li>
            Upload or generate content that is illegal, exploitative of minors, or that facilitates
            severe violence or terrorism.
          </li>
          <li>
            Attempt to gain unauthorized access to PathWise systems, other users’ accounts, or
            provider infrastructure.
          </li>
          <li>
            Probe, scan, or load-test the service in a way that degrades availability (except with
            our prior written permission).
          </li>
          <li>
            Scrape, bulk-export, or automate access in a manner that circumvents rate limits, plan
            limits, or authentication.
          </li>
          <li>
            Reverse engineer the service except where applicable law expressly allows it despite
            this restriction.
          </li>
          <li>Misrepresent affiliation with PathWise, or use our branding in a misleading way.</li>
          <li>Interfere with security, logging, or abuse-prevention mechanisms.</li>
          <li>
            Resell or rebrand PathWise as your own product without a separate written agreement.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. User content guidelines">
        <p>Decision prompts, assessment answers, and related inputs are user content. Please:</p>
        <ul>
          <li>Do not submit content you do not have the right to share.</li>
          <li>
            Avoid including unnecessary sensitive personal data about yourself or others (medical
            records, financial account numbers, government IDs, precise location of others, etc.).
          </li>
          <li>
            Do not use PathWise to create or refine plans for stalking, doxxing, or targeted
            harassment.
          </li>
          <li>
            Do not attempt to jailbreak or misuse generation features to produce disallowed content
            at scale.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Fair use of generation capacity">
        <p>
          Map generation consumes shared compute. Do not run abusive loops, spam identical prompts,
          or attempt to bypass guest/plan limits. We may throttle, queue, or block abusive traffic.
        </p>
      </LegalSection>

      <LegalSection title="5. Enforcement">
        <p>
          We may investigate suspected violations and may warn, suspend, or terminate accounts or
          access, remove content we host (when applicable), and report matters to authorities when
          we believe we must. These steps do not limit other remedies under the{" "}
          <Link to="/terms">Terms of Service</Link>.
        </p>
      </LegalSection>

      <LegalSection title="6. Reporting">
        <p>
          Report abuse or policy concerns to{" "}
          <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a> with enough detail for
          us to investigate (URLs, timestamps, description).
        </p>
      </LegalSection>

      <LegalSection title="7. Changes">
        <p>
          We may update this Policy as PathWise evolves. Continued use after updates constitutes
          acceptance to the extent permitted by law.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
