"use client";

/**
 * The pool counter: the demo's money shot. Presentational for now; wire it to
 * Suite.poolBalance() (via wagmi useReadContract + watch) once the contract is
 * deployed and its address lands in packages/shared/addresses.json.
 */
export function PoolFigure({ usd }: { usd?: number }) {
  const value =
    usd === undefined
      ? "···"
      : usd.toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <div className="rounded-2xl border border-ink/10 bg-ink/[0.02] p-8 text-center">
      <p className="text-sm text-muted">In the pool right now</p>
      <p className="mt-2 font-mono text-5xl font-semibold tabular-nums">{value}</p>
      <p className="mt-2 text-xs text-muted">
        Your koha joins this and funds every product in the bundle.
      </p>
    </div>
  );
}
