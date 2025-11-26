import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/layouts/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core SAYeTECH brand accents
        "brand-red": "#cc1934", // Splatter Movie Red
        "brand-green": "#6b7280", // Grey-500 (replacing lemon green)
        "brand-pink": "#eeb1ba", // Pink shade (RGB 238, 177, 186)
        "brand-white": "#ffffff",
      },
      fontFamily: {
        sans: [
          "Helvetica",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
