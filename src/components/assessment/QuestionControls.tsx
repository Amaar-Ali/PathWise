import { Check, GripVertical, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LIKERT_DEFAULT,
  type AnswerValue,
  type ContextQuestion,
  type QuestionOption,
} from "@/lib/assessment-questions";
import { Slider } from "@/components/ui/slider";

interface Props {
  question: ContextQuestion;
  value: AnswerValue | undefined;
  onChange: (next: AnswerValue) => void;
}

export function QuestionControls({ question, value, onChange }: Props) {
  switch (question.type) {
    case "single":
      return (
        <OptionCards
          options={question.options ?? []}
          {...(value?.kind === "single" ? { selected: value.optionId } : {})}
          onSelect={(opt) => onChange({ kind: "single", optionId: opt.id, label: opt.label })}
        />
      );
    case "likert":
      return (
        <OptionCards
          options={question.options?.length ? question.options : LIKERT_DEFAULT}
          {...(value?.kind === "likert" ? { selected: value.optionId } : {})}
          onSelect={(opt) => onChange({ kind: "likert", optionId: opt.id, label: opt.label })}
          compact
        />
      );
    case "boolean":
      return (
        <SegmentControl
          options={
            question.options?.length
              ? question.options
              : [
                  { id: "yes", label: "Yes" },
                  { id: "no", label: "No" },
                ]
          }
          {...(value?.kind === "boolean" ? { selected: value.value ? "yes" : "no" } : {})}
          onSelect={(opt) =>
            onChange({
              kind: "boolean",
              value: opt.id === "yes" || opt.label.toLowerCase() === "yes",
              label: opt.label,
            })
          }
        />
      );
    case "multi":
      return (
        <MultiChips
          options={question.options ?? []}
          selected={value?.kind === "multi" ? value.optionIds : []}
          onChange={(optionIds, labels) => onChange({ kind: "multi", optionIds, labels })}
        />
      );
    case "segment":
      return (
        <SegmentControl
          options={question.options ?? []}
          {...(value?.kind === "segment" ? { selected: value.optionId } : {})}
          onSelect={(opt) => onChange({ kind: "segment", optionId: opt.id, label: opt.label })}
        />
      );
    case "scale":
      return (
        <ScaleControl
          question={question}
          value={
            value?.kind === "scale"
              ? value.value
              : Math.round(((question.min ?? 1) + (question.max ?? 10)) / 2)
          }
          onChange={(n) =>
            onChange({
              kind: "scale",
              value: n,
              min: question.min ?? 1,
              max: question.max ?? 10,
              ...(question.minLabel ? { minLabel: question.minLabel } : {}),
              ...(question.maxLabel ? { maxLabel: question.maxLabel } : {}),
            })
          }
        />
      );
    case "number":
      return (
        <NumberControl
          question={question}
          value={value?.kind === "number" ? value.value : (question.min ?? 0)}
          onChange={(n) => onChange({ kind: "number", value: n })}
        />
      );
    case "rating":
      return (
        <RatingPicker
          max={question.max ?? 5}
          value={value?.kind === "rating" ? value.value : 0}
          onChange={(n) => onChange({ kind: "rating", value: n, max: question.max ?? 5 })}
          label={question.question}
        />
      );
    case "rank":
      return (
        <RankControl
          options={question.options ?? []}
          order={value?.kind === "rank" ? value.order : []}
          onChange={(order, labels) => onChange({ kind: "rank", order, labels })}
        />
      );
    case "text":
    case "textarea":
      return (
        <TextControl
          multiline={question.type === "textarea"}
          value={value?.kind === "text" ? value.value : ""}
          onChange={(v) => onChange({ kind: "text", value: v })}
          label={question.question}
        />
      );
    default:
      return null;
  }
}

function TextControl({
  multiline,
  value,
  onChange,
  label,
}: {
  multiline: boolean;
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const shared =
    "w-full rounded-lg border border-border bg-card px-4 py-3 text-[15px] leading-relaxed outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent";
  if (multiline) {
    return (
      <textarea
        aria-label={label}
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(shared, "resize-none")}
        placeholder="A short answer is enough"
      />
    );
  }
  return (
    <input
      aria-label={label}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={shared}
      placeholder="Short answer"
    />
  );
}

function NumberControl({
  question,
  value,
  onChange,
}: {
  question: ContextQuestion;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-4">
      <input
        type="number"
        aria-label={question.question}
        value={Number.isFinite(value) ? value : ""}
        min={question.min}
        max={question.max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-transparent text-[1.6rem] font-display font-light tabular-nums outline-none"
      />
      {(question.minLabel || question.maxLabel) && (
        <p className="mt-2 text-[12.5px] text-muted-foreground">
          {[question.minLabel, question.maxLabel].filter(Boolean).join(" · ")}
        </p>
      )}
    </div>
  );
}

function OptionCards({
  options,
  selected,
  onSelect,
  compact,
}: {
  options: QuestionOption[];
  selected?: string;
  onSelect: (opt: QuestionOption) => void;
  compact?: boolean;
}) {
  return (
    <div className="space-y-2.5" role="radiogroup">
      {options.map((opt, i) => {
        const active = selected === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(opt)}
            className={cn(
              "pw-opt group flex w-full items-start gap-3 rounded-lg border px-4 py-3.5 text-left transition-all duration-200",
              "hover:border-border-strong active:scale-[0.985]",
              active
                ? "border-accent bg-accent-soft/40 shadow-[0_0_0_1px_var(--accent)]"
                : "border-border bg-card",
            )}
            style={{ animationDelay: `${i * 55}ms` }}
          >
            <span
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
                active
                  ? "scale-110 border-accent bg-accent text-accent-foreground"
                  : "border-border-strong",
              )}
            >
              {active && <Check className="h-3 w-3" strokeWidth={2.5} />}
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  "block font-medium leading-snug",
                  compact ? "text-[14px]" : "text-[15px]",
                )}
              >
                {opt.label}
              </span>
              {opt.hint && (
                <span className="mt-1 block text-[12.5px] leading-relaxed text-muted-foreground">
                  {opt.hint}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function MultiChips({
  options,
  selected,
  onChange,
}: {
  options: QuestionOption[];
  selected: string[];
  onChange: (ids: string[], labels: string[]) => void;
}) {
  const toggle = (opt: QuestionOption) => {
    const next = selected.includes(opt.id)
      ? selected.filter((id) => id !== opt.id)
      : [...selected, opt.id];
    const labels = options.filter((o) => next.includes(o.id)).map((o) => o.label);
    onChange(next, labels);
  };

  return (
    <div>
      <p className="mb-3 text-[12.5px] text-muted-foreground">Pick all that apply</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Select multiple">
        {options.map((opt, i) => {
          const active = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(opt)}
              className={cn(
                "pw-opt inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 py-2 text-[13.5px] transition-all duration-200",
                "active:scale-95",
                active
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-card text-foreground hover:border-border-strong",
              )}
              style={{ animationDelay: `${i * 45}ms` }}
            >
              {active && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SegmentControl({
  options,
  selected,
  onSelect,
}: {
  options: QuestionOption[];
  selected?: string;
  onSelect: (opt: QuestionOption) => void;
}) {
  return (
    <div
      className="flex flex-col gap-2 sm:flex-row sm:rounded-lg sm:border sm:border-border sm:bg-card sm:p-1"
      role="radiogroup"
    >
      {options.map((opt, i) => {
        const active = selected === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(opt)}
            className={cn(
              "pw-opt min-h-12 flex-1 rounded-md px-3 py-3 text-[14px] font-medium transition-all duration-200 sm:py-2.5",
              "active:scale-[0.98]",
              active
                ? "bg-foreground text-background shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:text-foreground sm:border-0",
            )}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function ScaleControl({
  question,
  value,
  onChange,
}: {
  question: ContextQuestion;
  value: number;
  onChange: (n: number) => void;
}) {
  const min = question.min ?? 1;
  const max = question.max ?? 10;

  return (
    <div className="pw-opt rounded-lg border border-border bg-card px-4 py-5">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="rule-label">Your score</p>
          <p
            key={value}
            className="pw-score-pop mt-1 font-display text-[2.6rem] font-light leading-none tabular-nums text-accent"
            aria-live="polite"
          >
            {value}
          </p>
        </div>
        <p className="pb-1 text-[12.5px] text-muted-foreground">
          {min}–{max}
        </p>
      </div>

      <Slider
        min={min}
        max={max}
        step={1}
        value={[value]}
        onValueChange={([n]) => onChange(n ?? min)}
        aria-label={question.question}
        aria-valuetext={`${value} of ${max}${question.minLabel ? `, ${question.minLabel} to ${question.maxLabel ?? max}` : ""}`}
      />

      <div className="mt-3 flex justify-between gap-4 text-[12.5px] text-muted-foreground">
        <span>{question.minLabel ?? String(min)}</span>
        <span className="text-right">{question.maxLabel ?? String(max)}</span>
      </div>
    </div>
  );
}

function RatingPicker({
  max,
  value,
  onChange,
  label,
}: {
  max: number;
  value: number;
  onChange: (n: number) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {Array.from({ length: max }, (_, i) => i + 1).map((n, i) => {
        const active = value >= n;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} of ${max}`}
            onClick={() => onChange(n)}
            className={cn(
              "pw-opt flex h-12 w-12 items-center justify-center rounded-lg border transition-all duration-200",
              "active:scale-90",
              active
                ? "border-accent bg-accent-soft/50 text-accent"
                : "border-border bg-card text-muted-foreground hover:border-border-strong",
            )}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <Star
              className={cn("h-5 w-5 transition-transform", active && "fill-current scale-110")}
              strokeWidth={1.6}
            />
          </button>
        );
      })}
      {value > 0 && (
        <span
          className="ml-1 flex items-center text-[13px] text-muted-foreground"
          aria-live="polite"
        >
          {value} / {max}
        </span>
      )}
    </div>
  );
}

function RankControl({
  options,
  order,
  onChange,
}: {
  options: QuestionOption[];
  order: string[];
  onChange: (order: string[], labels: string[]) => void;
}) {
  const ranked = new Set(order);
  const nextRank = order.length + 1;

  const pick = (id: string) => {
    let next: string[];
    if (ranked.has(id)) {
      next = order.filter((x) => x !== id);
    } else {
      next = [...order, id];
    }
    const labels = next.map((oid) => options.find((o) => o.id === oid)?.label ?? oid);
    onChange(next, labels);
  };

  const move = (id: string, dir: -1 | 1) => {
    const idx = order.indexOf(id);
    if (idx < 0) return;
    const j = idx + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[idx], next[j]] = [next[j]!, next[idx]!];
    const labels = next.map((oid) => options.find((o) => o.id === oid)?.label ?? oid);
    onChange(next, labels);
  };

  return (
    <div>
      <p className="mb-3 text-[12.5px] text-muted-foreground">
        Tap in order of importance — first is most important
      </p>
      <div className="space-y-2" role="list">
        {options.map((opt, i) => {
          const rank = order.indexOf(opt.id);
          const active = rank >= 0;
          return (
            <div
              key={opt.id}
              className={cn(
                "pw-opt flex items-center gap-2 rounded-lg border px-2 py-2 transition-all duration-200",
                active ? "border-accent bg-accent-soft/30" : "border-border bg-card",
              )}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <button
                type="button"
                onClick={() => pick(opt.id)}
                className="flex min-h-11 flex-1 items-center gap-3 px-2 text-left active:scale-[0.99]"
                aria-pressed={active}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold tabular-nums transition-all",
                    active
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border-strong text-muted-foreground",
                  )}
                >
                  {active ? rank + 1 : nextRank > options.length ? "·" : nextRank}
                </span>
                <span className="text-[14.5px] font-medium leading-snug">{opt.label}</span>
              </button>
              {active && (
                <div className="flex shrink-0 flex-col pr-1">
                  <button
                    type="button"
                    aria-label={`Move ${opt.label} up`}
                    disabled={rank === 0}
                    onClick={() => move(opt.id, -1)}
                    className="px-1.5 py-0.5 text-[11px] text-muted-foreground disabled:opacity-30 hover:text-foreground"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${opt.label} down`}
                    disabled={rank === order.length - 1}
                    onClick={() => move(opt.id, 1)}
                    className="px-1.5 py-0.5 text-[11px] text-muted-foreground disabled:opacity-30 hover:text-foreground"
                  >
                    ▼
                  </button>
                </div>
              )}
              <GripVertical
                className="mr-1 h-4 w-4 shrink-0 text-muted-foreground/40"
                aria-hidden
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
