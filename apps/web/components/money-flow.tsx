const PRODUCTS = [
  { label: "Product A", y: 24 },
  { label: "Product B", y: 88 },
  { label: "Product C", y: 152 },
  { label: "Product D", y: 216 },
];

/**
 * The pool-split visual — one koha in, divided on-chain across member
 * products by usage. This is the thesis rendered as a diagram.
 */
export function MoneyFlow() {
  return (
    <svg
      viewBox="0 0 420 240"
      fill="none"
      className="h-auto w-full max-w-md"
      role="img"
      aria-label="A koha payment flows into the pool and splits between member products"
    >
      {/* source */}
      <g>
        <circle cx="34" cy="120" r="22" fill="#0b0d12" />
        <text x="34" y="124" textAnchor="middle" fontSize="10" fill="#ffffff" fontFamily="ui-monospace, monospace">
          koha
        </text>
      </g>

      {/* pool */}
      <g>
        <circle cx="190" cy="120" r="30" fill="#e84142" />
        <text x="190" y="116" textAnchor="middle" fontSize="9" fill="#ffffff" fontFamily="ui-monospace, monospace">
          pool
        </text>
        <text x="190" y="128" textAnchor="middle" fontSize="7" fill="#ffffff" opacity="0.85" fontFamily="ui-monospace, monospace">
          on-chain
        </text>
      </g>

      {/* source -> pool */}
      <path
        d="M56 120 H160"
        stroke="#0b0d12"
        strokeOpacity="0.25"
        strokeWidth="2"
        strokeDasharray="4 4"
        className="animate-flow"
      />

      {/* pool -> products */}
      {PRODUCTS.map((p) => (
        <g key={p.label}>
          <path
            d={`M218 120 C 260 120, 260 ${p.y}, 300 ${p.y}`}
            stroke="#0b0d12"
            strokeOpacity="0.18"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="animate-flow"
          />
          <rect x="300" y={p.y - 12} width="96" height="24" rx="12" fill="#ffffff" stroke="#0b0d12" strokeOpacity="0.1" />
          <text
            x="348"
            y={p.y + 4}
            textAnchor="middle"
            fontSize="9"
            fill="#0b0d12"
            fontFamily="ui-monospace, monospace"
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
