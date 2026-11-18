import Link from "next/link";
import { connection } from "next/server";
import { listOral, listSections } from "@/lib/content/store";
import { OralTrainer } from "@/components/OralTrainer";

export default async function OralPage() {
  await connection();
  const [oral, sections] = await Promise.all([listOral(), listSections()]);
  const titled = oral.map((o) => {
    const s = sections.find((x) => x.id === o.sectionId);
    return { ...o, order: s?.order ?? 0, titleDe: s?.titleDe ?? o.sectionId, titleEn: s?.titleEn ?? "" };
  });

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-muted hover:text-text">← All sections</Link>
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">Mündliche Prüfung · Oral exam</h1>
        <div className="card grid gap-4 p-4 text-sm md:grid-cols-2">
          <ul className="list-disc space-y-1 pl-5" lang="de">
            <li>Höchstens drei Bewerber werden gemeinsam geprüft, je Sachgebiet mindestens 10 und höchstens etwa 15 Minuten (§ 13 JFPO).</li>
            <li>Geprüft werden alle sechs Sachgebiete – oft anhand von Präparaten, Bälgen, Federn, Gehörnen, Zweigen, Waffen, Munition und Fallen.</li>
            <li>Bewertung je Sachgebiet: ausreichend, mangelhaft oder ungenügend. Nicht bestanden mit einmal »ungenügend« oder zweimal »mangelhaft«.</li>
          </ul>
          <ul className="list-disc space-y-1 pl-5 text-muted">
            <li>At most three candidates are examined together, at least 10 and at most about 15 minutes per subject area (§ 13 JFPO).</li>
            <li>All six areas are examined — often with mounted animals, skins, feathers, antlers, twigs, guns, ammunition and traps.</li>
            <li>Each area is rated ausreichend (pass), mangelhaft (deficient) or ungenügend (fail). One “ungenügend” or two “mangelhaft” means failing.</li>
          </ul>
        </div>
        <p className="max-w-3xl text-sm text-muted">
          Below are typical examiner questions with model answers (key points). Bavaria publishes no official oral
          question list — these follow the exam regulations and catalogue topics. Answer out loud in German first, then
          compare. Or start a session with the AI examiner and answer by typing or with the 🎤 microphone.
        </p>
      </div>
      <OralTrainer sections={titled.sort((a, b) => a.order - b.order)} />
    </div>
  );
}
