import Link from "next/link";
import { LoginButton } from "@/components/login-button";
import { SiteHeader } from "@/components/site-header";
import { isEnabled } from "@/lib/config/features";

const STEPS = [
  {
    n: "01",
    title: "Pay what you can",
    body: "Contribute any amount as an x402 micropayment — even $0. Everyone gets the whole bundle.",
  },
  {
    n: "02",
    title: "Split on-chain by usage",
    body: "A contract meters how much each product is used and divides the pool between members automatically.",
  },
  {
    n: "03",
    title: "Settle on Avalanche",
    body: "Payments clear in about a second on Fuji. One wallet, one identity, no personal details handed over.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-6">
        {/* Hero */}
        <section className="flex flex-col items-start gap-6 py-24 sm:py-32">
          <p className="text-sm font-medium uppercase tracking-wide text-accent">Suiteas</p>
          <h1 className="max-w-3xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
            Pay what you can.
            <br />
            Even&nbsp;$0.
          </h1>
          <p className="max-w-xl text-lg text-muted">
            One subscription, every tool. Contribute whatever you like into a shared pool
            and get the whole bundle. What you pay is split on-chain between products by how
            much you actually use them.
          </p>

          {isEnabled("login") ? (
            <LoginButton />
          ) : (
            <p className="text-sm text-muted">Login is currently disabled.</p>
          )}

          {/* Animation slot — a live pool / money-flow visual lands here later. */}
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 border-t border-ink/5 py-20">
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="space-y-3">
                <span className="text-sm font-mono text-accent">{s.n}</span>
                <h3 className="text-lg font-medium">{s.title}</h3>
                <p className="text-sm text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Products */}
        <section id="products" className="scroll-mt-20 border-t border-ink/5 py-20">
          <h2 className="text-2xl font-semibold tracking-tight">Products in the bundle</h2>
          <p className="mt-3 max-w-xl text-muted">
            Member products share the pool and pay each other on the same rail. The lineup is
            still coming together.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex h-28 items-center justify-center rounded-xl border border-dashed border-ink/10 text-sm text-muted"
              >
                Coming soon
              </div>
            ))}
          </div>
        </section>

        {/* About */}
        <section id="about" className="scroll-mt-20 border-t border-ink/5 py-20">
          <h2 className="text-2xl font-semibold tracking-tight">Why koha</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Koha is the mechanism: pay-what-you-can micropayments that keep working even at
            zero. Zero-payers still get access — that&apos;s the thesis, not an edge case. Your
            giving record is permanent and portable, so it follows you wherever you go.
          </p>
        </section>

        {/* Docs */}
        <section id="docs" className="scroll-mt-20 border-t border-ink/5 py-20">
          <h2 className="text-2xl font-semibold tracking-tight">Docs</h2>
          <p className="mt-3 max-w-xl text-muted">
            Built for the Web3NZ hackathon on Avalanche Fuji testnet — no real funds.
          </p>
          <p className="mt-4 text-sm text-muted">
            <Link href="/dashboard" className="underline underline-offset-2 hover:text-ink">
              Open the dashboard
            </Link>
          </p>
        </section>
      </main>

      <footer className="border-t border-ink/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-xs text-muted">
          <span>Suiteas</span>
          <span>Avalanche Fuji testnet · no real funds</span>
        </div>
      </footer>
    </div>
  );
}
