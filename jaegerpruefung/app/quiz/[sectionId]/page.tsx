import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getSection, listSections } from "@/lib/content/store";
import { Quiz, type QuizItem } from "@/components/Quiz";

export default async function QuizPage(props: PageProps<"/quiz/[sectionId]">) {
  await connection();
  const { sectionId } = await props.params;

  if (sectionId === "all") {
    const sections = await listSections();
    const items: QuizItem[] = sections.flatMap((s) =>
      s.quiz.map((q) => ({ ...q, sectionId: s.id, sectionTitle: s.titleDe, key: `${s.id}/${q.id}` }))
    );
    return (
      <div className="space-y-4">
        <Link href="/" className="text-sm text-muted hover:text-text">← All sections</Link>
        <h1 className="text-2xl font-semibold">Mock exam · Prüfungssimulation (Bayern)</h1>
        <p className="max-w-3xl text-sm text-muted">
          Like the written part of the Bavarian exam: 16 questions from each of subject areas 1–5 and 20 from area 6,
          no feedback until you hand in, pass with at least 75% fully correct answers. The real exam allows 100 minutes.{" "}
          <Link href="/pruefung" className="text-accent hover:underline">About the exam</Link>
        </p>
        <Quiz items={items} mode="exam" perSection={Object.fromEntries(sections.map((s) => [s.id, s.order === 6 ? 20 : 16]))} />
      </div>
    );
  }

  const section = await getSection(sectionId);
  if (!section) notFound();
  const items: QuizItem[] = section.quiz.map((q) => ({ ...q, sectionId: section.id, sectionTitle: section.titleDe, key: `${section.id}/${q.id}` }));

  return (
    <div className="space-y-4">
      <Link href={`/section/${section.id}`} className="text-sm text-muted hover:text-text">← {section.titleDe}</Link>
      <h1 className="text-2xl font-semibold">Quiz: {section.titleDe}</h1>
      <p className="text-sm text-muted">{section.titleEn} · questions you have not seen or got wrong come first.</p>
      <Quiz items={items} mode="practice" />
    </div>
  );
}
