import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Suiteas brand — warm paper, near-black ink, "kaha" red. Shared by the
        // inline-styled landing and every Tailwind component (dashboard etc.).
        ink: "#201e1d",
        paper: "#f3f2f2",
        muted: "#5c5854",
        accent: "#ec3013", // kaha red — alias kept so existing text-accent works
        kaha: "#ec3013",
        kaha100: "#fde8e3",
        kaha300: "#f5a08c",
        kaha700: "#a1200d",
        n200: "#e5e3e1",
        n400: "#a8a4a0",
        n500: "#7d7975",
        n600: "#5c5854",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
