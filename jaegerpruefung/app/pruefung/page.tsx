import Link from "next/link";

const CATALOGUE = "https://www.lmg.bayern.de/aufgaben_leistungen/jaegerpruefung/index.html";
const JFPO = "https://www.gesetze-bayern.de/Content/Document/BayJFPO";

const PARTS = [
  {
    de: "Schriftlicher Teil",
    en: "Written part",
    points: [
      ["100 Fragen im Antwort-Wahl-Verfahren: je 16 aus den Sachgebieten 1–5 und 20 aus Sachgebiet 6. Arbeitszeit 100 Minuten.", "100 multiple-choice questions: 16 from each of subject areas 1–5 and 20 from area 6. You have 100 minutes."],
      ["Bei jeder Frage können eine oder mehrere Antworten (a–f) richtig sein. Eine Frage zählt nur, wenn sie vollständig richtig angekreuzt ist.", "Each question can have one or more correct answers (a–f). A question only counts if every correct answer, and nothing else, is ticked."],
      ["Wer mehr als ein Viertel der Fragen nicht, nicht richtig oder nicht vollständig beantwortet, hat nicht bestanden – man braucht also mindestens 75 richtige Antworten.", "If more than a quarter of the questions are unanswered, wrong or incomplete, you fail — so you need at least 75 correct answers."],
      ["Alle Fragen stammen aus dem veröffentlichten amtlichen Fragenkatalog mit Musterlösung.", "All questions are taken from the published official question catalogue, which includes the model answers."],
    ],
  },
  {
    de: "Mündlicher Teil",
    en: "Oral part",
    points: [
      ["Höchstens drei Bewerber werden gemeinsam geprüft, je Sachgebiet mindestens 10 und höchstens etwa 15 Minuten.", "At most three candidates are examined together, at least 10 and at most about 15 minutes per subject area."],
      ["Nicht bestanden, wer in einem Sachgebiet „ungenügend“ oder in zwei Sachgebieten „mangelhaft“ ist.", "You fail with one subject area rated “ungenügend” (unusable) or two rated “mangelhaft” (deficient)."],
    ],
  },
  {
    de: "Praktischer Teil",
    en: "Practical part",
    points: [
      ["Handhabung der gebräuchlichen Jagdwaffen (Lang- und Kurzwaffen) – wird getrennt vom Schießen bewertet. Ein Verstoß gegen Sicherheitsbestimmungen führt zum Nichtbestehen.", "Handling the usual hunting guns (long guns and handguns) — assessed separately from shooting. Breaking a safety rule means failing."],
      ["Büchsenschießen: vier Schüsse auf die Rehbockscheibe (DJV-Scheibe Nr. 1) auf 100 m, zwei sitzend aufgelegt und zwei stehend angestrichen oder freihändig. Ein Probeschuss ist erlaubt.", "Rifle shooting: four shots at the roe buck target (DJV target no. 1) at 100 m — two seated with a rest, two standing against a support or freehand. One trial shot is allowed."],
      ["Bestanden mit mindestens drei Treffern im 8. bis 10. Ring; eine Wiederholung ist möglich. Waffen und Munition werden gestellt.", "You pass with at least three hits in rings 8–10; one repeat is possible. Guns and ammunition are provided."],
    ],
  },
  {
    de: "Ablauf und Wiederholung",
    en: "Order and retakes",
    points: [
      ["Die Teile werden in der Reihenfolge schriftlich – mündlich – praktisch abgelegt und müssen jeweils bestanden werden.", "The parts are taken in the order written – oral – practical, and each must be passed."],
      ["Innerhalb von zwei Jahren nach dem schriftlichen Teil können der mündliche und der praktische Teil je zweimal wiederholt werden.", "Within two years of passing the written part, the oral and practical parts can each be retaken twice."],
      ["Vorher ist eine jagdliche Ausbildung von mindestens 120 Stunden nötig, davon mindestens 60 Stunden praktisch (ohne Schießausbildung).", "Beforehand you need at least 120 hours of hunting training, at least 60 of them practical (shooting training not counted)."],
    ],
  },
];

export default function ExamPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/" className="text-sm text-muted hover:text-text">← All sections</Link>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Die Jägerprüfung in Bayern</h1>
        <p className="text-muted">How the Bavarian hunting exam works, according to the exam regulations (JFPO §§ 7, 11–15).</p>
      </div>
      {PARTS.map((part) => (
        <section key={part.de} className="card space-y-3 p-5">
          <h2 className="font-semibold">
            <span lang="de">{part.de}</span> <span className="font-normal text-muted">· {part.en}</span>
          </h2>
          <ul className="space-y-3">
            {part.points.map(([de, en]) => (
              <li key={de} className="grid gap-1 md:grid-cols-2 md:gap-4">
                <span lang="de">{de}</span>
                <span className="text-muted">{en}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <section className="card space-y-2 p-5 text-sm">
        <h2 className="font-semibold">Official sources</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <a className="text-accent hover:underline" href={CATALOGUE} target="_blank" rel="noreferrer">
              Bayerisches Landesamt für Maß und Gewicht – Jägerprüfung
            </a>
            : the official question catalogue for all six subject areas (with and without answers), past exam papers and dates.
            Practise with the original questions there; this app teaches the same topics in German and English.
          </li>
          <li>
            <a className="text-accent hover:underline" href={JFPO} target="_blank" rel="noreferrer">
              Jäger- und Falknerprüfungsordnung (JFPO)
            </a>
            : the exam regulations.
          </li>
        </ul>
        <p className="text-xs text-muted">Summary as of November 2026. The regulations and catalogue are binding; check them for changes.</p>
      </section>
    </div>
  );
}
