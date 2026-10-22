import Link from "next/link";
import { requireStudent } from "@/lib/auth/roles";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { profile, student } = await requireStudent();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <Link href="/dashboard" className="font-semibold">
          MatheLern
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/dashboard">Übersicht</Link>
          <Link href="/progress">Fortschritt</Link>
          <span className="text-muted-foreground">
            {profile.display_name} · {student?.grade_level ?? "?"}. Klasse
          </span>
          <form action={logout}>
            <Button variant="outline" size="sm" type="submit">
              Abmelden
            </Button>
          </form>
        </nav>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
