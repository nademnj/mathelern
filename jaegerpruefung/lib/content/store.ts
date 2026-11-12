import { promises as fs } from "node:fs";
import path from "node:path";
import { sectionSchema, type Lesson, type QuizQuestion, type Section } from "./schema";
import { mergeLesson, mergeQuiz } from "./merge";

export const CONTENT_DIR = path.join(process.cwd(), "content", "sections");

export async function listSections(): Promise<Section[]> {
  const files = (await fs.readdir(CONTENT_DIR)).filter((f) => f.endsWith(".json"));
  const sections = await Promise.all(files.map((f) => readSectionFile(path.join(CONTENT_DIR, f))));
  return sections.sort((a, b) => a.order - b.order);
}

export async function getSection(id: string): Promise<Section | null> {
  if (!/^[a-z0-9-]+$/.test(id)) return null;
  try {
    return await readSectionFile(path.join(CONTENT_DIR, `${id}.json`));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

async function readSectionFile(file: string): Promise<Section> {
  const raw = JSON.parse(await fs.readFile(file, "utf8"));
  return sectionSchema.parse(raw);
}

async function writeSection(section: Section): Promise<void> {
  const valid = sectionSchema.parse(section);
  const file = path.join(CONTENT_DIR, `${valid.id}.json`);
  // Write to a temp file and rename, so a crash never leaves half a file.
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(valid, null, 2) + "\n", "utf8");
  await fs.rename(tmp, file);
}

/** Serialises writes per section so parallel agent tool calls can't clobber each other. */
const locks = new Map<string, Promise<unknown>>();
function withLock<T>(id: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(id) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  locks.set(id, next.catch(() => undefined));
  return next;
}

export function saveLesson(sectionId: string, lesson: Lesson): Promise<Section> {
  return withLock(sectionId, async () => {
    const section = await getSection(sectionId);
    if (!section) throw new Error(`Unknown section ${sectionId}`);
    const updated = { ...section, lessons: mergeLesson(section.lessons, lesson) };
    await writeSection(updated);
    return updated;
  });
}

export function saveQuizQuestions(sectionId: string, questions: QuizQuestion[]): Promise<Section> {
  return withLock(sectionId, async () => {
    const section = await getSection(sectionId);
    if (!section) throw new Error(`Unknown section ${sectionId}`);
    const updated = { ...section, quiz: mergeQuiz(section.quiz, questions) };
    await writeSection(updated);
    return updated;
  });
}
