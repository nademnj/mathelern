// Validates every content/lessons/**/*.json file against lessonSchema and
// upserts it into Postgres (lessons table), looking up topic_id by topicSlug.
//
// Usage:
//   npm run sync-content          # validate + write
//   npm run sync-content -- --check   # validate only, no DB writes (CI/pre-commit)

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseLessonFile } from "../lib/content/lessonSchema";
import { createAdminClient } from "../lib/supabase/admin";

const CONTENT_DIR = join(__dirname, "..", "content", "lessons");
const checkOnly = process.argv.includes("--check");

function findLessonFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return findLessonFiles(full);
    return entry.name.endsWith(".json") ? [full] : [];
  });
}

async function main() {
  const files = findLessonFiles(CONTENT_DIR);
  if (files.length === 0) {
    console.log("No lesson content files found under content/lessons/.");
    return;
  }

  const lessons = files.map((filePath) => {
    const json = JSON.parse(readFileSync(filePath, "utf-8"));
    return { filePath, lesson: parseLessonFile(json, filePath) };
  });

  console.log(`Validated ${lessons.length} lesson file(s).`);
  if (checkOnly) {
    console.log("--check: skipping DB sync.");
    return;
  }

  const admin = createAdminClient();
  let failed = 0;

  for (const { filePath, lesson } of lessons) {
    const { data: topic, error: topicError } = await admin
      .from("topics")
      .select("id")
      .eq("slug", lesson.topicSlug)
      .single();

    if (topicError || !topic) {
      console.error(`✗ ${lesson.slug}: no topic found with slug "${lesson.topicSlug}" (${filePath})`);
      failed++;
      continue;
    }

    const { error: upsertError } = await admin.from("lessons").upsert(
      {
        slug: lesson.slug,
        topic_id: topic.id,
        title: lesson.title,
        episode_number: lesson.episodeNumber,
        script_md: lesson.script.map((s) => s.narration).join("\n\n"),
        script_json: lesson.script,
        storyboard_json: lesson.storyboard,
        video_url: lesson.videoUrl,
        duration_seconds_estimate: Math.round(lesson.estimatedMinutes * 60),
        status: "published",
      },
      { onConflict: "slug" }
    );

    if (upsertError) {
      console.error(`✗ ${lesson.slug}: ${upsertError.message}`);
      failed++;
      continue;
    }

    console.log(`✓ synced ${lesson.slug} -> topic ${lesson.topicSlug}`);
  }

  if (failed > 0) {
    console.error(`\n${failed} lesson(s) failed to sync.`);
    process.exit(1);
  }
  console.log(`\nSynced ${lessons.length} lesson(s) successfully.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
