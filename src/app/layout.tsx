import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";

import { TRPCReactProvider } from "@/trpc/react";
import LoginHandler from "./loginHandler";
import { Suspense } from "react";

export const metadata = {
  title: "Thomas & Sarah Wedding",
  description: "Thomas and Sarah's wedding website",
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
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Suspense>
          <LoginHandler />
        </Suspense>
      </body>
    </html>
  );
}
