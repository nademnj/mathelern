export function MilestoneBadge({ title, achieved }: { title: string; achieved: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
        achieved ? "border-primary/40 bg-primary/5" : "border-border text-muted-foreground opacity-60"
      }`}
    >
      <span aria-hidden>{achieved ? "🏆" : "🔒"}</span>
      <span>{title}</span>
    </div>
  );
}
