import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterParentForm } from "@/components/auth/RegisterParentForm";

export default function RegisterParentPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Elternkonto erstellen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RegisterParentForm />
          <p className="text-center text-sm text-muted-foreground">
            Bereits ein Konto? <Link href="/login" className="underline">Anmelden</Link>
            <br />
            Du bist Schüler/in?{" "}
            <Link href="/register" className="underline">
              Hier registrieren
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
