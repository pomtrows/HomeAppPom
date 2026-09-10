import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0d1117",
        surface: "#161b22",
        "surface-2": "#1c2230",
        line: "rgba(255,255,255,0.07)",
        fg: "#e6edf3",
        muted: "#7d8590",
        faint: "#404853",
        accent: "#58a6ff",
        "accent-dim": "rgba(88,166,255,0.12)",
        good: "#3fb950",
        bad: "#f85149",
        warn: "#d29922",
        snow: "#a5c8e8",
      },
      borderRadius: {
        card: "18px",
        card2: "12px",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-dm-serif)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
