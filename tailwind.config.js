/** @type {import('tailwindcss').Config} */
// Earthy farm palette: forest green + clay/terracotta accent + warm sand
// surfaces. High-contrast for outdoor/sunlight readability.
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Forest green (primary)
        forest: {
          50: "#EBF3EC",
          100: "#CFE2D1",
          200: "#A3C7A7",
          300: "#73A879",
          400: "#4C8C54",
          500: "#2F6B3C",
          600: "#255A31",
          700: "#1C4726",
          800: "#13311A",
          900: "#0A1E10",
        },
        // Clay / terracotta (accent)
        clay: {
          50: "#FBEFE9",
          100: "#F4D6C7",
          200: "#E8B49B",
          300: "#DB9170",
          400: "#CF7650",
          500: "#C2683B",
          600: "#A2522D",
          700: "#7C3E22",
          800: "#552A17",
          900: "#2F170C",
        },
        // Warm sand surfaces
        sand: {
          50: "#FAF7F0",
          100: "#F4EEE1",
          200: "#EBE1CC",
          300: "#DDCFB0",
          400: "#C9B68C",
          500: "#B49C6B",
        },
        primary: {
          50: "#EBF3EC",
          100: "#CFE2D1",
          500: "#2F6B3C",
          600: "#255A31",
          700: "#1C4726",
          900: "#0A1E10",
        },
        secondary: {
          500: "#C2683B",
          600: "#A2522D",
        },
        background: "#FAF7F0",
        surface: "#ffffff",
        text: "#1A2620",
        textMuted: "#5C6B61",
        border: "#EBE1CC",
      },
    },
  },
  plugins: [],
};
