import { FormulaText } from "@/components/ui/FormulaText";

export function ScriptCaptionBar({ narration, onReplay }: { narration: string; onReplay?: () => void }) {
  return (
    <div className="mx-auto max-w-xl rounded-md bg-muted px-4 py-3 text-center">
      <p className="text-base leading-relaxed">
        <FormulaText text={narration} />
      </p>
      {onReplay && (
        <button
          onClick={onReplay}
          className="mt-2 text-xs text-muted-foreground underline hover:text-foreground"
        >
          🔊 Nochmal hören
        </button>
      )}
    </div>
  );
}
