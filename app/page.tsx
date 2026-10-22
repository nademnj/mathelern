import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 text-center dark:bg-black">
      <main className="flex max-w-xl flex-col items-center gap-6">
        <h1 className="text-4xl font-semibold tracking-tight">MatheLern</h1>
        <p className="text-lg text-muted-foreground">
          Mathe einfach erklärt, nach dem bayerischen LehrplanPLUS – von der 5.
          bis zur 13. Klasse. Kurze Lektionen, Übungen die mitwachsen, und ein
          Elternbereich mit echten Fortschritten.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" render={<Link href="/register">Als Schüler/in starten</Link>} />
          <Button
            variant="outline"
            size="lg"
            render={<Link href="/register/parent">Elternkonto erstellen</Link>}
          />
        </div>
        <Link href="/login" className="text-sm underline text-muted-foreground">
          Ich habe bereits ein Konto
        </Link>
      </main>
    </div>
  );
}
