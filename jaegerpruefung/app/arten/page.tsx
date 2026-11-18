import Link from "next/link";
import { connection } from "next/server";
import { listSpecies } from "@/lib/content/store";
import { SpeciesGallery } from "@/components/SpeciesGallery";

export default async function SpeciesPage() {
  await connection();
  const species = await listSpecies();
  return (
    <div className="space-y-6">
      <Link href="/section/wildtierkunde" className="text-sm text-muted hover:text-text">← Biologie der Wildarten</Link>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Wildarten · Animal guide</h1>
        <p className="max-w-3xl text-muted">
          Every game species in the Bavarian exam with a photo, how to recognise it, its habitat, food, reproduction, the
          hunters&apos; vocabulary and its open season in Bavaria. In the oral exam you are shown mounted animals,
          skins and feathers — practise identifying them here.
        </p>
      </div>
      <SpeciesGallery
        species={species.map((s) => ({ id: s.id, nameDe: s.nameDe, nameEn: s.nameEn, latin: s.latin, group: s.group, image: s.image?.src }))}
      />
    </div>
  );
}
