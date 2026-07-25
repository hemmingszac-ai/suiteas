const LEAFLET_COUNT = 7;

/** A stylised silver fern frond, used inline as a small kiwiana flourish. */
export function Fern({ size = 16, className = "" }: { size?: number; className?: string }) {
  const leaflets = Array.from({ length: LEAFLET_COUNT });

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden
    >
      <line x1="14" y1="86" x2="86" y2="14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      {leaflets.map((_, i) => {
        const t = (i + 1) / (LEAFLET_COUNT + 1);
        const x = 14 + t * 72;
        const y = 86 - t * 72;
        const len = 12 + t * 14;
        return (
          <path
            key={i}
            d={`M ${x} ${y} q ${len * 0.55} ${-len * 0.1} ${len} ${-len}`}
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        );
      })}
    </svg>
  );
}
