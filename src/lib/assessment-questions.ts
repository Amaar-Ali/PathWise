export type QuestionType =
  | "single"
  | "multi"
  | "scale"
  | "likert"
  | "segment"
  | "rank"
  | "rating"
  | "text"
  | "textarea"
  | "boolean"
  | "number";

export interface QuestionOption {
  id: string;
  label: string;
  hint?: string;
}

export interface ContextQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: QuestionOption[];
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  helper?: string;
  reason?: string;
  decisionImpact?: "high" | "medium" | "low";
}

export type AnswerValue =
  | { kind: "single"; optionId: string; label: string }
  | { kind: "multi"; optionIds: string[]; labels: string[] }
  | { kind: "scale"; value: number; min: number; max: number; minLabel?: string; maxLabel?: string }
  | { kind: "likert"; optionId: string; label: string }
  | { kind: "segment"; optionId: string; label: string }
  | { kind: "rank"; order: string[]; labels: string[] }
  | { kind: "rating"; value: number; max: number }
  | { kind: "text"; value: string }
  | { kind: "boolean"; value: boolean; label: string }
  | { kind: "number"; value: number }
  | { kind: "skipped" };

export const LIKERT_DEFAULT: QuestionOption[] = [
  { id: "strongly-disagree", label: "Strongly disagree" },
  { id: "disagree", label: "Disagree" },
  { id: "neutral", label: "Neutral" },
  { id: "agree", label: "Agree" },
  { id: "strongly-agree", label: "Strongly agree" },
];

function slug(s: string, i: number) {
  const base = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return base || `opt-${i + 1}`;
}

function asOptions(raw: unknown): QuestionOption[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  return raw.map((o, i) => {
    if (typeof o === "string") return { id: slug(o, i), label: o };
    const obj = o as { id?: string; label?: string; hint?: string };
    const label = String(obj.label ?? obj.id ?? `Option ${i + 1}`);
    return {
      id: String(obj.id ?? slug(label, i)),
      label,
      ...(obj.hint ? { hint: String(obj.hint) } : {}),
    };
  });
}

function coerceType(raw: unknown): QuestionType {
  const t = String(raw ?? "single")
    .toLowerCase()
    .replace(/-/g, "_");
  if (t === "single_choice" || t === "singlechoice" || t === "choice") return "single";
  if (t === "multiple_choice" || t === "multiple" || t === "multiselect" || t === "chips")
    return "multi";
  if (t === "slider" || t === "score" || t === "likert_scale") return "scale";
  if (t === "toggle" || t === "binary" || t === "yes_no" || t === "bool") return "boolean";
  if (t === "segmented") return "segment";
  if (t === "stars" || t === "score_picker") return "rating";
  if (t === "ranking" || t === "order") return "rank";
  if (t === "short_text" || t === "input") return "text";
  if (t === "long_text" || t === "paragraph") return "textarea";
  if (
    t === "single" ||
    t === "multi" ||
    t === "scale" ||
    t === "likert" ||
    t === "segment" ||
    t === "rank" ||
    t === "rating" ||
    t === "text" ||
    t === "textarea" ||
    t === "boolean" ||
    t === "number"
  ) {
    return t;
  }
  return "single";
}

type DecisionDomain =
  "job" | "housing" | "school" | "move" | "side-project" | "career" | "commitment" | "general";

function clipLabel(s: string, max = 48): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export function extractDecisionSides(decision: string): [string, string] | null {
  const raw = decision.replace(/\s+/g, " ").trim();
  if (!raw) return null;

  const vs = raw.match(/^(.+?)\s+(?:vs\.?|versus)\s+(.+?)\??$/i);
  if (vs?.[1] && vs[2]) return [clipLabel(vs[1], 40), clipLabel(vs[2], 40)];

  const shouldOr = raw.match(/^should i\s+(.+?)\s+or\s+(.+?)\??$/i);
  if (shouldOr?.[1] && shouldOr[2]) {
    return [clipLabel(shouldOr[1], 40), clipLabel(shouldOr[2], 40)];
  }

  const or = raw.match(/^(.+?)\s+or\s+(.+?)\??$/i);
  if (or?.[1] && or[2] && or[1].length < 60 && or[2].length < 60) {
    return [clipLabel(or[1], 40), clipLabel(or[2], 40)];
  }

  return null;
}

function detectDomain(decision: string): DecisionDomain {
  const d = decision.toLowerCase();
  if (/\b(job|offer|employer|salary|quit|resign|role)\b/.test(d)) return "job";
  if (/\b(career|industry|profession)\b/.test(d)) return "career";
  if (/\b(buy|rent|mortgage|house|apartment|lease|landlord)\b/.test(d)) return "housing";
  if (/\b(school|college|university|degree|campus|dropout)\b/.test(d)) return "school";
  if (/\b(move|relocat|city|cities|country|abroad)\b/.test(d)) return "move";
  if (/\b(side project|side hustle|startup|business)\b/.test(d)) return "side-project";
  if (/\b(commit|commitment|say no|protect my time|bandwidth)\b/.test(d)) return "commitment";
  return "general";
}

function domainConstraints(domain: DecisionDomain): QuestionOption[] {
  switch (domain) {
    case "job":
    case "career":
      return [
        { id: "comp", label: "Pay / compensation" },
        { id: "growth", label: "Learning / career growth" },
        { id: "culture", label: "Team / culture fit" },
        { id: "stability", label: "Stability / risk" },
        { id: "life", label: "Hours / life balance" },
        { id: "location", label: "Location / commute" },
        { id: "none", label: "None of these" },
      ];
    case "housing":
      return [
        { id: "cash", label: "Upfront cash / deposit" },
        { id: "monthly", label: "Monthly cost" },
        { id: "flexibility", label: "Flexibility to leave" },
        { id: "location", label: "Neighborhood / commute" },
        { id: "space", label: "Space / quality" },
        { id: "timeline", label: "Timeline pressure" },
        { id: "none", label: "None of these" },
      ];
    case "school":
      return [
        { id: "cost", label: "Cost / debt" },
        { id: "fit", label: "Academic / program fit" },
        { id: "career", label: "Career path after" },
        { id: "people", label: "Friends / support network" },
        { id: "mental", label: "Mental health / stress" },
        { id: "none", label: "None of these" },
      ];
    case "move":
      return [
        { id: "cost", label: "Cost of living" },
        { id: "work", label: "Work / opportunity" },
        { id: "people", label: "People I'd leave / join" },
        { id: "roots", label: "Sense of home / roots" },
        { id: "logistics", label: "Logistics / timing" },
        { id: "none", label: "None of these" },
      ];
    case "side-project":
      return [
        { id: "time", label: "Evenings / weekends" },
        { id: "energy", label: "Energy after work" },
        { id: "money", label: "Money to invest" },
        { id: "job-risk", label: "Risk to main job" },
        { id: "support", label: "Support at home" },
        { id: "none", label: "None of these" },
      ];
    case "commitment":
      return [
        { id: "time", label: "Calendar time" },
        { id: "energy", label: "Emotional energy" },
        { id: "people", label: "Obligations to others" },
        { id: "money", label: "Money" },
        { id: "reputation", label: "Reputation / saying no" },
        { id: "none", label: "None of these" },
      ];
    default:
      return [
        { id: "money", label: "Money" },
        { id: "time", label: "Time" },
        { id: "people", label: "Other people" },
        { id: "energy", label: "Energy / bandwidth" },
        { id: "info", label: "Missing information" },
        { id: "none", label: "None of these" },
      ];
  }
}

function domainPriorities(domain: DecisionDomain): QuestionOption[] {
  switch (domain) {
    case "job":
    case "career":
      return [
        { id: "security", label: "Job security" },
        { id: "growth", label: "Skill / career growth" },
        { id: "comp", label: "Pay trajectory" },
        { id: "life", label: "Life outside work" },
      ];
    case "housing":
      return [
        { id: "cost", label: "Affordability" },
        { id: "equity", label: "Building equity / ownership" },
        { id: "flex", label: "Flexibility" },
        { id: "place", label: "Place quality / location" },
      ];
    case "school":
      return [
        { id: "learning", label: "Learning quality" },
        { id: "cost", label: "Cost / debt load" },
        { id: "network", label: "People / network" },
        { id: "future", label: "Future options after" },
      ];
    case "move":
      return [
        { id: "opportunity", label: "Opportunity upside" },
        { id: "relationships", label: "Relationships" },
        { id: "cost", label: "Financial stability" },
        { id: "belonging", label: "Belonging / identity" },
      ];
    case "side-project":
      return [
        { id: "learning", label: "Learning / craft" },
        { id: "income", label: "Extra income potential" },
        { id: "health", label: "Rest / health" },
        { id: "main-job", label: "Protecting the main job" },
      ];
    case "commitment":
      return [
        { id: "time", label: "Free time" },
        { id: "relationships", label: "Key relationships" },
        { id: "reputation", label: "Being reliable" },
        { id: "self", label: "My own priorities" },
      ];
    default:
      return [
        { id: "security", label: "Security / stability" },
        { id: "growth", label: "Growth / upside" },
        { id: "relationships", label: "Relationships" },
        { id: "autonomy", label: "Freedom / autonomy" },
      ];
  }
}

export function buildFallbackQuestions(decision: string): ContextQuestion[] {
  const sides = extractDecisionSides(decision);
  const domain = detectDomain(decision);

  if (domain === "school") {
    return [
      {
        id: "leave-reason",
        type: "single",
        question: "What's the main reason you're considering leaving your current school?",
        options: [
          { id: "courses", label: "Want better / higher courses" },
          { id: "fees", label: "Fees are too high" },
          { id: "infra", label: "Infrastructure / facilities aren't good enough" },
          { id: "teaching", label: "Teaching quality" },
          { id: "social", label: "Social environment / friends" },
          { id: "location", label: "Location or commute" },
          { id: "other", label: "Something else" },
        ],
      },
      {
        id: "new-school-need",
        type: "multi",
        question: "What would a new school need to offer for the move to be worth it?",
        options: [
          { id: "academics", label: "Stronger academics / courses" },
          { id: "cost", label: "Lower or better-value fees" },
          { id: "campus", label: "Better campus / labs / facilities" },
          { id: "teachers", label: "Better teachers" },
          { id: "peers", label: "Better peer group" },
          { id: "unsure", label: "I'm not sure yet" },
        ],
      },
      {
        id: "switch-feasibility",
        type: "single",
        question: "How realistic is switching right now?",
        options: [
          { id: "this-term", label: "I can leave this term / year" },
          { id: "next-year", label: "I'd have to wait until next year" },
          { id: "barriers", label: "Money or family make it hard" },
          { id: "exploring", label: "I'm still only exploring" },
        ],
      },
    ];
  }

  if (domain === "job" || domain === "career") {
    return [
      {
        id: "job-driver",
        type: "single",
        question: sides
          ? `What's the biggest difference between ${sides[0]} and ${sides[1]} for you?`
          : "What's pulling you toward a change at work?",
        options: [
          { id: "pay", label: "Pay / total compensation" },
          { id: "growth", label: "Learning / career growth" },
          { id: "people", label: "Manager / team / culture" },
          { id: "hours", label: "Hours / burnout" },
          { id: "stability", label: "Stability / risk" },
          { id: "location", label: "Location / commute / remote" },
        ],
      },
      {
        id: "job-must",
        type: "multi",
        question: "What would make you stay or say yes without much hesitation?",
        options: [
          { id: "raise", label: "A clear pay bump" },
          { id: "role", label: "A better role / title path" },
          { id: "team", label: "A team I'd trust" },
          { id: "life", label: "Sustainable hours" },
          { id: "none", label: "Nothing would — I need out / need the change" },
        ],
      },
      {
        id: "job-timing",
        type: "single",
        question: "How urgent is this work decision?",
        options: [
          { id: "offer-deadline", label: "There's an offer / deadline soon" },
          { id: "months", label: "I have a few months" },
          { id: "open", label: "No hard deadline" },
        ],
      },
    ];
  }

  if (domain === "housing") {
    return [
      {
        id: "housing-driver",
        type: "single",
        question: sides
          ? `What matters most in choosing between ${sides[0]} and ${sides[1]}?`
          : "What's the main pressure on this housing decision?",
        options: [
          { id: "cash", label: "Upfront cash / deposit" },
          { id: "monthly", label: "Monthly cost" },
          { id: "flex", label: "Flexibility to move later" },
          { id: "equity", label: "Building equity / ownership" },
          { id: "place", label: "Neighborhood / space quality" },
        ],
      },
      {
        id: "housing-horizon",
        type: "single",
        question: "How long do you expect to stay in this city / area?",
        options: [
          { id: "under2", label: "Under 2 years" },
          { id: "2to5", label: "2–5 years" },
          { id: "5plus", label: "5+ years / settling" },
          { id: "unsure", label: "Not sure" },
        ],
      },
      {
        id: "housing-risk",
        type: "single",
        question: "What would make you regret the wrong housing call?",
        options: [
          { id: "money", label: "Running tight on money" },
          { id: "stuck", label: "Feeling stuck / can't leave" },
          { id: "miss-equity", label: "Missing ownership / equity" },
          { id: "bad-place", label: "Living somewhere that doesn't fit" },
        ],
      },
    ];
  }

  if (domain === "move") {
    return [
      {
        id: "move-why",
        type: "single",
        question: "What's the main reason you're considering moving?",
        options: [
          { id: "work", label: "Work / opportunity" },
          { id: "cost", label: "Cost of living" },
          { id: "people", label: "People / family" },
          { id: "lifestyle", label: "Lifestyle / city fit" },
          { id: "other", label: "Something else" },
        ],
      },
      {
        id: "move-trade",
        type: "multi",
        question: "What would you be most afraid of giving up by moving?",
        options: [
          { id: "network", label: "Current network / friends" },
          { id: "job", label: "Current job stability" },
          { id: "cost-risk", label: "Financial cushion" },
          { id: "identity", label: "Sense of home" },
          { id: "little", label: "Not much — I'm ready" },
        ],
      },
      {
        id: "move-timing",
        type: "single",
        question: "When would a move realistically happen?",
        options: [
          { id: "months", label: "Within a few months" },
          { id: "year", label: "Within a year" },
          { id: "later", label: "Later / still hypothesizing" },
        ],
      },
    ];
  }

  return [
    {
      id: "main-driver",
      type: "single",
      question: "What's the single biggest force behind this decision?",
      options: [
        { id: "money", label: "Money / cost" },
        { id: "opportunity", label: "Opportunity / upside" },
        { id: "people", label: "People / relationships" },
        { id: "fit", label: "Fit / quality of day-to-day life" },
        { id: "risk", label: "Risk / stability" },
        { id: "timing", label: "Timing / a deadline" },
      ],
    },
    {
      id: "dealbreaker",
      type: "multi",
      question: "Which of these would change your mind if they shifted?",
      options: [
        { id: "cash", label: "The money picture" },
        { id: "info", label: "New information I don't have yet" },
        { id: "support", label: "Support from people who matter" },
        { id: "stress", label: "How stressful daily life feels" },
        { id: "none", label: "Not much — I'm mostly decided" },
      ],
    },
    {
      id: "lean-now",
      type: "segment",
      question: sides
        ? `Right now, which way are you leaning?`
        : "Right now, how decided do you feel?",
      options: sides
        ? [
            { id: "a", label: sides[0] },
            { id: "b", label: sides[1] },
            { id: "split", label: "Truly split" },
          ]
        : [
            { id: "lean-yes", label: "Leaning toward change" },
            { id: "lean-no", label: "Leaning toward staying put" },
            { id: "split", label: "Truly split" },
          ],
    },
  ];
}

export const FALLBACK_QUESTIONS: ContextQuestion[] = buildFallbackQuestions(
  "a hard personal decision",
);

export function normalizeQuestions(raw: unknown, decision = ""): ContextQuestion[] {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { questions?: unknown })?.questions)
      ? (raw as { questions: unknown[] }).questions
      : [];

  const normalized = list.slice(0, 5).map((item, i) => {
    const q = item as Record<string, unknown>;
    const id = String(q["id"] ?? `q-${i + 1}`);
    const question = String(q["question"] ?? q["prompt"] ?? "What matters most here?");
    let type = coerceType(q["type"]);
    let options = asOptions(q["options"]);

    if (type === "boolean") {
      options = [
        { id: "yes", label: "Yes" },
        { id: "no", label: "No" },
      ];
    }

    if (!q["type"] && !options && type === "single") {
      options = [
        { id: "a", label: "This is central to the decision" },
        { id: "b", label: "It matters, but not the main thing" },
        { id: "c", label: "Background noise — not a driver" },
        { id: "d", label: "I'm still figuring that out" },
      ];
    }

    if (type === "likert" && (!options || options.length < 3)) options = LIKERT_DEFAULT;
    if (
      (type === "single" || type === "multi" || type === "segment" || type === "rank") &&
      (!options || options.length < 2)
    ) {
      type = "scale";
      options = undefined;
    }
    if (type === "segment" && options && options.length > 4) {
      type = "single";
    }

    const min =
      typeof q["min"] === "number"
        ? q["min"]
        : type === "scale" || type === "number"
          ? 1
          : type === "rating"
            ? 1
            : undefined;
    const max =
      typeof q["max"] === "number"
        ? q["max"]
        : type === "scale"
          ? 10
          : type === "rating"
            ? 5
            : type === "number"
              ? 100
              : undefined;

    const impactRaw = String(q["decisionImpact"] ?? "").toLowerCase();
    const decisionImpact =
      impactRaw === "high" || impactRaw === "medium" || impactRaw === "low"
        ? (impactRaw as "high" | "medium" | "low")
        : undefined;

    return {
      id,
      question,
      type,
      ...(options ? { options } : {}),
      ...(min != null ? { min } : {}),
      ...(max != null ? { max } : {}),
      ...(q["minLabel"] ? { minLabel: String(q["minLabel"]) } : {}),
      ...(q["maxLabel"] ? { maxLabel: String(q["maxLabel"]) } : {}),
      ...(q["helper"] ? { helper: String(q["helper"]) } : {}),
      ...(q["reason"] ? { reason: String(q["reason"]) } : {}),
      ...(decisionImpact ? { decisionImpact } : {}),
    };
  });

  return normalized.length > 0 ? normalized : buildFallbackQuestions(decision);
}

export function hasAnswer(answer: AnswerValue | undefined): boolean {
  if (!answer || answer.kind === "skipped") return false;
  if (answer.kind === "multi") return answer.optionIds.length > 0;
  if (answer.kind === "rank") return answer.order.length > 0;
  if (answer.kind === "text") return answer.value.trim().length > 0;
  if (answer.kind === "number") return Number.isFinite(answer.value);
  if (answer.kind === "rating") return answer.value > 0;
  return true;
}

export function serializeAnswer(q: ContextQuestion, answer: AnswerValue | undefined): string {
  if (!answer || answer.kind === "skipped") return "";

  switch (answer.kind) {
    case "single":
    case "likert":
    case "segment":
    case "boolean":
      return answer.label;
    case "multi":
      return answer.labels.length ? answer.labels.join("; ") : "";
    case "scale": {
      const range = `${answer.min}–${answer.max}`;
      const ends =
        answer.minLabel || answer.maxLabel
          ? ` (${answer.minLabel ?? String(answer.min)} → ${answer.maxLabel ?? String(answer.max)})`
          : "";
      return `${answer.value} out of ${answer.max} on a ${range} scale${ends}`;
    }
    case "rating":
      return `${answer.value} / ${answer.max}`;
    case "rank":
      return answer.labels.map((l, i) => `${i + 1}. ${l}`).join("; ");
    case "text":
      return answer.value.trim();
    case "number":
      return String(answer.value);
    default:
      return "";
  }
}

export function defaultAnswer(q: ContextQuestion): AnswerValue | undefined {
  if (q.type === "scale") {
    const min = q.min ?? 1;
    const max = q.max ?? 10;
    const mid = Math.round((min + max) / 2);
    return {
      kind: "scale",
      value: mid,
      min,
      max,
      ...(q.minLabel ? { minLabel: q.minLabel } : {}),
      ...(q.maxLabel ? { maxLabel: q.maxLabel } : {}),
    };
  }
  return undefined;
}
