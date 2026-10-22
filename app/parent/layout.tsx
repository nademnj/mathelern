import Link from "next/link";
import { requireParent } from "@/lib/auth/roles";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireParent();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <Link href="/parent/dashboard" className="font-semibold">
          MatheLern · Eltern
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">{profile.display_name}</span>
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
