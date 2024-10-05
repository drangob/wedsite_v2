import { type ReactNode } from "react";
import Navigation from "./navigation";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <header>
        <Navigation />
      </header>
      <main>{children}</main>
    </div>
  );
};

export default RootLayout;
