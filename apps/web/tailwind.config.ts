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
        "accent-soft": "#fdeceb",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgb(11 13 18 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgb(11 13 18 / 0.04) 1px, transparent 1px)",
      },
      keyframes: {
        flow: {
          "0%": { strokeDashoffset: "24" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        flow: "flow 1s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
