import Link from "next/link";
import { LoginButton } from "@/components/login-button";
import { LivePoolFigure } from "@/components/live-pool-figure";
import { MoneyFlow } from "@/components/money-flow";
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

const PRINCIPLES = [
  {
    title: "Zero still counts",
    body: "Pay-what-you-can means $0 is a valid contribution, not an edge case. Zero-payers get the same access as everyone else.",
  },
  {
    title: "Your record never burns",
    body: "The access pass can lapse — the giving record behind it can't. Your koha history is permanent and follows your wallet anywhere.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-6">
        {/* Hero */}
        <section className="grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-ink/[0.03] px-3 py-1 text-xs font-medium text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Avalanche Fuji · x402 micropayments
            </span>

            <h1 className="max-w-xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Pay what you can.
              <br />
              Even&nbsp;$0.
            </h1>

            <p className="max-w-lg text-lg text-muted">
              One subscription, every tool. Contribute whatever you like into a shared pool
              and get the whole bundle. What you pay is split on-chain between products by
              how much you actually use them.
            </p>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              {isEnabled("login") ? (
                <LoginButton />
              ) : (
                <p className="text-sm text-muted">Login is currently disabled.</p>
              )}
              <Link
                href="#how"
                className="text-sm font-medium text-muted underline underline-offset-4 transition hover:text-ink"
              >
                See how it works
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <MoneyFlow />
          </div>
        </section>

        {/* Live pool — the demo's money shot, up front. */}
        <section className="border-t border-ink/5 py-16">
          <LivePoolFigure />
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 border-t border-ink/5 py-20">
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
          <div className="relative mt-12 grid gap-10 sm:grid-cols-3">
            <div
              aria-hidden
              className="absolute left-0 right-0 top-5 hidden h-px bg-ink/10 sm:block"
            />
            {STEPS.map((s) => (
              <div key={s.n} className="relative space-y-3">
                <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-paper font-mono text-sm text-accent">
                  {s.n}
                </span>
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
                className="flex h-28 items-center justify-center rounded-xl border border-dashed border-ink/10 text-sm text-muted transition hover:border-ink/20 hover:bg-ink/[0.02]"
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
            zero. Your giving record is permanent and portable, so it follows you wherever
            you go.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="rounded-2xl border border-ink/10 bg-ink/[0.02] p-6">
                <h3 className="text-sm font-medium text-accent">{p.title}</h3>
                <p className="mt-2 text-sm text-muted">{p.body}</p>
              </div>
            ))}
          </div>
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
