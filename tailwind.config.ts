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
      },
      height: {
        "screen-nav": "calc(100vh - 128px)",
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
