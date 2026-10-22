import { Input } from "@/components/ui/input";

export function AnswerInputFraction({
  numerator,
  denominator,
  onChangeNumerator,
  onChangeDenominator,
  disabled,
}: {
  numerator: string;
  denominator: string;
  onChangeNumerator: (value: string) => void;
  onChangeDenominator: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Input
        type="number"
        inputMode="numeric"
        value={numerator}
        onChange={(e) => onChangeNumerator(e.target.value)}
        disabled={disabled}
        className="w-20 text-center"
        autoFocus
      />
      <div className="h-px w-20 bg-foreground" />
      <Input
        type="number"
        inputMode="numeric"
        value={denominator}
        onChange={(e) => onChangeDenominator(e.target.value)}
        disabled={disabled}
        className="w-20 text-center"
      />
    </div>
  );
}
