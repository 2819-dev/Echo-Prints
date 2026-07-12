import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0d13",
        panel: "#141922",
        panel2: "#1b2230",
        accent: "#2f8ff0",
        "accent-dark": "#1c6fd0",
      },
      fontFamily: {
        display: ["var(--font-display)"],
      },
    },
  },
  plugins: [],
};

export default config;
