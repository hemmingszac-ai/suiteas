"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useVoiceToText } from "@/hooks/use-voice-to-text";

const EXAMPLES = [
  `Say what you need, e.g. "easy document management"`,
  `"I need a notetaking app with Claude built in"`,
  "Say what you need, let Awhina find it for you.",
];

export function AwhinaSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [exampleIndex, setExampleIndex] = useState(0);
  const { listening, supported, toggle } = useVoiceToText(onChange);

  useEffect(() => {
    const id = setInterval(() => setExampleIndex((i) => (i + 1) % EXAMPLES.length), 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-2xl font-semibold tracking-tight">Awhina</h2>
      <p className="mt-1 text-sm text-muted">Your guide to every tool in the bundle.</p>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="mt-6 flex items-center gap-2 rounded-full border border-ink/10 bg-ink/[0.02] p-2 pl-3 transition focus-within:border-ink/25 focus-within:bg-paper"
      >
        <button
          type="button"
          onClick={toggle}
          disabled={!supported}
          aria-label={listening ? "Stop voice input" : "Speak your request"}
          title={supported ? "Voice input" : "Voice input not supported in this browser"}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition disabled:opacity-30 ${
            listening ? "bg-accent text-white" : "bg-ink/5 text-ink hover:bg-ink/10"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor" />
            <path
              d="M5 11a7 7 0 0 0 14 0M12 18v4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </button>

        <div className="relative min-w-0 flex-1 text-left">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Tell Awhina what you need"
            className="w-full bg-transparent py-2 text-base outline-none"
          />
          {value === "" && (
            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={exampleIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.4 }}
                  className="truncate text-base text-muted/70"
                >
                  {EXAMPLES[exampleIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-ink/90"
        >
          Ask Awhina
        </button>
      </form>
    </div>
  );
}
