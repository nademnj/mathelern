import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterStudentForm } from "@/components/auth/RegisterStudentForm";

export default function RegisterStudentPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Schülerkonto erstellen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RegisterStudentForm />
          <p className="text-center text-sm text-muted-foreground">
            Bereits ein Konto? <Link href="/login" className="underline">Anmelden</Link>
            <br />
            Du bist ein Elternteil?{" "}
            <Link href="/register/parent" className="underline">
              Hier registrieren
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
