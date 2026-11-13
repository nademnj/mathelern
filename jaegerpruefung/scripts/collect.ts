/**
 * Runs the collector agent from the command line.
 *
 *   npm run collect -- --section wildtierkunde --state Bayern --lessons 2
 *   npm run collect -- --all --state Niedersachsen
 *   npm run collect -- --section waffen --focus "Ballistik und Kaliberwahl"
 */
import { collectSection, type CollectorEvent } from "../lib/agent/collector";
import { listSections } from "../lib/content/store";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

function print(e: CollectorEvent) {
  switch (e.type) {
    case "search": return console.log(`  🔎 ${e.query}`);
    case "fetch": return console.log(`  📄 ${e.url}`);
    case "thinking": return console.log(`  💭 ${e.text.replace(/\s+/g, " ").slice(0, 160)}`);
    case "lesson_saved": return console.log(`  ✅ Lesson saved: ${e.title} (${e.lessonId})`);
    case "quiz_saved": return console.log(`  ✅ ${e.count} quiz question(s) saved`);
    case "warning": return console.warn(`  ⚠️  ${e.message}`);
    case "error": return console.error(`  ❌ ${e.message}`);
    case "done": return console.log(`  Done: ${e.lessonsSaved} lesson(s), ${e.questionsSaved} question(s).`);
    default: return console.log(`  ${e.message}`);
  }
}

async function main() {
  const state = arg("state") ?? "Bayern";
  const focus = arg("focus");
  const maxLessons = Number(arg("lessons") ?? 2);
  const sections = await listSections();
  const ids = process.argv.includes("--all") ? sections.map((s) => s.id) : [arg("section")].filter(Boolean) as string[];

  if (ids.length === 0) {
    console.log("Usage: npm run collect -- --section <id> [--state Bayern] [--lessons 2] [--focus \"...\"]  |  --all");
    console.log("Sections:", sections.map((s) => s.id).join(", "));
    process.exit(1);
  }

  for (const sectionId of ids) {
    console.log(`\n▶ ${sectionId}`);
    await collectSection({ sectionId, state, focus, maxLessons, onEvent: print });
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
