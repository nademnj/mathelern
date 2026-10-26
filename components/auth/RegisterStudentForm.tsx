"use client";

import { useState } from "react";
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
import type { SchoolTrack } from "@/lib/types/db";

type FormState = { error: string } | undefined;

const TRACK_LABEL: Record<SchoolTrack, string> = {
  realschule: "Realschule",
  mittelschule_m: "Mittelschule (M-Zug)",
  fos: "Fachoberschule (FOS)",
};

interface RegisterStudentFormProps {
  gradesByTrack: Record<SchoolTrack, { gradeNumber: number; label: string }[]>;
}

export function RegisterStudentForm({ gradesByTrack }: RegisterStudentFormProps) {
  const tracks = Object.keys(gradesByTrack) as SchoolTrack[];
  const [schoolTrack, setSchoolTrack] = useState<SchoolTrack>(tracks[0] ?? "realschule");
  const grades = gradesByTrack[schoolTrack] ?? [];
  const gradeLabelByNumber = new Map(grades.map((g) => [String(g.gradeNumber), g.label]));

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
        <Label htmlFor="schoolTrack">Schulart</Label>
        <Select
          name="schoolTrack"
          value={schoolTrack}
          onValueChange={(v) => setSchoolTrack(v as SchoolTrack)}
        >
          <SelectTrigger id="schoolTrack" className="w-full">
            <SelectValue placeholder="Schulart wählen">
              {(value: SchoolTrack) => TRACK_LABEL[value] ?? value}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {tracks.map((t) => (
              <SelectItem key={t} value={t}>
                {TRACK_LABEL[t] ?? t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="gradeLevel">Klasse</Label>
        <Select
          name="gradeLevel"
          defaultValue={grades[0] ? String(grades[0].gradeNumber) : undefined}
          key={schoolTrack}
        >
          <SelectTrigger id="gradeLevel" className="w-full">
            <SelectValue placeholder="Klasse wählen">
              {(value: string) => gradeLabelByNumber.get(value) ?? value}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {grades.map((g) => (
              <SelectItem key={g.gradeNumber} value={String(g.gradeNumber)}>
                {g.label}
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
