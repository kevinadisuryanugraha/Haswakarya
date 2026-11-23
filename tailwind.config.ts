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
        // Direct reference SOE color tokens
        primary: {
          DEFAULT: "#407997", // Maritime Steel Blue
          dark: "#002057",
        },
        "primary-dark": "#002057",
        navy: {
          DEFAULT: "#06122A", // Deep Oceanic Navy
          50: "#f0f4f8",
          100: "#d9e2ec",
          200: "#bcccdc",
          300: "#9fb3c8",
          400: "#829ab1",
          500: "#627d98",
          600: "#486581",
          700: "#334e68",
          800: "#1e3a5f",
          900: "#0b1b3d",
          950: "#060f22",
        },
        ice: "#DCEDF3", // Light Ice Blue (matches logo emblem)
        sky: "#BEDDEE", // Soft Sky Blue
        accent: "#E4572E", // Dynamic Coral Orange
        surface: "#F8F9FA", // Light Neutral Surface
        "border-light": "#EBEDF2", // Clean Border Divider
        muted: "#616161", // Muted Gray for secondary labels

        // Maritime-prefixed aliases for interoperability
        maritime: {
          DEFAULT: "#407997",
          primary: "#407997",
          dark: "#002057",
          navy: "#06122A",
          ice: "#DCEDF3",
          sky: "#BEDDEE",
          accent: "#E4572E",
          surface: "#F8F9FA",
          border: "#EBEDF2",
          muted: "#616161",
          light: "#EBF3FA",
        },
        "maritime-primary": "#407997",
        "maritime-dark": "#002057",
        "maritime-navy": "#06122A",
        "maritime-ice": "#DCEDF3",
        "maritime-sky": "#BEDDEE",
        "maritime-accent": "#E4572E",
        "maritime-surface": "#F8F9FA",
        "maritime-border": "#EBEDF2",
        "maritime-muted": "#616161",
      },
      fontFamily: {
        sans: ["Roboto", "Plus Jakarta Sans", "sans-serif"],
        heading: ["Roboto", "sans-serif"],
      },
      keyframes: {
        "logo-marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        highlightProgress: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
      },
      animation: {
        marquee: "logo-marquee 25s linear infinite",
        "marquee-slow": "logo-marquee 40s linear infinite",
        "marquee-fast": "logo-marquee 15s linear infinite",
        "highlight-progress": "highlightProgress var(--highlight-duration, 10000ms) linear forwards",
      },
    },
  },
  plugins: [],
};

export default config;
