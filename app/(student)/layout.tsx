import Link from "next/link";
import { requireStudent } from "@/lib/auth/roles";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { ChatWidget } from "@/components/chat/ChatWidget";

const TRACK_LABEL: Record<string, string> = {
  gymnasium_g9: "Gymnasium",
  mittelschule_m: "Mittelschule M-Zug",
  fos: "FOS",
};

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { profile, student } = await requireStudent();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <Link href="/dashboard" className="font-semibold">
          MatheLern
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/dashboard">Lektionen</Link>
          <Link href="/progress">Fortschritt</Link>
          <span className="text-muted-foreground">
            {profile.display_name} · {student?.grade_level ?? "?"}. Klasse (
            {TRACK_LABEL[student?.school_track ?? ""] ?? student?.school_track})
          </span>
          <form action={logout}>
            <Button variant="outline" size="sm" type="submit">
              Abmelden
            </Button>
          </form>
        </nav>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
      <ChatWidget />
    </div>
  );
}
