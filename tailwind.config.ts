import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#f1ede1",
        panel: "#ffffff",
        panel2: "#e9e4d6",
        ink: "#1a1816",
        muted: "#6b6558",
        hairline: "#e2dcc9",
        accent: "#1a1816",
        "accent-dark": "#000000",
        coral: "#f2704a",
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
        serif: ["var(--font-serif)", "Georgia", "Cambria", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
