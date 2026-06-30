import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rapid: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#b9dffd",
          300: "#7cc5fc",
          400: "#36a6f8",
          500: "#0c8ae9",
          600: "#006dc7",
          700: "#0157a1",
          800: "#064a85",
          900: "#0b3d6e",
          950: "#072749",
        },
        steel: {
          100: "#e8eaed",
          200: "#c5cad1",
          300: "#9aa3ae",
          400: "#6b7785",
          500: "#4f5b68",
          600: "#3d4752",
          700: "#333b44",
          800: "#2c333a",
          900: "#272c32",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
