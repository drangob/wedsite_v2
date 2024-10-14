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
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            primary: {
              foreground: "#FFF",
              50: "#ecfdf5",
              100: "#d1fae5",
              200: "#a7f3d0",
              300: "#6ee7b7",
              400: "#34d399",
              500: "#10b981",
              600: "#059669",
              700: "#047857",
              800: "#065f46",
              900: "#064e3b",
              DEFAULT: "#065F46",
            },
          },
        },
      },
    }),
  ],
}) satisfies Config;
