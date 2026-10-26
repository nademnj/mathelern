import { Input } from "@/components/ui/input";
import { FormulaText } from "@/components/ui/FormulaText";
import { AnswerInputNumeric } from "./AnswerInputNumeric";
import { AnswerInputFraction } from "./AnswerInputFraction";

export interface AnswerDraft {
  value?: string;
  numerator?: string;
  denominator?: string;
}

export function ExerciseQuestion({
  prompt,
  format,
  draft,
  onChange,
  disabled,
}: {
  prompt: string;
  format: "numeric" | "fraction" | "text";
  draft: AnswerDraft;
  onChange: (draft: AnswerDraft) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-4 text-center">
      <p className="text-lg">
        <FormulaText text={prompt} />
      </p>
      {format === "numeric" && (
        <div className="flex justify-center">
          <AnswerInputNumeric
            value={draft.value ?? ""}
            onChange={(v) => onChange({ ...draft, value: v })}
            disabled={disabled}
          />
        </div>
      )}
      {format === "fraction" && (
        <div className="flex justify-center">
          <AnswerInputFraction
            numerator={draft.numerator ?? ""}
            denominator={draft.denominator ?? ""}
            onChangeNumerator={(v) => onChange({ ...draft, numerator: v })}
            onChangeDenominator={(v) => onChange({ ...draft, denominator: v })}
            disabled={disabled}
          />
        </div>
      )}
      {format === "text" && (
        <Input
          value={draft.value ?? ""}
          onChange={(e) => onChange({ ...draft, value: e.target.value })}
          disabled={disabled}
          className="mx-auto max-w-xs text-center"
          autoFocus
        />
      )}
    </div>
  );
}
