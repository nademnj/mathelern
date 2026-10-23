// Purely decorative: faint formulas, a unit circle and a right triangle with
// trig labels scattered behind every page -- "good vibes" ambiance the user
// asked for. Fixed, non-interactive, and low-opacity so it never competes
// with real content sitting on top of it.
export function MathBackground() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 h-full w-full"
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Unit circle, top right */}
      <g transform="translate(1320,160)" opacity="0.1" stroke="var(--primary)" fill="none" strokeWidth="2">
        <circle r="110" />
        <line x1="-130" y1="0" x2="130" y2="0" strokeDasharray="4 6" />
        <line x1="0" y1="-130" x2="0" y2="130" strokeDasharray="4 6" />
        <line x1="0" y1="0" x2="78" y2="-86" />
        <path d="M 40 0 A 40 40 0 0 0 28 -28" />
        <text x="50" y="-14" fontSize="22" stroke="none" fill="var(--primary)">θ</text>
        <text x="-20" y="-150" fontSize="26" stroke="none" fill="var(--primary)" fontStyle="italic">
          sin² θ + cos² θ = 1
        </text>
      </g>

      {/* Right triangle, bottom left, classic trig labels */}
      <g transform="translate(120,760)" opacity="0.1" stroke="var(--accent-foreground)" fill="none" strokeWidth="2">
        <path d="M 0 0 L 260 0 L 260 -170 Z" />
        <path d="M 230 0 L 230 -30 L 260 -30" />
        <text x="110" y="24" fontSize="22" stroke="none" fill="var(--accent-foreground)">
          Gegenkathete
        </text>
        <text x="270" y="-80" fontSize="22" stroke="none" fill="var(--accent-foreground)" transform="rotate(90 270 -80)">
          Ankathete
        </text>
        <text x="90" y="-100" fontSize="24" stroke="none" fill="var(--accent-foreground)" fontStyle="italic">
          tan α = a / b
        </text>
      </g>

      {/* Sine wave drifting across the middle */}
      <path
        d="M -50 520 Q 50 440 150 520 T 350 520 T 550 520 T 750 520 T 950 520 T 1150 520 T 1350 520 T 1650 520"
        opacity="0.08"
        stroke="var(--chart-2)"
        fill="none"
        strokeWidth="3"
      />

      {/* Parabola + coordinate axes, mid-left */}
      <g transform="translate(260,380)" opacity="0.09" stroke="var(--chart-4)" fill="none" strokeWidth="2">
        <line x1="-100" y1="0" x2="200" y2="0" />
        <line x1="0" y1="60" x2="0" y2="-180" />
        <path d="M -90 50 Q 50 -220 190 50" />
        <text x="30" y="-190" fontSize="24" stroke="none" fill="var(--chart-4)" fontStyle="italic">
          f(x) = x²
        </text>
      </g>

      {/* Scattered symbols for texture */}
      <text x="760" y="140" fontSize="70" opacity="0.07" fill="var(--secondary-foreground)" fontStyle="italic">
        π
      </text>
      <text x="1140" y="620" fontSize="60" opacity="0.07" fill="var(--primary)" fontStyle="italic">
        √
      </text>
      <text x="980" y="880" fontSize="46" opacity="0.08" fill="var(--accent-foreground)" fontStyle="italic">
        ∑
      </text>
      <text x="560" y="900" fontSize="50" opacity="0.07" fill="var(--chart-2)" fontStyle="italic">
        ∫ f(x)dx
      </text>
      <text x="40" y="200" fontSize="44" opacity="0.08" fill="var(--chart-4)" fontStyle="italic">
        a² + b² = c²
      </text>
    </svg>
  );
}
