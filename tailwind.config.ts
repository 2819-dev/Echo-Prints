import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        panel: "#ffffff",
        panel2: "#f3f0ff",
        ink: "#181225",
        muted: "#6b6478",
        hairline: "#e3ddf7",
        accent: "#7c3aed",
        "accent-dark": "#5b21b6",
        pop: "#ec4899",
        sun: "#f59e0b",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        display: ["var(--font-display)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
