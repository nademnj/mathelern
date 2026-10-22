import { Input } from "@/components/ui/input";

export function AnswerInputNumeric({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <Input
      type="number"
      inputMode="decimal"
      step="any"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder="Antwort"
      className="max-w-[200px] text-center text-lg"
      autoFocus
    />
  );
}
