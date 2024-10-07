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
  plugins: [nextui()],
}) satisfies Config;
