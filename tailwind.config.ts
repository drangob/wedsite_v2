import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import { nextui } from "@nextui-org/react";
import { withUt } from "uploadthing/tw";

export default withUt({
  content: [
    "./src/**/*.tsx",
    // Add Next UI theme files to the content array
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
        playfair: ["var(--font-playfair)", ...fontFamily.serif],
        lora: ["var(--font-lora)", ...fontFamily.serif],
      },
      height: {
        "screen-nav": "calc(100vh - 128px)",
      },
      fontSize: {
        "cke-xs": "0.75rem",
        "cke-sm": "0.875rem",
        "cke-base": "1rem",
        "cke-lg": "1.125rem",
        "cke-xl": "1.25rem",
        "cke-2xl": "1.5rem",
        "cke-3xl": "1.875rem",
        "cke-4xl": "2.25rem",
        "cke-5xl": "3rem",
        "cke-6xl": "3.75rem",
        "cke-7xl": "4.5rem",
        "cke-8xl": "6rem",
        "cke-9xl": "8rem",
      },
      colors: {
        ivory: {
          foreground: "#000",
          50: "#fdfcfc",
          100: "#fbfaf9",
          200: "#f7f6f4",
          300: "#f3f2ef",
          400: "#eeecea",
          500: "#e9e7e3",
          600: "#d8d5cf",
          700: "#c7c3bb",
          800: "#b6b1a7",
          900: "#a59f93",
          DEFAULT: "#e9e7e3",
        },
        blush: {
          foreground: "#000",
          50: "#fdf9f8",
          100: "#fbf3f1",
          200: "#f7e7e3",
          300: "#f3dbd5",
          400: "#efd4cc",
          500: "#eccdc3",
          600: "#e4b7aa",
          700: "#dca191",
          800: "#d48b78",
          900: "#cb755f",
          DEFAULT: "#eccdc3",
        },
        coffee: {
          foreground: "#FFF",
          50: "#faf7f5",
          100: "#f5efeb",
          200: "#ecdfd7",
          300: "#e3cfc3",
          400: "#dac0af",
          500: "#d7b09e",
          600: "#cc9d86",
          700: "#c18a6e",
          800: "#b67756",
          900: "#a6663f",
          DEFAULT: "#d7b09e",
        },
        sage: {
          foreground: "#FFF",
          50: "#f4f6f6",
          100: "#e9eded",
          200: "#d3dbda",
          300: "#bdc9c7",
          400: "#a7b7b4",
          500: "#91a5a1",
          600: "#7b938f",
          700: "#778e8a",
          800: "#728985",
          900: "#6b837e",
          DEFAULT: "#91a5a1",
        },
        forest: {
          foreground: "#FFF",
          50: "#e6f0f1",
          100: "#cee1e3",
          200: "#a1c3c7",
          300: "#74a5ab",
          400: "#47878f",
          500: "#356468",
          600: "#2d5457",
          700: "#254446",
          800: "#1d3335",
          900: "#204045",
          DEFAULT: "#356468",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            // forest color palette
            primary: {
              50: "#e6f0f1",
              100: "#cee1e3",
              200: "#a1c3c7",
              300: "#74a5ab",
              400: "#47878f",
              500: "#356468",
              600: "#2d5457",
              700: "#254446",
              800: "#1d3335",
              900: "#204045",
              DEFAULT: "#356468",
            },
          },
        },
      },
    }),
  ],
}) satisfies Config;
