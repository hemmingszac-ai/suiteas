/**
 * Suiteas mark: a two-tone split circle sitting in a white disc.
 * The split reads as the pool being divided on-chain — the whole thesis in a glyph.
 * `size` is the diameter of the outer white disc in px.
 */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-paper ring-1 ring-ink/10"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viex/)x="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* dark half */}
        <path d="M12 2a10 10 0 0 0 0 20V2Z" fill="#0b0d12" />
        {/* accent half */}
        <path d="M12 2a10 10 0 0 1 0 20V2Z" fill="#e84142" />
        {/* seam */}
        <line x1="12" y1="2" x2="12" y2="22" stroke="#ffffff" strokeWidth="1.5" />
      </svg>
    </span>
  );
}
