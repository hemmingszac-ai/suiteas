/**
 * Suite as mark: two pillars crossed by a bar, the right half of the bar in
 * accent red. Best-effort recreation from the provided reference image — swap
 * this for the real asset (e.g. drop a favicon-64.png in apps/web/public and
 * point this at it) once the source file is available.
 */
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="10" y="1.5" width="4" height="21" fill="#0b0d12" />
      <rect x="1.5" y="10" width="10.5" height="4" fill="#0b0d12" />
      <rect x="12" y="10" width="10.5" height="4" fill="#e84142" />
    </svg>
  );
}
