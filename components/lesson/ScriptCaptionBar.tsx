export function ScriptCaptionBar({ narration }: { narration: string }) {
  return (
    <p className="mx-auto max-w-xl rounded-md bg-muted px-4 py-3 text-center text-base leading-relaxed">
      {narration}
    </p>
  );
}
