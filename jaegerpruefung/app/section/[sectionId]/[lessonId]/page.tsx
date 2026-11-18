import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getSection, listSpecies } from "@/lib/content/store";
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
  const animals = (await listSpecies()).filter((sp) => sp.lessonId === lesson.id);

  return (
    <div className="space-y-4">
      <Link href={`/section/${section.id}`} className="text-sm text-muted hover:text-text">
        ← {section.titleDe}
      </Link>
      <LessonReader sectionId={section.id} lesson={lesson} />
      {animals.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold">Animals in this lesson · Arten mit Steckbrief</h2>
          <ul className="flex gap-3 overflow-x-auto pb-2">
            {animals.map((a) => (
              <li key={a.id} className="w-36 shrink-0">
                <Link href={`/arten/${a.id}`} className="card block overflow-hidden hover:bg-surface-2">
                  {a.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.image.src} alt={a.nameDe} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                  )}
                  <span className="block p-2 text-sm font-medium leading-tight" lang="de">{a.nameDe}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
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
