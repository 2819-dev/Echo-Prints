import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        panel: "#ffffff",
        panel2: "#f4f6f9",
        accent: "#2f8ff0",
        "accent-dark": "#1c6fd0",
      },
    },
  },
  plugins: [],
};

export default config;
