"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SPECIES_GROUPS } from "@/lib/content/schema";

interface Item {
  id: string;
  nameDe: string;
  nameEn: string;
  latin: string;
  group: keyof typeof SPECIES_GROUPS;
  image?: string;
}

export function SpeciesGallery({ species }: { species: Item[] }) {
  const [query, setQuery] = useState("");
  const [quiz, setQuiz] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return species;
    return species.filter((s) => [s.nameDe, s.nameEn, s.latin].some((n) => n.toLowerCase().includes(q)));
  }, [species, query]);

  const groups = (Object.keys(SPECIES_GROUPS) as (keyof typeof SPECIES_GROUPS)[])
    .map((g) => ({ key: g, label: SPECIES_GROUPS[g], items: filtered.filter((s) => s.group === g) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search · Suchen (z. B. Marder, duck, Cervus)"
          className="input max-w-sm"
        />
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={quiz}
            onChange={(e) => {
              setQuiz(e.target.checked);
              setRevealed(new Set());
            }}
          />
          Identify mode — hide names, tap a photo to reveal
        </label>
      </div>

      {groups.map((g) => (
        <section key={g.key} className="space-y-3">
          <h2 className="font-semibold">
            <span lang="de">{g.label.de}</span> <span className="font-normal text-muted">· {g.label.en}</span>
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {g.items.map((s) => {
              const hidden = quiz && !revealed.has(s.id);
              const body = (
                <>
                  <div className="aspect-[4/3] overflow-hidden rounded-t-xl bg-surface-2">
                    {s.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.image} alt={hidden ? "Which species is this?" : s.nameDe} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl" aria-hidden>🦌</div>
                    )}
                  </div>
                  <div className="p-3">
                    {hidden ? (
                      <span className="text-sm text-muted">Tap to reveal</span>
                    ) : (
                      <>
                        <span className="block font-medium leading-tight" lang="de">{s.nameDe}</span>
                        <span className="block text-xs text-muted">{s.nameEn} · <i>{s.latin}</i></span>
                      </>
                    )}
                  </div>
                </>
              );
              return (
                <li key={s.id} className="card overflow-hidden">
                  {hidden ? (
                    <button className="block w-full text-left" onClick={() => setRevealed((r) => new Set(r).add(s.id))}>{body}</button>
                  ) : (
                    <Link href={`/arten/${s.id}`} className="block hover:bg-surface-2">{body}</Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      {groups.length === 0 && <p className="text-muted">No species match “{query}”.</p>}
    </div>
  );
}
