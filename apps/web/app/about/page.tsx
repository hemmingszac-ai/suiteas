import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

const STEPS = [
  {
    n: "01",
    title: "Pay what you can",
    body: "Contribute any amount as a koha, an x402 micropayment, even $0. Everyone gets the whole bundle.",
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
    body: "The access pass can lapse, but the giving record behind it can't. Your koha history is permanent and follows your wallet anywhere.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-10 sm:pt-16">
        <h1 className="text-3xl font-semibold tracking-tight">About Suite as</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Suite as is a collective SaaS bundle. Koha is the mechanism: pay what you can as a
          micropayment into a shared pool, and get every product in the bundle. What you pay
          is split on-chain between products by how much you actually use them. Member
          products pay each other on the same rail.
        </p>

        <section className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight">How it works</h2>
          <div className="relative mt-8 grid gap-8 sm:grid-cols-3">
            <div
              aria-hidden
              className="absolute left-0 right-0 top-5 hidden h-px bg-ink/10 sm:block"
            />
            {STEPS.map((s) => (
              <div key={s.n} className="relative space-y-3">
                <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-paper font-mono text-sm text-accent">
                  {s.n}
                </span>
                <h3 className="text-base font-medium">{s.title}</h3>
                <p className="text-sm text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight">Why koha</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="rounded-2xl border border-ink/10 bg-ink/[0.02] p-6">
                <h3 className="text-sm font-medium text-accent">{p.title}</h3>
                <p className="mt-2 text-sm text-muted">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-16 text-sm text-muted">
          Built for the Web3NZ hackathon on Avalanche Fuji testnet, no real funds.
        </p>
        <p className="mt-4 text-sm">
          <Link href="/" className="underline underline-offset-2 hover:text-accent">
            Back home
          </Link>
        </p>
      </main>
    </div>
  );
}
