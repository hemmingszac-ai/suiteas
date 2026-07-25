import Link from "next/link";
import { Logo } from "./logo";
import { TopUpWalletButton } from "./top-up-wallet-button";

export function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-6xl items-start justify-between px-6 pt-8">
      <Link href="/" className="flex flex-col items-start gap-1.5">
        <Logo size={32} />
        <span className="text-sm font-semibold tracking-tight text-ink">Suite as</span>
      </Link>

      <nav className="flex flex-col items-end gap-3">
        <TopUpWalletButton />
        <div className="flex flex-col items-end gap-1 text-sm font-semibold text-ink">
          <Link href="/products" className="transition hover:text-accent">
            Find a product
          </Link>
          <Link href="/about" className="transition hover:text-accent">
            About
          </Link>
        </div>
      </nav>
    </header>
  );
}
