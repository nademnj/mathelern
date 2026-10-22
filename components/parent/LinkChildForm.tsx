"use client";

import { useActionState } from "react";
import { linkChild } from "@/actions/parentLinks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormState = { error: string } | undefined;

export function LinkChildForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (_prev, formData) => (await linkChild(formData)) ?? undefined,
    undefined
  );

  return (
    <form action={formAction} className="space-y-2">
      <div className="flex items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor="inviteCode">Einladungscode</Label>
          <Input id="inviteCode" name="inviteCode" placeholder="z. B. 7K3QX9" className="w-40 font-mono uppercase" required />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Wird verknüpft…" : "Verknüpfen"}
        </Button>
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
