import { connection } from "next/server";
import { listSections } from "@/lib/content/store";
import { SectionGrid } from "@/components/SectionGrid";

export default async function Home() {
  await connection(); // content can change when the agent runs, so always read fresh
  const sections = await listSections();
  const summaries = sections.map((s) => ({
    id: s.id,
    order: s.order,
    titleDe: s.titleDe,
    titleEn: s.titleEn,
    summaryEn: s.summaryEn,
    lessonIds: s.lessons.map((l) => l.id),
    questionIds: s.quiz.map((q) => q.id),
  }));

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Prepare for the Jägerprüfung</h1>
        <p className="max-w-3xl text-muted">
          Study each exam section in the original German with an English translation beside it, ask the AI tutor
          whenever something is unclear, and test yourself with exam-style questions. The collector agent can search
          the web for more material and add it to any section.
        </p>
      </section>
      <SectionGrid sections={summaries} />
      <p className="text-xs text-muted">
        Study aid only. Hunting law differs between the federal states; for anything legally binding, check the official
        text of the Bundesjagdgesetz, your state&apos;s Landesjagdgesetz and its exam regulations (Prüfungsordnung).
      </p>
    </div>
  );
}
