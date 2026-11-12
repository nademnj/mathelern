import { z } from "zod";

/** One paragraph of study text, kept aligned in both languages. */
export const bilingualParagraphSchema = z.object({
  de: z.string().min(1),
  en: z.string().min(1),
  /** Set when `de` is a verbatim quote (e.g. a statute), so the UI can mark it. */
  quote: z.boolean().optional(),
});

export const keyTermSchema = z.object({
  de: z.string().min(1),
  en: z.string().min(1),
  /** One-sentence English explanation of the term. */
  note: z.string().optional(),
});

export const sourceSchema = z.object({
  title: z.string().min(1),
  url: z.url(),
});

export const lessonSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  titleDe: z.string().min(1),
  titleEn: z.string().min(1),
  paragraphs: z.array(bilingualParagraphSchema).min(1),
  keyTerms: z.array(keyTermSchema).default([]),
  sources: z.array(sourceSchema).default([]),
  /** "seed" = shipped with the app; "agent" = written by the collector agent. */
  origin: z.enum(["seed", "agent"]),
  updatedAt: z.string(),
});

export const quizQuestionSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    lessonId: z.string().optional(),
    questionDe: z.string().min(1),
    questionEn: z.string().min(1),
    options: z.array(z.object({ de: z.string().min(1), en: z.string().min(1) })).min(2).max(5),
    /** Indexes into options. The real exam often has more than one correct answer. */
    correct: z.array(z.number().int().min(0)).min(1),
    explanationDe: z.string().min(1),
    explanationEn: z.string().min(1),
    origin: z.enum(["seed", "agent"]),
  })
  .refine((q) => q.correct.every((i) => i < q.options.length), {
    message: "correct index out of range",
    path: ["correct"],
  })
  .refine((q) => new Set(q.correct).size === q.correct.length, {
    message: "duplicate correct index",
    path: ["correct"],
  });

export const sectionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  order: z.number().int(),
  titleDe: z.string().min(1),
  titleEn: z.string().min(1),
  summaryDe: z.string().min(1),
  summaryEn: z.string().min(1),
  /** Search hints the collector agent uses to find material for this section. */
  researchTopics: z.array(z.string()).default([]),
  lessons: z.array(lessonSchema),
  quiz: z.array(quizQuestionSchema),
});

export type BilingualParagraph = z.infer<typeof bilingualParagraphSchema>;
export type KeyTerm = z.infer<typeof keyTermSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type Section = z.infer<typeof sectionSchema>;
