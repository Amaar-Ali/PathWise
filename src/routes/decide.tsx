import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Loader2 } from "lucide-react";
import { SiteNav } from "@/components/site/SiteChrome";
import { AssessmentFlow } from "@/components/assessment/AssessmentFlow";
import { generateContextQuestions, generateDecision } from "@/lib/generate.functions";
import {
  AI_NOT_CONFIGURED_MESSAGE,
  AI_OUT_OF_CREDITS_MESSAGE,
  isAiCreditsError,
  isAiHardFailure,
} from "@/lib/ai-config";
import {
  type AnswerValue,
  type ContextQuestion,
  buildFallbackQuestions,
  normalizeQuestions,
  serializeAnswer,
} from "@/lib/assessment-questions";
import { useAuth } from "@/hooks/use-auth";
import { usePlan } from "@/hooks/use-plan";
import { allowanceLabel, canUseHighDetail, isBlockedByGuestDailyLimit } from "@/lib/access";
import { recordUsage, saveDecision } from "@/lib/decision-store";

function serverErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const o = error as { message?: unknown; data?: { message?: unknown } };
    if (typeof o.message === "string" && o.message) return o.message;
    if (typeof o.data?.message === "string" && o.data.message) return o.data.message;
  }
  return "";
}

const TITLE = "Start a decision — PathWise";
const DESC =
  "Tell PathWise what you're deciding and a little context. It maps the paths, consequences and outcomes.";

const SAMPLE_DECISIONS = [
  "Should I take this job offer or stay where I am?",
  "Should I buy a place or keep renting?",
  "Should I move cities for this opportunity?",
  "Should I leave my current school?",
  "Should I start a side project while working full-time?",
  "Should I switch careers or deepen what I already do?",
  "Should I say no to this commitment and protect my time?",
] as const;

export const Route = createFileRoute("/decide")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: Decide,
});

type Stage = "question" | "context" | "building";
type FlowPhase = "questions" | "depth";

const STEPS = [
  "Understanding your situation",
  "Finding realistic paths",
  "Mapping consequences",
  "Building your decision",
];

function Decide() {
  const navigate = useNavigate();
  const askQuestions = useServerFn(generateContextQuestions);
  const build = useServerFn(generateDecision);
  const { user } = useAuth();
  const { plan } = usePlan();

  const [stage, setStage] = useState<Stage>("question");
  const [question, setQuestion] = useState("");
  const [questions, setQuestions] = useState<ContextQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [depth, setDepth] = useState<"medium" | "high">("medium");
  const [pickedSample, setPickedSample] = useState<string | null>(null);
  const [flowPhase, setFlowPhase] = useState<FlowPhase>("questions");
  const [aiConfigBlocked, setAiConfigBlocked] = useState(false);
  const [shouldContinue, setShouldContinue] = useState(false);
  const [questionRound, setQuestionRound] = useState(1);
  const askingMore = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const access = { signedIn: Boolean(user), plan };
  const outOfAllowance = isBlockedByGuestDailyLimit(access);
  const highDetailLocked = !canUseHighDetail(access);

  useEffect(() => {
    if (stage === "question") inputRef.current?.focus();
  }, [stage]);

  const applySample = (sample: string) => {
    setQuestion(sample);
    setPickedSample(sample);
    setError(null);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      const el = inputRef.current;
      if (el) {
        const end = sample.length;
        el.setSelectionRange(end, end);
      }
    });
  };

  const goContext = async () => {
    if (question.trim().length < 5 || loadingQuestions) return;
    if (outOfAllowance) {
      setError(
        "You've used today's guest decision. Come back tomorrow, or sign in to keep mapping.",
      );
      return;
    }
    setError(null);
    setAiConfigBlocked(false);
    setLoadingQuestions(true);
    const decisionText = question.trim();
    try {
      const res = await askQuestions({
        data: { question: decisionText, round: 1, stage: "discovery" },
      });
      const payload = res as {
        questions: ContextQuestion[];
        shouldContinue?: boolean;
        round?: number;
      };
      setQuestions(normalizeQuestions(payload.questions, decisionText));
      setAnswers({});
      setShouldContinue(Boolean(payload.shouldContinue));
      setQuestionRound(payload.round ?? 1);
      setFlowPhase("questions");
      setStage("context");
    } catch (e) {
      const msg = serverErrorMessage(e);
      if (isAiHardFailure(msg)) {
        setAiConfigBlocked(true);
        setError(isAiCreditsError(msg) ? AI_OUT_OF_CREDITS_MESSAGE : msg);
        return;
      }
      setQuestions(buildFallbackQuestions(decisionText));
      setAnswers({});
      setShouldContinue(false);
      setQuestionRound(1);
      setFlowPhase("questions");
      setStage("context");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const requestMoreQuestions = async (
    answersSnapshot: Record<string, AnswerValue>,
  ): Promise<boolean> => {
    if (!shouldContinue || askingMore.current || aiConfigBlocked) return false;
    if (questionRound >= 3) return false;
    askingMore.current = true;
    setError(null);
    const decisionText = question.trim();
    const nextRound = questionRound + 1;
    try {
      const res = await askQuestions({
        data: {
          question: decisionText,
          round: nextRound,
          stage: "deepen",
          previousQuestions: questions.map((q) => ({ id: q.id, question: q.question })),
          previousAnswers: questions.map((q) => ({
            question: q.question,
            answer: serializeAnswer(q, answersSnapshot[q.id]),
          })),
        },
      });
      const payload = res as {
        questions: ContextQuestion[];
        shouldContinue?: boolean;
      };
      const nextQs = normalizeQuestions(payload.questions, decisionText).filter(
        (q) => !questions.some((existing) => existing.id === q.id),
      );
      if (nextQs.length === 0) {
        setShouldContinue(false);
        return false;
      }
      setQuestions((prev) => [...prev, ...nextQs]);
      setShouldContinue(Boolean(payload.shouldContinue) && nextRound < 3);
      setQuestionRound(nextRound);
      return true;
    } catch (e) {
      const msg = serverErrorMessage(e);
      if (isAiHardFailure(msg)) {
        setAiConfigBlocked(true);
        setError(isAiCreditsError(msg) ? AI_OUT_OF_CREDITS_MESSAGE : msg);
      }
      setShouldContinue(false);
      return false;
    } finally {
      askingMore.current = false;
    }
  };

  const buildMap = async () => {
    if (aiConfigBlocked) {
      setFlowPhase("depth");
      setStage("context");
      setError(
        isAiCreditsError(error ?? "") ? AI_OUT_OF_CREDITS_MESSAGE : AI_NOT_CONFIGURED_MESSAGE,
      );
      return;
    }
    if (outOfAllowance) {
      setFlowPhase("depth");
      setStage("context");
      setError(
        "You've used today's guest decision. Come back tomorrow, or sign in to keep mapping.",
      );
      return;
    }
    setStage("building");
    setError(null);
    try {
      const doc = await build({
        data: {
          question: question.trim(),
          depth,
          answers: questions.map((q) => ({
            question: q.question,
            answer: serializeAnswer(q, answers[q.id]),
          })),
        },
      });
      saveDecision(doc);
      if (!user) recordUsage();
      navigate({ to: "/decisions/$id", params: { id: doc.id } });
    } catch (e) {
      const msg = serverErrorMessage(e);
      if (isAiHardFailure(msg)) {
        setAiConfigBlocked(true);
        setFlowPhase("depth");
        setStage("context");
        setError(isAiCreditsError(msg) ? AI_OUT_OF_CREDITS_MESSAGE : msg);
        return;
      }
      setFlowPhase("depth");
      setStage("context");
      setError(
        msg && msg.length < 220
          ? msg
          : "I couldn't map this one properly yet. A little more context usually fixes it.",
      );
    }
  };

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-2xl px-5 py-16 md:py-24">
        {stage === "building" ? (
          <Building />
        ) : (
          <>
            {stage === "question" && (
              <div className="animate-rise">
                <p className="rule-label">Step one</p>
                <h1 className="mt-4 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-light leading-tight">
                  What are you trying to decide?
                </h1>
                <textarea
                  ref={inputRef}
                  value={question}
                  onChange={(e) => {
                    setQuestion(e.target.value);
                    setPickedSample(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void goContext();
                  }}
                  rows={3}
                  placeholder="Should I leave my current school?"
                  className="mt-7 w-full resize-none rounded-lg border border-border bg-card px-4 py-3.5 font-display text-[19px] leading-snug outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent"
                />
                <p className="mt-3 text-[13px] text-muted-foreground">
                  Write it the way you&apos;d say it out loud. Or tap a sample to start.
                </p>
                <div
                  className="mt-4 flex flex-wrap gap-2"
                  role="group"
                  aria-label="Sample decisions"
                >
                  {SAMPLE_DECISIONS.map((sample, i) => {
                    const active = pickedSample === sample || question === sample;
                    return (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => applySample(sample)}
                        className={[
                          "inline-flex min-h-10 max-w-full items-center rounded-full border px-3.5 py-1.5 text-left text-[12.5px] leading-snug transition-all duration-200",
                          "active:scale-95",
                          active
                            ? "border-accent bg-accent-soft/50 text-foreground"
                            : "border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground",
                        ].join(" ")}
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        {sample}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => void goContext()}
                    disabled={outOfAllowance || question.trim().length < 5 || loadingQuestions}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-[14px] font-medium text-background transition-opacity disabled:opacity-40"
                  >
                    {loadingQuestions ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    Continue
                  </button>
                  <span className="text-[12.5px] text-muted-foreground">
                    {allowanceLabel(access)}
                  </span>
                  {outOfAllowance && (
                    <Link
                      to="/decisions"
                      className="text-[12.5px] text-accent underline-offset-4 hover:underline"
                    >
                      My decisions →
                    </Link>
                  )}
                </div>
              </div>
            )}

            {stage === "context" && (
              <AssessmentFlow
                key={`flow-${flowPhase}`}
                decision={question}
                questions={questions}
                answers={answers}
                onAnswersChange={setAnswers}
                depth={depth}
                onDepthChange={setDepth}
                outOfAllowance={outOfAllowance}
                highDetailLocked={highDetailLocked}
                {...(highDetailLocked
                  ? {
                      highDetailLockHint: "Sign in for high detail · Pro/Premium for higher limits",
                    }
                  : {})}
                error={error}
                initialPhase={flowPhase}
                submitBlocked={aiConfigBlocked}
                onRequestMore={requestMoreQuestions}
                onBack={() => setStage("question")}
                onSubmit={() => void buildMap()}
              />
            )}

            {error && stage === "question" && (
              <p className="mt-6 text-[13.5px] text-muted-foreground">{error}</p>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Building() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(STEPS.length - 1, s + 1)), 2100);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex min-h-[60vh] flex-col justify-center">
      <svg viewBox="0 0 240 200" className="mb-10 w-56" aria-hidden>
        <g fill="none" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinecap="round">
          <path
            d="M120 30 L120 80"
            stroke="var(--accent)"
            strokeDasharray="50"
            strokeDashoffset={step >= 0 ? 0 : 50}
            style={{ transition: "stroke-dashoffset 900ms var(--ease-out-soft)" }}
          />
          <path
            d="M120 80 C120 110, 60 110, 60 140"
            strokeDasharray="90"
            strokeDashoffset={step >= 1 ? 0 : 90}
            style={{ transition: "stroke-dashoffset 900ms var(--ease-out-soft)" }}
          />
          <path
            d="M120 80 C120 110, 180 110, 180 140"
            strokeDasharray="90"
            strokeDashoffset={step >= 1 ? 0 : 90}
            style={{ transition: "stroke-dashoffset 900ms var(--ease-out-soft)" }}
          />
          <path
            d="M60 140 L60 175"
            strokeDasharray="35"
            strokeDashoffset={step >= 2 ? 0 : 35}
            style={{ transition: "stroke-dashoffset 900ms var(--ease-out-soft)" }}
          />
          <path
            d="M180 140 L180 175"
            strokeDasharray="35"
            strokeDashoffset={step >= 2 ? 0 : 35}
            style={{ transition: "stroke-dashoffset 900ms var(--ease-out-soft)" }}
          />
        </g>
        <circle cx="120" cy="26" r="6" fill="var(--accent)" />
        <circle
          cx="60"
          cy="140"
          r={step >= 1 ? 4.5 : 0}
          fill="var(--foreground)"
          style={{ transition: "r 600ms var(--ease-out-soft)" }}
        />
        <circle
          cx="180"
          cy="140"
          r={step >= 1 ? 4.5 : 0}
          fill="var(--foreground)"
          style={{ transition: "r 600ms var(--ease-out-soft)" }}
        />
      </svg>

      <ol className="space-y-3">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className="flex items-center gap-3 text-[15px] transition-all duration-500"
            style={{ opacity: i <= step ? 1 : 0.3 }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: i <= step ? "var(--accent)" : "var(--border-strong)" }}
            />
            {s}
          </li>
        ))}
      </ol>
      <p className="mt-8 text-[13px] text-muted-foreground">
        This takes a moment. I&apos;d rather get the shape right.
      </p>
      <Link to="/" className="mt-4 w-fit text-[12.5px] text-muted-foreground hover:text-foreground">
        Cancel
      </Link>
    </div>
  );
}
