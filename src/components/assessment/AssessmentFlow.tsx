import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type AnswerValue,
  type ContextQuestion,
  defaultAnswer,
  hasAnswer,
} from "@/lib/assessment-questions";
import { QuestionControls } from "./QuestionControls";

type Phase = "questions" | "depth";

interface Props {
  decision: string;
  questions: ContextQuestion[];
  answers: Record<string, AnswerValue>;
  onAnswersChange: (next: Record<string, AnswerValue>) => void;
  depth: "medium" | "high";
  onDepthChange: (d: "medium" | "high") => void;
  outOfAllowance: boolean;
  highDetailLocked?: boolean;
  highDetailLockHint?: string;
  error: string | null;
  initialPhase?: Phase;
  submitBlocked?: boolean;
  onRequestMore?: (answersSnapshot: Record<string, AnswerValue>) => Promise<boolean>;
  onBack: () => void;
  onSubmit: () => void;
}

export function AssessmentFlow({
  decision,
  questions,
  answers,
  onAnswersChange,
  depth,
  onDepthChange,
  outOfAllowance,
  highDetailLocked = false,
  highDetailLockHint = "Sign in to unlock high detail",
  error,
  initialPhase = "questions",
  submitBlocked = false,
  onRequestMore,
  onBack,
  onSubmit,
}: Props) {
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [index, setIndex] = useState(() =>
    initialPhase === "depth" ? Math.max(0, questions.length - 1) : 0,
  );
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [animKey, setAnimKey] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const fetchingMore = useRef(false);

  const totalSteps = questions.length + 1;
  const current = questions[index];
  const currentAnswer = current ? answers[current.id] : undefined;
  const progress =
    phase === "depth"
      ? 100
      : Math.round(((index + (hasAnswer(currentAnswer) ? 0.55 : 0.15)) / totalSteps) * 100);

  useEffect(() => {
    if (!current) return;
    if (!answers[current.id] && current.type === "scale") {
      const def = defaultAnswer(current);
      if (def) onAnswersChange({ ...answers, [current.id]: def });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  useEffect(() => {
    if (highDetailLocked && depth === "high") onDepthChange("medium");
  }, [highDetailLocked, depth, onDepthChange]);

  useEffect(() => {
    if (phase === "questions" && index > questions.length - 1 && questions.length > 0) {
      setIndex(questions.length - 1);
    }
  }, [questions.length, index, phase]);

  const go = (nextIndex: number, nextPhase: Phase, direction: "fwd" | "back") => {
    setDir(direction);
    setAnimKey((k) => k + 1);
    setIndex(nextIndex);
    setPhase(nextPhase);
  };

  const next = async () => {
    if (loadingMore || fetchingMore.current) return;
    if (phase === "depth") {
      if (submitBlocked || outOfAllowance) return;
      onSubmit();
      return;
    }
    if (!current) return;
    const merged: Record<string, AnswerValue> = hasAnswer(answers[current.id])
      ? answers
      : { ...answers, [current.id]: { kind: "skipped" } };
    if (!hasAnswer(answers[current.id])) {
      onAnswersChange(merged);
    }
    if (index >= questions.length - 1) {
      if (onRequestMore) {
        fetchingMore.current = true;
        setLoadingMore(true);
        try {
          const gotMore = await onRequestMore(merged);
          if (gotMore) {
            go(index + 1, "questions", "fwd");
            return;
          }
        } finally {
          fetchingMore.current = false;
          setLoadingMore(false);
        }
      }
      go(index, "depth", "fwd");
      return;
    }
    go(index + 1, "questions", "fwd");
  };

  const back = () => {
    if (loadingMore) return;
    if (phase === "depth") {
      go(questions.length - 1, "questions", "back");
      return;
    }
    if (index === 0) {
      onBack();
      return;
    }
    go(index - 1, "questions", "back");
  };

  const stepLabel =
    phase === "depth"
      ? `Step ${questions.length + 1} of ${totalSteps}`
      : `Step ${index + 1} of ${totalSteps}`;

  return (
    <div className="animate-rise">
      <div className="mb-8">
        <div className="flex items-center justify-between gap-3">
          <p className="rule-label">{stepLabel}</p>
          <p className="text-[12px] tabular-nums text-muted-foreground">
            {Math.min(100, Math.round(progress))}%
          </p>
        </div>
        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500"
            style={{
              width: `${Math.min(100, progress)}%`,
              transitionTimingFunction: "var(--ease-out-soft)",
            }}
          />
        </div>
        <div className="mt-3 flex gap-1.5">
          {Array.from({ length: totalSteps }, (_, i) => {
            const done = phase === "depth" ? i < totalSteps - 1 : i < index;
            const active = phase === "depth" ? i === totalSteps - 1 : i === index;
            return (
              <span
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-300",
                  done || active ? "bg-accent" : "bg-border",
                  active && "scale-y-150",
                )}
              />
            );
          })}
        </div>
      </div>

      <p className="text-[13px] leading-relaxed text-muted-foreground line-clamp-2">{decision}</p>

      <div key={animKey} className={cn("mt-5", dir === "fwd" ? "pw-step-in" : "pw-step-in-back")}>
        {phase === "questions" && current && (
          <>
            <h1 className="font-display text-[clamp(1.45rem,3vw,2rem)] font-light leading-snug text-balance-tight">
              {current.question}
            </h1>
            {(current.helper || current.reason) && (
              <p className="mt-2 text-[13.5px] text-muted-foreground">
                {current.helper ?? current.reason}
              </p>
            )}
            <div className="mt-7">
              <QuestionControls
                question={current}
                value={currentAnswer}
                onChange={(nextAns) => onAnswersChange({ ...answers, [current.id]: nextAns })}
              />
            </div>
          </>
        )}

        {phase === "depth" && (
          <>
            <h1 className="font-display text-[clamp(1.45rem,3vw,2rem)] font-light leading-snug">
              How deep should the map go?
            </h1>
            <p className="mt-2 text-[13.5px] text-muted-foreground">
              More depth means more paths, consequences, and further decisions.
            </p>
            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
              <DepthChoice
                active={depth === "medium"}
                onClick={() => onDepthChange("medium")}
                title="Medium detail"
                body="The major paths and their immediate consequences."
              />
              <DepthChoice
                active={depth === "high"}
                onClick={() => onDepthChange("high")}
                title="High detail"
                locked={highDetailLocked}
                lockHint={highDetailLockHint}
                body="Paths, consequences, further decisions and outcomes."
              />
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="mt-6 rounded-md border border-border bg-card px-4 py-3 text-[13.5px] leading-relaxed">
          {error}
        </p>
      )}

      <div className="mt-9 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void next()}
          disabled={loadingMore || (phase === "depth" && (submitBlocked || outOfAllowance))}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-[14px] font-medium text-background transition-opacity disabled:opacity-40"
        >
          {loadingMore ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Finding the next questions
            </>
          ) : (
            <>
              {phase === "depth" ? "Build my decision" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
        <button
          type="button"
          onClick={back}
          disabled={loadingMore}
          className="inline-flex min-h-11 items-center gap-1.5 px-2 text-[13px] text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        {phase === "questions" && !loadingMore && (
          <button
            type="button"
            onClick={() => {
              if (!current) return;
              onAnswersChange({ ...answers, [current.id]: { kind: "skipped" } });
              if (index >= questions.length - 1) void next();
              else go(index + 1, "questions", "fwd");
            }}
            className="ml-auto text-[12.5px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}

function DepthChoice({
  active,
  onClick,
  title,
  body,
  locked,
  lockHint,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  body: string;
  locked?: boolean;
  lockHint?: string;
}) {
  return (
    <button
      type="button"
      disabled={locked}
      onClick={() => {
        if (locked) return;
        onClick();
      }}
      className={cn(
        "pw-opt flex-1 min-w-[200px] rounded-lg border p-3.5 text-left transition-all duration-200 active:scale-[0.985]",
        active
          ? "border-accent bg-accent-soft/40 shadow-[0_0_0_1px_var(--accent)]"
          : "border-border bg-card hover:border-border-strong",
        locked && "cursor-not-allowed opacity-55 hover:border-border",
      )}
    >
      <p className="text-[14px] font-medium">{title}</p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{body}</p>
      {locked && (
        <p className="mt-2 text-[11.5px] text-accent">
          {lockHint ?? "Included with a free account"}
        </p>
      )}
    </button>
  );
}
