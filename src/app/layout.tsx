import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";

import { Analytics } from "@vercel/analytics/react";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: process.env.NEXT_PUBLIC_SITE_NAME ?? "Wedding",
  description:
    `${process.env.NEXT_PUBLIC_SITE_NAME} website` || "Wedding website",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <Analytics />
        <Toaster />
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
