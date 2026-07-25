import { PRODUCTS } from "@/lib/products";
import { ProductIcon } from "./product-icon";

/** The hero visual: every member product ringed around the pitch. */
export function ToolCircle() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-lg">
      {PRODUCTS.map((p, i) => {
        const angle = (i / PRODUCTS.length) * 2 * Math.PI - Math.PI / 2;
        const x = 50 + 44 * Math.cos(angle);
        const y = 50 + 44 * Math.sin(angle);
        return (
          <div
            key={p.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <ProductIcon product={p} size={52} />
          </div>
        );
      })}

      <div className="absolute inset-0 flex flex-col items-center justify-center px-12 text-center">
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          All of your tools,
          <br />
          paid by <span className="text-accent">Koha</span>.
        </h1>
        <p className="mt-3 text-sm text-muted">Safe, secure, flexible.</p>
      </div>
    </div>
  );
}
