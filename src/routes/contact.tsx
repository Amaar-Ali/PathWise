import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/site/LegalDoc";
import { LEGAL } from "@/lib/legal-meta";

const TITLE = "Contact — PathWise";
const DESC = "How to reach PathWise for support, privacy, and policy questions.";

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

function ContactPage() {
  return (
    <LegalPage
      title="Contact & support"
      description="Reach the PathWise team for product support, privacy requests, and policy questions."
    >
      <LegalSection title="1. Email">
        <p>
          Primary contact:{" "}
          <a href={`mailto:${LEGAL.contactEmail}`}>
            <strong>{LEGAL.contactEmail}</strong>
          </a>
          . This address is also configured as the Firebase Auth support email for the PathWise
          Google sign-in brand.
        </p>
        <p>Please include:</p>
        <ul>
          <li>What you were trying to do</li>
          <li>Approximate time and browser/device</li>
          <li>Account email (if signed in)</li>
          <li>For privacy requests: the right you want to exercise</li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Operator details (placeholders)">
        <p>Formal legal entity and mailing address are not finalized for publication:</p>
        <ul>
          <li>Legal entity: {LEGAL.legalEntityPlaceholder}</li>
          <li>Registered address: {LEGAL.registeredAddressPlaceholder}</li>
          <li>Firebase project: {LEGAL.firebaseProjectId}</li>
        </ul>
        <p>Update these before a public commercial launch.</p>
      </LegalSection>

      <LegalSection title="3. Response expectations">
        <p>
          We aim to reply within a few business days for ordinary support and privacy emails.
          Complex legal or data requests may take longer. This page is not a real-time support desk.
        </p>
      </LegalSection>

      <LegalSection title="4. Policies">
        <p>
          Browse <Link to="/privacy">Privacy</Link>, <Link to="/terms">Terms</Link>,{" "}
          <Link to="/cookies">Cookies</Link>, <Link to="/acceptable-use">Acceptable Use</Link>,{" "}
          <Link to="/disclaimer">Disclaimer</Link>, and{" "}
          <Link to="/billing">Billing &amp; Refunds</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
