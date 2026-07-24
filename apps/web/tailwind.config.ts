import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Clean, confident — Stripe/Linear, not crypto-garish.
        ink: "#0b0d12",
        paper: "#ffffff",
        muted: "#6b7280",
        accent: "#e84142", // Avalanche red, used sparingly
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
