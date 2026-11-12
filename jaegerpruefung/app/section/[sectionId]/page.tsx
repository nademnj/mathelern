import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getSection } from "@/lib/content/store";
import { LessonList } from "@/components/LessonList";

export default async function SectionPage(props: PageProps<"/section/[sectionId]">) {
  await connection();
  const { sectionId } = await props.params;
  const section = await getSection(sectionId);
  if (!section) notFound();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link href="/" className="text-sm text-muted hover:text-text">← All sections</Link>
        <div className="text-xs font-medium uppercase tracking-wide text-accent">Sachgebiet {section.order}</div>
        <h1 className="text-2xl font-semibold">{section.titleDe}</h1>
        <p className="text-muted">{section.titleEn}</p>
        <div className="grid gap-3 pt-2 md:grid-cols-2">
          <p className="card p-4 text-sm" lang="de">{section.summaryDe}</p>
          <p className="card p-4 text-sm text-muted">{section.summaryEn}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={`/quiz/${section.id}`} className="btn-primary">Quiz this section ({section.quiz.length} questions)</Link>
        <Link href={`/agent?section=${section.id}`} className="btn-ghost">Collect more material with the agent</Link>
      </div>

      <LessonList
        sectionId={section.id}
        lessons={section.lessons.map((l) => ({
          id: l.id,
          titleDe: l.titleDe,
          titleEn: l.titleEn,
          origin: l.origin,
          paragraphs: l.paragraphs.length,
          questions: section.quiz.filter((q) => q.lessonId === l.id).length,
        }))}
      />
    </div>
  );
}
