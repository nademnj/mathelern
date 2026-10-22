"use client";

import { useActionState } from "react";
import { registerStudent } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormState = { error: string } | undefined;

const GRADES = Array.from({ length: 9 }, (_, i) => i + 5); // 5..13

export function RegisterStudentForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (_prev, formData) => (await registerStudent(formData)) ?? undefined,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">Name</Label>
        <Input id="displayName" name="displayName" required autoComplete="name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="gradeLevel">Klasse</Label>
        <Select name="gradeLevel" defaultValue="5">
          <SelectTrigger id="gradeLevel" className="w-full">
            <SelectValue placeholder="Klasse wählen" />
          </SelectTrigger>
          <SelectContent>
            {GRADES.map((g) => (
              <SelectItem key={g} value={String(g)}>
                {g}. Klasse
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-Mail</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Passwort</Label>
        <Input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Wird erstellt…" : "Konto erstellen"}
      </Button>
    </form>
  );
}
