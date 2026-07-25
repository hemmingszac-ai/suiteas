"use client";

import { useEffect, useState } from "react";
import { AwhinaSearch } from "@/components/awhina-search";
import { ProductIcon } from "@/components/product-icon";
import { SiteHeader } from "@/components/site-header";
import { NZ10_PRODUCTS, NZ500_PRODUCTS, type Product } from "@/lib/products";

function TierBadge({ tier }: { tier: Product["tier"] }) {
  return tier === "nz10" ? (
    <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
      Paid
    </span>
  ) : (
    <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
      Free · Koha
    </span>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-ink/10 p-5">
      <ProductIcon product={product} size={48} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold">{product.name}</p>
          <TierBadge tier={product.tier} />
        </div>
        <p className="mt-1 text-sm text-muted">{product.description}</p>
        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-muted/70">
          {product.category}
        </p>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim() === "") {
      setResults(null);
      return;
    }

    const controller = new AbortController();
    const debounce = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => setResults(data.results))
        .catch(() => {
          // aborted by the next keystroke, ignore
        })
        .finally(() => setLoading(false));
    }, 250);

    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [query]);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-6 pb-24 pt-10 sm:pt-16">
        <AwhinaSearch value={query} onChange={setQuery} />

        {results ? (
          <section
            className={`mt-16 transition-opacity ${loading ? "opacity-60" : "opacity-100"}`}
          >
            <h2 className="text-xl font-semibold tracking-tight">Results for &quot;{query}&quot;</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ) : (
          <>
            <section className="mt-16">
              <h2 className="text-xl font-semibold tracking-tight">The NZ10</h2>
              <p className="mt-1 text-sm text-muted">
                The 10 best SaaS products from Aotearoa right now.
              </p>
              <p className="mt-1 text-xs text-muted">
                Paid tier: a subscription from your wallet, gated by a soulbound pass that
                burns if payment lapses.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {NZ10_PRODUCTS.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>

            <section className="mt-16">
              <h2 className="text-xl font-semibold tracking-tight">The N&amp;Z500</h2>
              <p className="mt-1 text-sm text-muted">
                The top 500 SaaS products for you to try for free.
              </p>
              <p className="mt-1 text-xs text-muted">
                Free tier: runs on koha. Pay what you can, even $0, and you&apos;re in.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {NZ500_PRODUCTS.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <p className="mt-6 text-center text-xs text-muted">
                480+ more joining the koha pool every week.
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
