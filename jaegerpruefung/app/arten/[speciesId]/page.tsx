import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getSection, getSpecies, listSpecies } from "@/lib/content/store";
import { FACT_LABELS, SPECIES_GROUPS } from "@/lib/content/schema";
import { SpeciesChat } from "@/components/SpeciesChat";
import { SpeakButton } from "@/components/SpeakButton";

export default async function SpeciesDetail(props: PageProps<"/arten/[speciesId]">) {
  await connection();
  const { speciesId } = await props.params;
  const s = await getSpecies(speciesId);
  if (!s) notFound();
  const all = (await listSpecies()).filter((x) => x.group === s.group);
  const idx = all.findIndex((x) => x.id === s.id);
  const prev = all[idx - 1];
  const next = all[idx + 1];
  const section = await getSection("wildtierkunde");
  const lesson = section?.lessons.find((l) => l.id === s.lessonId);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <article className="min-w-0 space-y-5">
        <Link href="/arten" className="text-sm text-muted hover:text-text">← Wildarten · all species</Link>
        <header className="space-y-1">
          <div className="text-xs font-medium uppercase tracking-wide text-accent">
            {SPECIES_GROUPS[s.group].de} · {SPECIES_GROUPS[s.group].en}
          </div>
          <h1 className="text-2xl font-semibold" lang="de">{s.nameDe}</h1>
          <p className="text-muted">{s.nameEn} · <i>{s.latin}</i></p>
        </header>

        {s.image && (
          <figure className="card overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.image.src} alt={s.nameDe} className="max-h-[70vh] w-full bg-surface-2 object-contain" />
            <figcaption className="px-3 py-2 text-xs text-muted">
              Photo: {s.image.author} ·{" "}
              {s.image.licenseUrl ? (
                <a className="underline" href={s.image.licenseUrl} target="_blank" rel="noreferrer">{s.image.license}</a>
              ) : (
                s.image.license
              )}{" "}
              ·{" "}
              <a className="underline" href={s.image.sourceUrl} target="_blank" rel="noreferrer">
                {new URL(s.image.sourceUrl).hostname.replace(/^www\./, "")}
              </a>
            </figcaption>
          </figure>
        )}

        <section className="card border-l-4 border-l-accent p-4">
          <h2 className="text-sm font-semibold">Jagdzeit in Bayern · Open season in Bavaria</h2>
          <p lang="de">{s.seasonDe}</p>
          <p className="text-sm text-muted">{s.seasonEn}</p>
        </section>

        <dl className="space-y-3">
          {s.facts.map((f) => (
            <div key={f.key} className="card p-4">
              <dt className="mb-2 flex items-center justify-between gap-2 text-sm font-semibold">
                <span>
                  <span lang="de">{FACT_LABELS[f.key].de}</span> <span className="font-normal text-muted">· {FACT_LABELS[f.key].en}</span>
                </span>
                <span className="text-xs font-normal"><SpeakButton text={f.de} /></span>
              </dt>
              <dd className="grid gap-3 md:grid-cols-2">
                <span lang="de" className="leading-relaxed">{f.de}</span>
                <span className="leading-relaxed text-muted">{f.en}</span>
              </dd>
            </div>
          ))}
        </dl>

        {lesson && (
          <p className="text-sm">
            Lesson: <Link className="text-accent hover:underline" href={`/section/wildtierkunde/${lesson.id}`}>{lesson.titleDe}</Link>
          </p>
        )}
        <nav className="flex justify-between gap-2 border-t border-border pt-4 text-sm">
          {prev ? <Link className="btn-ghost" href={`/arten/${prev.id}`}>← {prev.nameDe}</Link> : <span />}
          {next && <Link className="btn-primary" href={`/arten/${next.id}`}>{next.nameDe} →</Link>}
        </nav>
      </article>
      <aside className="lg:sticky lg:top-4 lg:h-[calc(100dvh-2rem)]">
        <SpeciesChat speciesId={s.id} lessonId={s.lessonId} name={s.nameDe} />
      </aside>
    </div>
  );
}
