import Link from "next/link";
import { ConnectWalletButton } from "./connect-wallet-button";
import { Logo } from "./logo";
import { isEnabled } from "@/lib/config/features";

const NAV = [
  { label: "How it works", href: "#how" },
  { label: "Products", href: "#products" },
  { label: "About", href: "#about" },
  { label: "Docs", href: "#docs" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink/5 bg-paper/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="text-base font-semibold tracking-tight text-ink">Suiteas</span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-sm text-muted transition hover:text-ink"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {isEnabled("login") ? (
          <ConnectWalletButton />
        ) : (
          <span className="rounded-full border border-ink/15 px-5 py-2 text-sm font-medium text-muted">
            Connect Wallet
          </span>
        )}
      </nav>
    </header>
  );
}
