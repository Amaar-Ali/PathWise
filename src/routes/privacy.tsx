import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/site/LegalDoc";
import { LEGAL } from "@/lib/legal-meta";

const TITLE = "Privacy Policy — PathWise";
const DESC =
  "How PathWise collects, uses, stores, and shares information when you use the product.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="This Privacy Policy explains what information PathWise processes, why we process it, and the choices you have. It applies to the PathWise web application and related services."
    >
      <LegalSection title="1. Who we are">
        <p>
          {LEGAL.productName} (“PathWise,” “we,” “us”) is a decision-mapping product. The service is
          associated with the Firebase project <strong>{LEGAL.firebaseProjectId}</strong>.
        </p>
        <p>
          Operator identity for formal notices: {LEGAL.legalEntityPlaceholder},{" "}
          {LEGAL.registeredAddressPlaceholder}. Until those details are finalized, privacy questions
          may be sent to <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
        </p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <p>Depending on how you use PathWise, we may process:</p>
        <ul>
          <li>
            <strong>Account information.</strong> If you sign in, Firebase Authentication may
            process your email address, display name, authentication provider identifiers (for
            example Google), and security-related auth metadata.
          </li>
          <li>
            <strong>Decision and assessment content.</strong> Questions you ask, context you
            provide, assessment answers, generated decision trees/maps, insights, and related inputs
            you submit to create or explore a map.
          </li>
          <li>
            <strong>Local browser storage.</strong> Decision documents and usage counters may be
            stored in your browser’s local storage (for example keys such as{" "}
            <code>pathwise.decisions</code> and <code>pathwise.usage</code>) so you can return to
            maps on that device.
          </li>
          <li>
            <strong>Usage and analytics data.</strong> When Firebase Analytics is enabled (Google
            Analytics for Firebase / measurement ID), we may receive approximate usage events such
            as page views, session signals, device/browser characteristics, and similar product
            analytics. See also our <Link to="/cookies">Cookie Policy</Link>.
          </li>
          <li>
            <strong>Technical and security logs.</strong> Standard request metadata (for example IP
            address, user agent, timestamps, error diagnostics) may be processed by hosting,
            Firebase, or error-reporting tooling to operate and secure the service.
          </li>
          <li>
            <strong>Communications.</strong> If you email us, we process the content of that message
            and your contact details to respond.
          </li>
        </ul>
        <p>
          We do not intentionally ask for special-category data (for example health diagnoses,
          precise biometrics, or government ID numbers). If you choose to include sensitive personal
          details in a decision prompt, you do so at your own risk — treat prompts as content you
          are comfortable processing through the service and its providers.
        </p>
      </LegalSection>

      <LegalSection title="3. How we use information">
        <ul>
          <li>
            Provide, maintain, and improve PathWise (including map generation and account features).
          </li>
          <li>Authenticate users and protect accounts against abuse.</li>
          <li>Enforce plan limits, prevent spam/abuse, and debug failures.</li>
          <li>
            Understand product usage via analytics (when enabled) so we can improve reliability and
            UX.
          </li>
          <li>Respond to support requests and send service-related notices when needed.</li>
          <li>Comply with law and protect our rights, users, and the integrity of the service.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Firebase Authentication and Analytics">
        <p>
          PathWise uses <strong>Google Firebase</strong> for authentication (email/password and
          Google sign-in where enabled). Authentication data is processed under Google’s/Firebase’s
          terms and privacy practices in addition to this Policy.
        </p>
        <p>
          PathWise is configured for <strong>Firebase Analytics</strong> when a measurement ID is
          present. Analytics may use cookies or similar identifiers. You can limit analytics through
          browser controls, OS privacy settings, and (where available) Google’s tools. Essential
          local storage for decisions may still be required for core product features.
        </p>
      </LegalSection>

      <LegalSection title="5. AI / generation processing">
        <p>
          To build decision maps, PathWise may send your prompts, assessment answers, and related
          context to third-party model or inference providers. Those providers process content to
          return generated structures. Do not submit confidential information you are not allowed to
          share with service providers.
        </p>
      </LegalSection>

      <LegalSection title="6. Sharing of information">
        <p>We do not sell your personal information. We may share information with:</p>
        <ul>
          <li>
            <strong>Service providers</strong> that help us run PathWise (for example
            Firebase/Google, hosting, analytics, and model/API providers), under contractual or
            platform terms.
          </li>
          <li>
            <strong>Legal and safety recipients</strong> when required by law, valid legal process,
            or to protect rights, safety, and security.
          </li>
          <li>
            <strong>Business transfers</strong> if PathWise is involved in a merger, acquisition, or
            asset sale — in which case information may transfer as part of that transaction subject
            to applicable law.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Retention">
        <ul>
          <li>
            <strong>Local storage.</strong> Decision data stored in your browser remains until you
            clear site data, delete decisions in-product (where available), or the browser evicts
            storage.
          </li>
          <li>
            <strong>Accounts.</strong> Auth records persist while your account exists and for a
            reasonable period afterward as needed for security, abuse prevention, and legal
            compliance.
          </li>
          <li>
            <strong>Logs and analytics.</strong> Retained for operational periods typical of the
            underlying platforms, then deleted or aggregated.
          </li>
          <li>
            <strong>Support emails.</strong> Retained as long as needed to resolve your request and
            maintain business records.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Security">
        <p>
          We use reasonable administrative, technical, and organizational measures appropriate to a
          consumer SaaS product (including HTTPS and provider security controls). No method of
          transmission or storage is 100% secure. You are responsible for safeguarding your account
          credentials and the devices you use.
        </p>
      </LegalSection>

      <LegalSection title="9. Your rights and choices">
        <p>
          Depending on where you live, you may have rights to access, correct, delete, or export
          personal data, or to object to / restrict certain processing. To exercise a request, email{" "}
          <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>. We may need to verify
          your identity.
        </p>
        <p>
          You can also: sign out; delete locally stored decisions by clearing site data; and use
          browser settings to block or delete cookies where analytics is used. Some features may not
          work without essential storage.
        </p>
      </LegalSection>

      <LegalSection title="10. International transfers">
        <p>
          PathWise and its providers may process data in the United States and other countries.
          Where required, we rely on appropriate transfer mechanisms available through our providers
          and applicable law.
        </p>
      </LegalSection>

      <LegalSection title="11. Children">
        <p>
          PathWise is not directed to children under 13 (or the minimum age required in your
          jurisdiction). We do not knowingly collect personal information from children. If you
          believe a child has provided personal data, contact us and we will take appropriate steps
          to delete it.
        </p>
      </LegalSection>

      <LegalSection title="12. Changes">
        <p>
          We may update this Policy from time to time. We will revise the “Last updated” date above
          and, for material changes, may provide additional notice in the product or by email when
          appropriate. Continued use after an update means you accept the revised Policy, to the
          extent permitted by law.
        </p>
      </LegalSection>

      <LegalSection title="13. Contact">
        <p>
          Privacy questions: <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>. See
          also <Link to="/contact">Contact</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
