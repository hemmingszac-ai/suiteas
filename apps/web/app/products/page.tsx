"use client";

import { useEffect, useState } from "react";
import { ProductIcon } from "@/components/product-icon";
import { SiteHeader } from "@/components/site-header";
import { PRODUCTS, type Product } from "@/lib/products";

export default function ProductsPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>(PRODUCTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
    }, 200);

    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [query]);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-6 pb-24 pt-10 sm:pt-16">
        <h1 className="text-3xl font-semibold tracking-tight">Find a product</h1>
        <p className="mt-2 text-muted">
          Tell us what you&apos;re trying to get done and we&apos;ll match you to a tool in
          the bundle.
        </p>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`e.g. "track my team's tasks"`}
          className="mt-6 w-full rounded-xl border border-ink/10 bg-ink/[0.02] px-5 py-4 text-base outline-none transition focus:border-ink/25 focus:bg-paper"
        />

        <div
          className={`mt-8 grid gap-4 transition-opacity sm:grid-cols-2 ${loading ? "opacity-60" : "opacity-100"}`}
        >
          {results.map((p) => (
            <div key={p.id} className="flex gap-4 rounded-2xl border border-ink/10 p-5">
              <ProductIcon product={p} size={48} />
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="mt-1 text-sm text-muted">{p.description}</p>
                <p className="mt-2 text-xs font-medium uppercase tracking-wide text-accent">
                  {p.category}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
