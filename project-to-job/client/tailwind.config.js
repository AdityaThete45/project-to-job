/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // support class-based dark mode
  theme: {
    extend: {
      colors: {
        // Startup style palette (Linear/Stripe inspired)
        border: "rgba(var(--border-rgb), <alpha-value>)",
        background: "rgba(var(--background-rgb), <alpha-value>)",
        foreground: "rgba(var(--foreground-rgb), <alpha-value>)",
        primary: {
          DEFAULT: "#6366f1", // Indigo Accent
          dark: "#4f46e5",
          light: "#eef2ff",
        },
        darkBg: "#0B0F19",
        darkSurface: "#151B2C",
        darkBorder: "rgba(255, 255, 255, 0.08)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
