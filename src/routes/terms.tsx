import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/site/LegalDoc";
import { LEGAL } from "@/lib/legal-meta";

const TITLE = "Terms of Service — PathWise";
const DESC = "The terms that govern your use of the PathWise decision-mapping service.";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: TermsOfService,
});

function TermsOfService() {
  return (
    <LegalPage
      title="Terms of Service"
      description="These Terms of Service (“Terms”) form a binding agreement between you and PathWise for access to and use of the PathWise website and application. By using PathWise, you agree to these Terms."
    >
      <LegalSection title="1. The service">
        <p>
          {LEGAL.productName} helps you explore decisions through interactive maps of options,
          consequences, tradeoffs, and outcomes. Features may include guest usage, accounts,
          assessments, saved decisions, and paid plans described on the <Link to="/pro">Plans</Link>{" "}
          page. Features may change as the product evolves.
        </p>
        <p>
          Operator for these Terms: {LEGAL.legalEntityPlaceholder},{" "}
          {LEGAL.registeredAddressPlaceholder}. Contact:{" "}
          <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
        </p>
      </LegalSection>

      <LegalSection title="2. Eligibility and accounts">
        <p>
          You must be able to form a binding contract under applicable law. If you create an
          account, you must provide accurate information, keep credentials secure, and notify us of
          unauthorized use. You are responsible for activity under your account.
        </p>
      </LegalSection>

      <LegalSection title="3. Acceptable use">
        <p>
          You must follow our <Link to="/acceptable-use">Acceptable Use Policy</Link>. We may
          suspend or terminate access for violations, abuse, or risk to the service or other users.
        </p>
      </LegalSection>

      <LegalSection title="4. Your content">
        <p>
          You retain rights in the prompts, answers, and other content you submit (“User Content”).
          You grant PathWise a worldwide, non-exclusive, royalty-free license to host, process,
          transmit, and display User Content solely as needed to operate, secure, and improve the
          service (including sending content to generation providers to create maps).
        </p>
        <p>
          You represent that you have the rights to submit User Content and that it does not violate
          law or third-party rights. You are responsible for backing up content you care about —
          especially content stored only in your browser.
        </p>
      </LegalSection>

      <LegalSection title="5. Output and no professional advice">
        <p>
          Maps, suggestions, leanings, insights, and other outputs are informational tools for
          thinking. They are <strong>not</strong> legal, medical, financial, tax, psychological,
          career-counseling, or other professional advice. Read the full{" "}
          <Link to="/disclaimer">Disclaimer</Link>. You remain solely responsible for decisions you
          make.
        </p>
      </LegalSection>

      <LegalSection title="6. Plans, billing, and refunds">
        <p>
          Plan descriptions and billing rules (including placeholders while payments are not yet
          live) are set out in the <Link to="/billing">Billing &amp; Refund Policy</Link> and on the
          Plans page. Paid features may require an account and acceptance of processor terms when
          checkout is enabled.
        </p>
      </LegalSection>

      <LegalSection title="7. Intellectual property">
        <p>
          PathWise, including software, branding, UI, and documentation (excluding User Content), is
          owned by us or our licensors. These Terms do not transfer ownership to you. You may not
          copy, reverse engineer (except where law prohibits that restriction), or create competing
          services by misusing our materials.
        </p>
      </LegalSection>

      <LegalSection title="8. Third-party services">
        <p>
          PathWise relies on third parties such as Firebase Authentication, Firebase Analytics (when
          enabled), hosting, and AI/model providers. Their services are subject to their own terms.
          We are not responsible for third-party outages or changes outside our reasonable control.
        </p>
      </LegalSection>

      <LegalSection title="9. Privacy">
        <p>
          Our <Link to="/privacy">Privacy Policy</Link> and <Link to="/cookies">Cookie Policy</Link>{" "}
          describe how we handle personal information.
        </p>
      </LegalSection>

      <LegalSection title="10. Disclaimers">
        <p>
          PATHWISE IS PROVIDED <strong>“AS IS”</strong> AND <strong>“AS AVAILABLE.”</strong> TO THE
          MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR
          STATUTORY, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
          PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT OUTPUTS WILL BE ACCURATE,
          COMPLETE, CURRENT, OR SUITABLE FOR YOUR SITUATION, OR THAT THE SERVICE WILL BE
          UNINTERRUPTED OR ERROR-FREE.
        </p>
      </LegalSection>

      <LegalSection title="11. Limitation of liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, PATHWISE AND ITS OPERATORS, AFFILIATES, AND
          SUPPLIERS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
          EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, GOODWILL, OR BUSINESS
          OPPORTUNITY, ARISING FROM OR RELATED TO YOUR USE OF THE SERVICE OR RELIANCE ON ANY OUTPUT
          — EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>
        <p>
          OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THE SERVICE WILL NOT
          EXCEED THE GREATER OF (A) THE AMOUNTS YOU PAID TO PATHWISE FOR THE SERVICE IN THE TWELVE
          (12) MONTHS BEFORE THE CLAIM OR (B) USD $50 IF YOU HAVE NOT PAID US. SOME JURISDICTIONS DO
          NOT ALLOW CERTAIN LIMITATIONS; IN THOSE CASES, OUR LIABILITY IS LIMITED TO THE MAXIMUM
          EXTENT PERMITTED BY LAW.
        </p>
      </LegalSection>

      <LegalSection title="12. Indemnity">
        <p>
          You will defend and indemnify PathWise and its operators against claims, damages, losses,
          and expenses (including reasonable legal fees) arising from your User Content, your misuse
          of the service, or your violation of these Terms or applicable law.
        </p>
      </LegalSection>

      <LegalSection title="13. Suspension and termination">
        <p>
          You may stop using PathWise at any time. We may suspend or terminate access immediately if
          we reasonably believe you violated these Terms, create risk or legal exposure, or if we
          discontinue the service. Sections that by nature should survive (including IP,
          disclaimers, liability limits, and indemnity) will survive termination.
        </p>
      </LegalSection>

      <LegalSection title="14. Changes to the Terms">
        <p>
          We may modify these Terms by posting an updated version with a new “Last updated” date.
          Material changes may be highlighted in the product when practical. If you continue using
          PathWise after changes take effect, you accept the updated Terms to the extent permitted
          by law. If you do not agree, stop using the service.
        </p>
      </LegalSection>

      <LegalSection title="15. Governing law">
        <p>
          These Terms are governed by {LEGAL.governingLaw}, without regard to conflict-of-law rules
          that would require another jurisdiction’s law. Courts or venues with jurisdiction over
          that place of business will hear disputes, except where mandatory consumer protections
          require otherwise. This clause is a placeholder until a specific jurisdiction is
          designated by the operator with legal advice.
        </p>
      </LegalSection>

      <LegalSection title="16. Miscellaneous">
        <p>
          These Terms, plus the policies linked from them, are the entire agreement regarding
          PathWise. If a provision is unenforceable, the remainder stays in effect. Failure to
          enforce a provision is not a waiver. You may not assign these Terms without our consent;
          we may assign them in connection with a reorganization or sale.
        </p>
      </LegalSection>

      <LegalSection title="17. Contact">
        <p>
          Questions about these Terms:{" "}
          <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
