import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/site/LegalDoc";
import { LEGAL } from "@/lib/legal-meta";

const TITLE = "Disclaimer — PathWise";
const DESC =
  "Important limitations: PathWise is a decision-thinking tool, not professional advice.";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: Disclaimer,
});

function Disclaimer() {
  return (
    <LegalPage
      title="Disclaimer"
      description="PathWise is an interactive decision companion. Please read this Disclaimer carefully before relying on anything the product shows you."
    >
      <LegalSection title="1. Not professional advice">
        <p>
          PathWise provides structured exploration of options, consequences, tradeoffs, and possible
          outcomes.{" "}
          <strong>
            It does not provide legal, medical, mental-health, financial, investment, tax,
            insurance, immigration, academic-advising, or licensed career-counseling advice.
          </strong>{" "}
          Outputs are not a substitute for advice from a qualified professional who understands your
          full circumstances.
        </p>
        <p>
          If you face an emergency, crisis, or situation involving imminent harm, contact local
          emergency services or appropriate crisis resources. Do not rely on PathWise for emergency
          guidance.
        </p>
      </LegalSection>

      <LegalSection title="2. No prediction guarantee">
        <p>
          Decision maps are models and narratives generated from your inputs and probabilistic
          systems. They may be incomplete, biased, outdated, or wrong. PathWise does{" "}
          <strong>not</strong> predict the future, guarantee outcomes, or promise that following a
          “leaning” will produce any particular result.
        </p>
      </LegalSection>

      <LegalSection title="3. Your responsibility">
        <p>
          You alone decide whether and how to act. You should independently verify facts that
          matter, consider risks PathWise may miss, and consult professionals where stakes are high
          (health, money, legal rights, safety, immigration, major career moves, etc.).
        </p>
      </LegalSection>

      <LegalSection title="4. Generative systems">
        <p>
          Parts of PathWise use generative AI / large language models. Generative systems can
          hallucinate, omit important branches, or reflect training biases. Treat every map as a
          draft thinking aid, not ground truth.
        </p>
      </LegalSection>

      <LegalSection title="5. As-is service">
        <p>
          To the fullest extent permitted by law, PathWise is provided <strong>as is</strong> and{" "}
          <strong>as available</strong>, without warranties of accuracy, completeness,
          merchantability, or fitness for a particular purpose. See the{" "}
          <Link to="/terms">Terms of Service</Link> for warranty disclaimers and limitation of
          liability.
        </p>
      </LegalSection>

      <LegalSection title="6. No fiduciary relationship">
        <p>
          Your use of PathWise does not create a fiduciary, advisory, attorney-client,
          doctor-patient, or similar professional relationship with PathWise or its operators.
        </p>
      </LegalSection>

      <LegalSection title="7. Third-party information">
        <p>
          If outputs reference external facts, norms, salaries, laws, or market conditions, those
          references may be wrong or jurisdiction-specific. Always check primary sources.
        </p>
      </LegalSection>

      <LegalSection title="8. Contact">
        <p>
          Questions about this Disclaimer:{" "}
          <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
