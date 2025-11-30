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
        "brand-green": "#238405", // SAYeTECH primary green
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
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 150ms ease-out",
        "fade-in-up": "fade-in-up 180ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
