import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/site/LegalDoc";
import { LEGAL } from "@/lib/legal-meta";

const TITLE = "Cookie Policy — PathWise";
const DESC = "How PathWise uses cookies, local storage, and similar technologies.";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: CookiePolicy,
});

function CookiePolicy() {
  return (
    <LegalPage
      title="Cookie Policy"
      description="This Cookie Policy explains how PathWise uses cookies, local storage, and similar technologies. It should be read with our Privacy Policy."
    >
      <LegalSection title="1. What we mean by cookies and similar tech">
        <p>
          “Cookies” are small text files stored on your device. PathWise also uses{" "}
          <strong>local storage</strong> and may use other identifiers provided by Firebase/Google
          Analytics for Firebase. Together we call these “similar technologies.”
        </p>
      </LegalSection>

      <LegalSection title="2. Why we use them">
        <ul>
          <li>
            <strong>Essential / functional.</strong> Store your decision maps and daily guest usage
            limits in the browser so core features work without requiring a server-side account for
            every action.
          </li>
          <li>
            <strong>Authentication.</strong> Firebase Authentication may set cookies or use browser
            storage to keep you signed in and secure sessions.
          </li>
          <li>
            <strong>Analytics (when enabled).</strong> Firebase Analytics (measurement ID configured
            for project <strong>{LEGAL.firebaseProjectId}</strong>) may use cookies or app-instance
            identifiers to measure traffic and feature usage.
          </li>
          <li>
            <strong>Preferences.</strong> Remember soft notices you dismissed (for example a
            cookie/privacy banner).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. What we store locally (examples)">
        <ul>
          <li>
            <code>pathwise.decisions</code> — saved decision documents on this device.
          </li>
          <li>
            <code>pathwise.usage</code> — guest usage counters for rate limits.
          </li>
          <li>
            <code>pathwise.cookieNotice</code> — whether you dismissed the on-site notice.
          </li>
          <li>
            Firebase Auth / Analytics keys as set by Google Firebase SDKs when those features run.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Managing cookies and storage">
        <p>
          Most browsers let you block or delete cookies and clear site storage. If you clear
          PathWise site data, you may lose locally saved decisions and have to sign in again.
          Blocking analytics cookies may limit our ability to understand product usage but should
          not remove essential local storage unless you clear it yourself.
        </p>
        <p>
          For Google Analytics / Firebase Analytics controls, see Google’s published tools and
          documentation for opt-out and privacy settings applicable to your region.
        </p>
      </LegalSection>

      <LegalSection title="5. Do Not Track">
        <p>
          There is no consistent industry standard for “Do Not Track” browser signals. We treat
          privacy primarily through the controls described here and in our{" "}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </LegalSection>

      <LegalSection title="6. Updates">
        <p>
          We may update this Cookie Policy when our technologies change. The “Last updated” date at
          the top will change when we do.
        </p>
      </LegalSection>

      <LegalSection title="7. Contact">
        <p>
          Questions: <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
