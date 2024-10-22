import { type ReactNode } from "react";
import Navigation from "./navigation";
import { api } from "@/trpc/server";

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const content = await api.content.getAllContentInfo();
  const extraLinks = (content?.filter((c) => !c.protected) ?? []).map((c) => ({
    label: c.title,
    href: `/${c.slug}`,
  }));

  return (
    <div>
      <header className="sticky top-0 z-50 bg-ivory-300">
        <Navigation dynamicEntries={extraLinks} />
      </header>
      <main>{children}</main>
    </div>
  );
};

export default RootLayout;
