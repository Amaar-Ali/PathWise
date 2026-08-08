import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { buildDecision } from "./generate.server";

const inputSchema = z.object({
  question: z.string().min(3).max(300),
  answers: z.array(z.object({ question: z.string(), answer: z.string() })).max(24),
  depth: z.enum(["medium", "high"]).default("medium"),
});

export const generateDecision = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => buildDecision(data));

const questionInput = z.object({
  question: z.string().min(3).max(300),
  options: z.array(z.string().max(120)).max(8).optional(),
  previousAnswers: z
    .array(z.object({ question: z.string().max(400), answer: z.string().max(800) }))
    .max(24)
    .optional(),
  previousQuestions: z
    .array(z.object({ id: z.string().max(80), question: z.string().max(400) }))
    .max(24)
    .optional(),
  stage: z.string().max(40).optional(),
  round: z.number().int().min(1).max(3).optional(),
});

export const generateContextQuestions = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => questionInput.parse(data))
  .handler(async ({ data }) => {
    const { askContextQuestions } = await import("./generate.server");
    return askContextQuestions({
      decision: data.question,
      round: data.round ?? 1,
      ...(data.options ? { options: data.options } : {}),
      ...(data.previousAnswers ? { previousAnswers: data.previousAnswers } : {}),
      ...(data.previousQuestions ? { previousQuestions: data.previousQuestions } : {}),
      ...(data.stage ? { stage: data.stage } : {}),
    });
  });
