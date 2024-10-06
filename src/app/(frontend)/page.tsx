import { getServerAuthSession } from "@/server/auth";

import Content from "./_components/Content";

export default async function Home() {
  const session = await getServerAuthSession();
  if (!session) {
    return null;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex min-h-[40rem] w-screen flex-col items-center justify-center gap-10 bg-gradient-to-b from-amber-50 to-blue-50">
        <h1 className="font-playfair max-w-[40rem] text-center text-5xl font-extrabold italic tracking-wide sm:text-[5rem]">
          We&apos;re getting married!
        </h1>
        <p className="tracking-tight">Saturday, 16 August 2025</p>
      </div>
      <Content slug="home" />
    </div>
  );
}
