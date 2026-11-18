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

/** One sub-topic of the official Bavarian question catalogue, and the lessons that cover it. */
export const catalogTopicSchema = z.object({
  code: z.string(),
  titleDe: z.string().min(1),
  titleEn: z.string().min(1),
  /** How many questions the official catalogue has on this topic. */
  officialQuestions: z.number().int().min(0),
  lessonIds: z.array(z.string()).default([]),
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
  catalogTopics: z.array(catalogTopicSchema).default([]),
  lessons: z.array(lessonSchema),
  quiz: z.array(quizQuestionSchema),
});

export type BilingualParagraph = z.infer<typeof bilingualParagraphSchema>;
export type KeyTerm = z.infer<typeof keyTermSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type CatalogTopic = z.infer<typeof catalogTopicSchema>;
export type Section = z.infer<typeof sectionSchema>;

// ---- Species profiles (animal guide) ----------------------------------------

export const SPECIES_GROUPS = {
  schalenwild: { de: "Schalenwild", en: "Cloven-hoofed game" },
  "hasen-nager": { de: "Hasenartige und Nager", en: "Hares, rabbits and rodents" },
  raubwild: { de: "Raubwild", en: "Predators" },
  huehnervoegel: { de: "Hühnervögel", en: "Gamebirds" },
  wasserwild: { de: "Wasserfederwild", en: "Waterfowl" },
  greifvoegel: { de: "Greifvögel und Falken", en: "Birds of prey" },
  rabenvoegel: { de: "Rabenvögel", en: "Corvids" },
  "tauben-schnepfe": { de: "Tauben und Schnepfe", en: "Pigeons and woodcock" },
} as const;

export const FACT_LABELS = {
  kennzeichen: { de: "Erkennungsmerkmale", en: "Identification" },
  groesse: { de: "Größe und Gewicht", en: "Size and weight" },
  lebensraum: { de: "Lebensraum", en: "Habitat" },
  nahrung: { de: "Nahrung", en: "Food" },
  fortpflanzung: { de: "Fortpflanzung", en: "Reproduction" },
  jaegersprache: { de: "Jägersprache", en: "Hunters' vocabulary" },
  pruefung: { de: "Prüfungswissen", en: "Exam tip" },
} as const;

export const speciesSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  nameDe: z.string().min(1),
  nameEn: z.string().min(1),
  latin: z.string().min(1),
  group: z.enum(Object.keys(SPECIES_GROUPS) as [keyof typeof SPECIES_GROUPS, ...(keyof typeof SPECIES_GROUPS)[]]),
  lessonId: z.string().optional(),
  seasonDe: z.string().min(1),
  seasonEn: z.string().min(1),
  facts: z.array(
    z.object({
      key: z.enum(Object.keys(FACT_LABELS) as [keyof typeof FACT_LABELS, ...(keyof typeof FACT_LABELS)[]]),
      de: z.string().min(1),
      en: z.string().min(1),
    })
  ),
  image: z
    .object({
      src: z.string().startsWith("/arten/"),
      author: z.string(),
      license: z.string(),
      licenseUrl: z.string(),
      sourceUrl: z.url(),
    })
    .optional(),
});
export type Species = z.infer<typeof speciesSchema>;

// ---- Oral exam ------------------------------------------------------------

export const oralItemSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  questionDe: z.string().min(1),
  questionEn: z.string().min(1),
  answerDe: z.array(z.string().min(1)).min(1),
  answerEn: z.array(z.string().min(1)).min(1),
  lessonId: z.string().optional(),
  speciesId: z.string().optional(),
});
export const oralSectionSchema = z.object({
  sectionId: z.string(),
  items: z.array(oralItemSchema).min(1),
});
export type OralItem = z.infer<typeof oralItemSchema>;
export type OralSection = z.infer<typeof oralSectionSchema>;
