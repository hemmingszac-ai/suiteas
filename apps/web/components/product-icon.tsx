import type { Product } from "@/lib/products";

export function ProductIcon({ product, size = 56 }: { product: Product; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
      style={{ width: size, height: size, backgroundColor: product.color, fontSize: size * 0.42 }}
      aria-hidden
    >
      {product.glyph}
    </div>
  );
}
