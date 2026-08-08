import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/site/LegalDoc";
import { LEGAL } from "@/lib/legal-meta";

const TITLE = "Billing & Refund Policy — PathWise";
const DESC = "How PathWise one-time Pro/Premium purchases, payments, and refunds work.";

export const Route = createFileRoute("/billing")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: BillingPolicy,
});

function BillingPolicy() {
  return (
    <LegalPage
      title="Billing & Refund Policy"
      description="This policy describes PathWise plan tiers, one-time purchases via Paddle, and refund principles."
    >
      <LegalSection title="1. Plans">
        <p>
          PathWise offers Free, Pro, and Premium tiers. Feature summaries appear on the{" "}
          <Link to="/pro">Plans</Link> page and may change. Free / guest access may include rate
          limits (for example one medium map per day for guests). Higher tiers unlock more depth,
          more maps, and richer exploration — not merely more text volume.
        </p>
      </LegalSection>

      <LegalSection title="2. One-time purchases (not subscriptions)">
        <p>
          <strong>Pro and Premium are one-time purchases.</strong> There is no recurring billing,
          renewal, or expiration date for plan ownership. Once payment is confirmed, access persists
          for your account.
        </p>
        <p>
          Checkout is handled by Paddle. Displayed USD/INR prices are for marketing; the amount
          charged is determined by Paddle price configuration and your locale/currency at checkout.
          Taxes may be calculated at checkout.
        </p>
      </LegalSection>

      <LegalSection title="3. How billing works">
        <ul>
          <li>
            <strong>One-time charge.</strong> You pay once for Pro or Premium. No automatic
            renewals.
          </li>
          <li>
            <strong>Upgrades.</strong> A Pro owner may buy Premium; access becomes Premium (includes
            Pro features).
          </li>
          <li>
            <strong>Payment methods.</strong> Handled by Paddle. PathWise does not store full card
            numbers.
          </li>
          <li>
            <strong>Failed / cancelled checkout.</strong> No charge, no access granted.
          </li>
          <li>
            <strong>Access grant.</strong> Paid access is unlocked only after Paddle confirms a
            successful transaction to our servers — not from a client-side click alone.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Cancellations">
        <p>
          Because Pro and Premium are one-time purchases (not subscriptions), there is no recurring
          plan to cancel. Refund eligibility is covered below.
        </p>
      </LegalSection>

      <LegalSection title="5. Refunds">
        <p>Default refund approach:</p>
        <ul>
          <li>
            <strong>Cooling-off / first purchase.</strong> If required by your consumer-protection
            laws (for example certain digital-content cooling-off rules), we will honor mandatory
            refund rights.
          </li>
          <li>
            <strong>Discretionary goodwill.</strong> Within fourteen (14) days of an initial paid
            purchase, you may request a refund if paid features were materially unavailable due to
            our fault and we could not restore them in a reasonable time. Abuse of refund requests
            may be refused.
          </li>
          <li>
            <strong>No refunds</strong> for dissatisfaction with a particular AI-generated map’s
            content alone, or after substantial use of paid generation capacity — except where law
            requires otherwise.
          </li>
          <li>
            <strong>Chargebacks.</strong> Please contact us before filing a chargeback so we can
            help. Fraudulent chargebacks may lead to account termination.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Promotions">
        <p>
          Promo codes, if offered, apply only as stated at purchase. Promo terms shown at checkout
          control over this Policy if they conflict.
        </p>
      </LegalSection>

      <LegalSection title="7. Contact for billing">
        <p>
          Billing questions and future refund requests:{" "}
          <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>. Include your account
          email and approximate charge date.
        </p>
      </LegalSection>

      <LegalSection title="8. Related documents">
        <p>
          Also see <Link to="/terms">Terms of Service</Link> and{" "}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
