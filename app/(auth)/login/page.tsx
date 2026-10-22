import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Anmelden</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm />
          <p className="text-center text-sm text-muted-foreground">
            Noch kein Konto?{" "}
            <Link href="/register" className="underline">
              Als Schüler registrieren
            </Link>{" "}
            oder{" "}
            <Link href="/register/parent" className="underline">
              als Elternteil
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
