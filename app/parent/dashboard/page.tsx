import { requireParent } from "@/lib/auth/roles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ParentDashboardPage() {
  const { profile } = await requireParent();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">Willkommen, {profile.display_name}!</h1>
      <Card>
        <CardHeader>
          <CardTitle>Deine Kinder</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Noch kein Kind verknüpft. Die Verknüpfung per Einladungscode folgt in
            einer späteren Ausbaustufe.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
