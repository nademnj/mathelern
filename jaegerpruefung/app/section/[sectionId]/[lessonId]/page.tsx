import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getSection } from "@/lib/content/store";
import { LessonReader } from "@/components/LessonReader";

export default async function LessonPage(props: PageProps<"/section/[sectionId]/[lessonId]">) {
  await connection();
  const { sectionId, lessonId } = await props.params;
  const section = await getSection(sectionId);
  const index = section?.lessons.findIndex((l) => l.id === lessonId) ?? -1;
  if (!section || index === -1) notFound();

  const lesson = section.lessons[index];
  const prev = section.lessons[index - 1];
  const next = section.lessons[index + 1];

  return (
    <div className="space-y-4">
      <Link href={`/section/${section.id}`} className="text-sm text-muted hover:text-text">
        ← {section.titleDe}
      </Link>
      <LessonReader sectionId={section.id} lesson={lesson} />
      <nav className="flex justify-between gap-2 border-t border-border pt-4 text-sm">
        {prev ? <Link className="btn-ghost" href={`/section/${section.id}/${prev.id}`}>← {prev.titleDe}</Link> : <span />}
        {next ? (
          <Link className="btn-primary" href={`/section/${section.id}/${next.id}`}>{next.titleDe} →</Link>
        ) : (
          <Link className="btn-primary" href={`/quiz/${section.id}`}>Take the section quiz →</Link>
        )}
      </nav>
    </div>
  );
}
