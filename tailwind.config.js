/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0F172A",
        navy: {
          DEFAULT: "#0D1B2E",
          light: "#162032",
        },
        accent: "#F59E0B",
        gold: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
          lighter: "#FDE68A",
          dark: "#B45309",
        },
        surface: "#F2F0EB",
        panel: "#F8F7F2",
        edge: {
          DEFAULT: "#E8E5DC",
          dark: "#D4D0C8",
        },
        hint: "#9CA3AF",
        muted: "#6B7280",
        wholesaleBg: "#F8FAFC",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
