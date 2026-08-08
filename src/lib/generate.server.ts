import type { DecisionDoc, DecisionNode } from "./decision-model";
import type { ContextQuestion } from "./assessment-questions";
import { AI_NOT_CONFIGURED_MESSAGE, AI_OUT_OF_CREDITS_MESSAGE } from "./ai-config";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "qwen/qwen3.6-27b";
const MAX_QUESTION_ROUNDS = 3;

const VOICE = `You are PathWise. You help a person think through a hard decision.
Voice: human, calm, intelligent, direct, thoughtful. Never salesy, never robotic, no percentages,
no "as an AI", no hedging clichés. Short sentences. Say the honest tradeoff out loud.
Never invent facts about the person. Never pad content to fill a UI: if only three paths are
meaningful, give three.`;

const INTERVIEWER_SYSTEM = `You are PathWise's decision-analysis interviewer.

You invent CONCRETE, SITUATION-SPECIFIC multiple-choice questions about the user's exact decision.
You are NOT a life coach. You do NOT ask abstract self-help questions.

ABSOLUTE BANS (never output these patterns):
- "What are your goals / strengths / concerns / values?"
- "How high are the stakes?"
- "How soon do you need to decide?"
- "Which constraints bind…?"
- "Rank what you want to protect most"
- Any question that only wraps the user's decision in quotes like: If "…" goes poorly…
- Any question that would fit ANY life decision unchanged

REQUIRED STYLE:
- Ask about the real drivers of THIS decision (money, fit, quality, timing, people, logistics — only if relevant).
- Prefer single_choice / multiple_choice with SPECIFIC option labels.
- Options must sound like answers a person would actually say for this topic.

EXAMPLE — decision "I am thinking about leaving my current school":
GOOD questions/options:
1. "What's the main reason you're considering leaving?"
   options: ["Want better / higher courses", "Fees are too high", "Infrastructure / facilities aren't good enough", "Teaching quality", "Social environment / friends", "Location or commute", "Something else"]
2. "What would need to be true at a new school for the move to be worth it?"
   options: ["Stronger academics / courses", "Lower or better-value fees", "Better campus / labs / facilities", "Better teachers", "Better peer group", "I'm not sure yet"]
3. "How locked in are you at your current school right now?"
   options: ["I can leave this term / year", "I'd have to wait until next year", "Financial or family barriers make it hard", "I'm still only exploring"]

BAD for that decision:
- "If \\"I am thinking about leaving my current school\\" goes poorly, how costly is that?"
- "What are your goals?"

EXAMPLE — decision "Should I take this job offer or stay?":
GOOD: ask about pay gap, role growth, manager/team, commute, stability of current job — with concrete options.
BAD: "How important is this?" / stakes slider with the decision pasted in quotes.

Return STRICT JSON only. No markdown. No prose outside JSON.`;

export interface QuestionRoundInput {
  decision: string;
  options?: string[];
  previousAnswers?: { question: string; answer: string }[];
  previousQuestions?: { id: string; question: string }[];
  stage?: string;
  round?: number;
}

export interface QuestionRoundResult {
  questions: ContextQuestion[];
  shouldContinue: boolean;
  confidence: number;
  round: number;
}

function buildInterviewUserPayload(input: QuestionRoundInput, stricter = false): string {
  const decision = input.decision.trim();
  const round = Math.max(1, input.round ?? 1);
  const context = {
    decision,
    options: input.options ?? [],
    previousAnswers: (input.previousAnswers ?? []).filter((a) => a.answer.trim()),
    previousQuestions: input.previousQuestions ?? [],
    currentStage: input.stage ?? (round === 1 ? "discovery" : "deepen"),
    round,
    maxRounds: MAX_QUESTION_ROUNDS,
  };

  return `${stricter ? "STRICT RETRY: Your last questions were too generic or invalid. Rewrite with concrete options for THIS decision only.\n\n" : ""}User decision (verbatim):
"${decision}"

Full context JSON:
${JSON.stringify(context)}

Produce 3 questions (2–5 allowed) that a sharp friend would ask AFTER hearing that exact sentence.
Every option label must be specific to this situation (fees, courses, infrastructure, offer pay, rent vs buy deposit, etc. — whatever fits).
Do NOT paste the decision text inside the question with quotes.

Return ONLY:
{
  "questions": [
    {
      "id": "kebab_id",
      "question": "...",
      "type": "single_choice",
      "options": ["concrete option A", "concrete option B", "concrete option C"],
      "reason": "why this changes the tree",
      "decisionImpact": "high"
    }
  ],
  "shouldContinue": true,
  "confidence": 0.7
}

Prefer type single_choice or multiple_choice. Use scale/boolean only when it truly fits.
If round ${round} already has enough to map paths, set shouldContinue false.`;
}

function looksGenericQuestion(text: string, decision: string): boolean {
  const q = text.toLowerCase().replace(/\s+/g, " ").trim();
  const d = decision.toLowerCase().replace(/\s+/g, " ").trim();
  if (!q) return true;
  if (/what are your (goals|strengths|concerns|values|priorities)\b/.test(q)) return true;
  if (/how (high|big) are the stakes/.test(q)) return true;
  if (/how soon do you need/.test(q)) return true;
  if (/which constraints bind/.test(q)) return true;
  if (/rank what you want to protect/.test(q)) return true;
  if (/how important is this/.test(q)) return true;
  if (/goes poorly, how costly/.test(q)) return true;
  if (/i already lean toward one path/.test(q)) return true;
  if (d.length > 12 && q.includes(`"${d.slice(0, 24)}`)) return true;
  if (d.length > 12 && q.includes(`“${d.slice(0, 24)}`)) return true;
  return false;
}

function assertQuestionsSpecific(questions: { question?: string }[], decision: string) {
  const bad = questions.filter((q) => looksGenericQuestion(String(q.question ?? ""), decision));
  if (bad.length >= Math.ceil(questions.length / 2)) {
    throw new Error("questions too generic");
  }
}

async function resolveEnvString(name: string): Promise<string | undefined> {
  const fromProcess = process.env[name]?.trim();
  if (fromProcess) return fromProcess;

  try {
    const mod = "cloudflare:workers";
    const { env } = (await import(/* @vite-ignore */ mod)) as {
      env: Record<string, unknown>;
    };
    const fromCf = env[name];
    if (typeof fromCf === "string" && fromCf.trim()) return fromCf.trim();
  } catch {
    /* ignore */
  }

  return undefined;
}

async function resolveGroqApiKey(): Promise<string | undefined> {
  return resolveEnvString("GROQ_API_KEY");
}

async function resolveGroqModel(): Promise<string> {
  return (await resolveEnvString("GROQ_MODEL")) || DEFAULT_GROQ_MODEL;
}

function redactSecrets(text: string): string {
  return text
    .replace(/gsk_[A-Za-z0-9]+/g, "[redacted]")
    .replace(/sk-or-v1-[A-Za-z0-9_-]+/g, "[redacted]")
    .replace(/pk-prov-[A-Za-z0-9_-]+/g, "[redacted]");
}

function looksLikeCreditsFailure(status: number, body: string): boolean {
  if (status === 402) return true;
  return /insufficient[_\s-]?credits|out of (thinking )?credits|payment required|quota|rate.?limit.*billing/i.test(
    body,
  );
}

async function callGroq(
  messages: { role: string; content: string }[],
  maxTokens = 6000,
  temperature = 0.4,
) {
  const key = await resolveGroqApiKey();
  if (!key) throw new Error(AI_NOT_CONFIGURED_MESSAGE);

  const model = await resolveGroqModel();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);

  let res: Response;
  try {
    res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
        ...(model.includes("qwen") ? { reasoning_effort: "none" } : {}),
      }),
      signal: controller.signal,
    });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("The model took too long. Try again.");
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    let body = "";
    try {
      body = redactSecrets(await res.text());
    } catch {
      /* ignore */
    }

    if (looksLikeCreditsFailure(res.status, body)) {
      throw new Error(AI_OUT_OF_CREDITS_MESSAGE);
    }
    if (res.status === 429) {
      throw new Error(
        "PathWise is thinking about a lot of decisions right now. Try again in a moment.",
      );
    }
    if (res.status === 401) {
      throw new Error("Groq rejected the API key. Check GROQ_API_KEY in .env.local.");
    }
    throw new Error(`Groq error ${res.status}`);
  }

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content ?? "";
}

function stripModelNoise(raw: string): string {
  return raw
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<think>[\s\S]*$/gi, "")
    .trim();
}

function parseJson<T>(raw: string): T {
  const cleaned = stripModelNoise(raw)
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("unparseable");
  return JSON.parse(cleaned.slice(start, end + 1)) as T;
}

function validateQuestionRound(parsed: {
  questions?: unknown;
  shouldContinue?: unknown;
  confidence?: unknown;
}): { questions: unknown[]; shouldContinue: boolean; confidence: number } {
  if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    throw new Error("invalid questions payload");
  }
  const questions = parsed.questions.slice(0, 5);
  if (questions.length < 1) throw new Error("empty questions");

  const shouldContinue = Boolean(parsed.shouldContinue);
  const confidence =
    typeof parsed.confidence === "number" && Number.isFinite(parsed.confidence)
      ? Math.min(1, Math.max(0, parsed.confidence))
      : 0.5;

  return { questions, shouldContinue, confidence };
}

export async function askContextQuestions(
  input: QuestionRoundInput | string,
): Promise<QuestionRoundResult> {
  const normalized: QuestionRoundInput =
    typeof input === "string" ? { decision: input, round: 1 } : input;

  const decision = normalized.decision.trim();
  if (decision.length < 3) throw new Error("Decision is too short.");

  const round = Math.min(MAX_QUESTION_ROUNDS, Math.max(1, normalized.round ?? 1));

  const run = async (stricter: boolean) => {
    const raw = await callGroq(
      [
        { role: "system", content: INTERVIEWER_SYSTEM },
        {
          role: "user",
          content: buildInterviewUserPayload({ ...normalized, decision, round }, stricter),
        },
      ],
      3500,
      stricter ? 0.15 : 0.35,
    );
    const parsed = parseJson<{
      questions?: unknown;
      shouldContinue?: unknown;
      confidence?: unknown;
    }>(raw);
    const validated = validateQuestionRound(parsed);
    assertQuestionsSpecific(validated.questions as { question?: string }[], decision);
    return validated;
  };

  const { normalizeQuestions, buildFallbackQuestions } = await import("./assessment-questions");

  let payload: { questions: unknown[]; shouldContinue: boolean; confidence: number };
  try {
    payload = await run(false);
  } catch {
    try {
      payload = await run(true);
    } catch {
      return {
        questions: buildFallbackQuestions(decision),
        shouldContinue: false,
        confidence: 0.35,
        round,
      };
    }
  }

  const questions = normalizeQuestions(payload.questions, decision).filter(
    (q) => !looksGenericQuestion(q.question, decision),
  );
  const finalQuestions = questions.length > 0 ? questions : buildFallbackQuestions(decision);

  const shouldContinue =
    round < MAX_QUESTION_ROUNDS &&
    payload.shouldContinue &&
    finalQuestions.length > 0 &&
    questions.length > 0;

  return {
    questions: finalQuestions,
    shouldContinue,
    confidence: payload.confidence,
    round,
  };
}

export async function buildDecision(input: {
  question: string;
  answers: { question: string; answer: string }[];
  depth: "medium" | "high";
}): Promise<DecisionDoc> {
  const shape =
    input.depth === "high"
      ? `Give 3 to 5 major paths. Every path MUST have 2 or 3 children (kind "consequence"), and each
consequence that warrants it MUST have one child of its own (kind "decision" or "outcome"). Three levels below the root.`
      : `Give 3 or 4 major paths. Every path MUST have 1 or 2 children (kind "consequence"). Do not go deeper.`;

  const context = input.answers
    .filter((a) => a.answer.trim())
    .map((a) => `Q: ${a.question}\nA: ${a.answer}`)
    .join("\n\n");

  const brief = `Decision: "${input.question}"

What they told me:
${context || "(they gave very little context — work with what's there and keep the map honest about that)"}`;

  const paths = await buildPaths(brief, shape);
  const reflection = await buildReflection(brief, paths);

  const now = Date.now();
  return {
    title: paths.title,
    context: paths.context ?? [],
    criteria: paths.criteria ?? [],
    assumptions: paths.assumptions ?? [],
    root: {
      id: "root",
      kind: "root",
      label: input.question,
      summary: paths.summary,
      children: paths.paths,
    },
    insights: reflection.insights ?? [],
    recommendation: reflection.recommendation,
    id: `d_${now.toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    question: input.question,
    depth: input.depth,
    createdAt: now,
    updatedAt: now,
  };
}

interface PathsPayload {
  title: string;
  summary: string;
  context: DecisionDoc["context"];
  criteria: string[];
  assumptions: DecisionDoc["assumptions"];
  paths: DecisionNode[];
}

async function buildPaths(brief: string, shape: string, attempt = 0): Promise<PathsPayload> {
  const raw = await callGroq(
    [
      { role: "system", content: VOICE },
      {
        role: "user",
        content: `${brief}

Map this decision. ${shape}

Return JSON only:
{
 "title": "short editorial title, max 8 words",
 "summary": "one line under the decision",
 "context": [{"label":"Situation|Wants|Constraints|Concern","value":"one sentence, in your voice"}],
 "criteria": ["3-5 comparison criteria that fit THIS decision, never generic ones"],
 "assumptions": [{"id":"kebab","label":"What if ... (short)","hint":"optional"}],
 "paths": [{
   "id":"kebab","kind":"path","label":"short path name","summary":"one sentence",
   "tradeoff":"the honest catch","risk":"low|medium|high",
   "why":"...","upside":"...","watch":"...","next":"...",
   "pros":["..."],"cons":["..."],
   "scores":{"<each criteria string>": 0-100},
   "strongerWhen":["assumption ids"],"weakerWhen":["assumption ids"],
   "timeline":[{"label":"step","when":"when"}],
   "children":[{"id":"kebab","kind":"consequence","label":"...","summary":"...","risk":"low|medium|high","tradeoff":"...","children":[{"id":"kebab","kind":"decision|outcome","label":"...","summary":"...","risk":"low|medium|high"}]}]
 }]
}
Every id unique and kebab-case. The "children" arrays are required — a path with no children is not an acceptable answer.
No prose outside the JSON.`,
      },
    ],
    9000,
  );

  const parsed = parseJson<PathsPayload>(raw);
  const ok =
    Array.isArray(parsed.paths) &&
    parsed.paths.length >= 2 &&
    parsed.paths.every((p) => p.children?.length);
  if (!ok && attempt === 0) return buildPaths(brief, shape, 1);
  if (!Array.isArray(parsed.paths) || parsed.paths.length === 0) throw new Error("no paths");
  return parsed;
}

async function buildReflection(brief: string, paths: PathsPayload) {
  const outline = paths.paths
    .map((p) => `- ${p.id}: ${p.label} — ${p.summary ?? ""} (tradeoff: ${p.tradeoff ?? "—"})`)
    .join("\n");

  const raw = await callGroq(
    [
      { role: "system", content: VOICE },
      {
        role: "user",
        content: `${brief}

The paths you mapped:
${outline}

Now think out loud, briefly. Return JSON only:
{
 "insights":[{"text":"a real observation about THIS situation, one or two sentences","emphasis":true}],
 "recommendation":{"pathId":"one of the path ids above","lean":"I'd lean toward ...","why":"...","downside":"...","uncertain":"what you're least sure about","couldChange":"what would change your mind"}
}
Three or four insights maximum. Only the first one has emphasis true. Stay humble — you are helping them reason, not predicting.`,
      },
    ],
    2500,
  );

  const parsed = parseJson<{
    insights: DecisionDoc["insights"];
    recommendation: DecisionDoc["recommendation"];
  }>(raw);
  if (
    !parsed.recommendation?.pathId ||
    !paths.paths.some((p) => p.id === parsed.recommendation.pathId)
  ) {
    parsed.recommendation = { ...parsed.recommendation, pathId: paths.paths[0]!.id };
  }
  return parsed;
}

export { MAX_QUESTION_ROUNDS };
