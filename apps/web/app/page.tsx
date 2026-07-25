import { Fern } from "@/components/fern";
import { SiteHeader } from "@/components/site-header";
import { ToolCircle } from "@/components/tool-circle";

export default function Home() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-16">
        <ToolCircle />

        <p className="mx-auto mt-16 max-w-md text-center text-base text-muted">
          Get all the tools you need, enter your card details only once, support
          Kiwi SaaS startups.{" "}
          <Fern size={24} className="inline-block -translate-y-1 text-ink/70" />
        </p>
      </main>
    </div>
  );
}
