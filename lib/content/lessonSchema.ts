import { z } from "zod";

// Keep this list in sync with components/visuals/VizRegistry.ts — the zod
// discriminated union below is what makes a typo'd component name fail at
// `npm run sync-content` time instead of for a live student.

const numberLineVizSchema = z.object({
  component: z.literal("NumberLineViz"),
  props: z.object({
    min: z.number(),
    max: z.number(),
    step: z.number().positive().optional(),
    highlight: z.array(z.number()).default([]),
    jumpTo: z.number().optional(),
  }),
});

const fractionBarVizSchema = z.object({
  component: z.literal("FractionBarViz"),
  props: z.object({
    numerator: z.number().int().nonnegative(),
    denominator: z.number().int().positive(),
    compareNumerator: z.number().int().nonnegative().optional(),
    compareDenominator: z.number().int().positive().optional(),
    label: z.string().optional(),
  }),
});

const equationStepRevealSchema = z.object({
  component: z.literal("EquationStepReveal"),
  props: z.object({
    steps: z
      .array(z.object({ label: z.string(), expression: z.string() }))
      .min(1),
  }),
});

const areaGridVizSchema = z.object({
  component: z.literal("AreaGridViz"),
  props: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    unit: z.string().default("cm"),
    highlightArea: z.boolean().default(true),
  }),
});

const angleVizSchema = z.object({
  component: z.literal("AngleViz"),
  props: z.object({
    degrees: z.number().min(0).max(360),
    label: z.string().optional(),
  }),
});

const coordinatePlaneVizSchema = z.object({
  component: z.literal("CoordinatePlaneViz"),
  props: z.object({
    range: z.number().int().positive().default(10),
    points: z.array(z.object({ x: z.number(), y: z.number(), label: z.string().optional() })).default([]),
  }),
});

const barModelVizSchema = z.object({
  component: z.literal("BarModelViz"),
  props: z.object({
    total: z.number().positive(),
    parts: z.array(z.object({ value: z.number().nonnegative(), label: z.string() })),
    unit: z.string().optional(),
  }),
});

const treeDiagramVizSchema = z.object({
  component: z.literal("TreeDiagramViz"),
  props: z.object({
    branches: z.array(z.object({ label: z.string(), probability: z.string() })).min(1),
    secondBranches: z.array(z.object({ label: z.string(), probability: z.string() })).min(1),
    highlightPath: z.tuple([z.string(), z.string()]).optional(),
  }),
});

export const storyboardBeatSchema = z
  .discriminatedUnion("component", [
    numberLineVizSchema,
    fractionBarVizSchema,
    equationStepRevealSchema,
    areaGridVizSchema,
    angleVizSchema,
    coordinatePlaneVizSchema,
    barModelVizSchema,
    treeDiagramVizSchema,
  ])
  .and(
    z.object({
      beatId: z.string().min(1),
      narrationRef: z.string().min(1),
    })
  );

export const lessonSchema = z.object({
  slug: z.string().min(1),
  topicSlug: z.string().min(1),
  topicRef: z.string().min(1),
  title: z.string().min(1),
  episodeNumber: z.number().int().positive().default(1),
  estimatedMinutes: z.number().positive(),
  script: z
    .array(z.object({ beatId: z.string().min(1), narration: z.string().min(1) }))
    .min(1),
  storyboard: z.array(storyboardBeatSchema).min(1),
  videoUrl: z.string().url().nullable().default(null),
});

export type Lesson = z.infer<typeof lessonSchema>;
export type StoryboardBeat = z.infer<typeof storyboardBeatSchema>;

export function parseLessonFile(json: unknown, filePath: string): Lesson {
  const result = lessonSchema.safeParse(json);
  if (!result.success) {
    throw new Error(
      `Invalid lesson content in ${filePath}:\n${result.error.issues
        .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
        .join("\n")}`
    );
  }

  // Cross-check: every narrationRef must point at a real script beat.
  const scriptIds = new Set(result.data.script.map((s) => s.beatId));
  for (const beat of result.data.storyboard) {
    if (!scriptIds.has(beat.narrationRef)) {
      throw new Error(
        `Invalid lesson content in ${filePath}: storyboard beat "${beat.beatId}" references unknown narrationRef "${beat.narrationRef}"`
      );
    }
  }

  return result.data;
}
