import { getServerAuthSession } from "@/server/auth";

export default async function Home() {
  const session = await getServerAuthSession();
  if (!session) {
    return null;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex min-h-[40rem] w-screen flex-col items-center justify-center gap-10 bg-gradient-to-b from-amber-50 to-blue-50">
        <h1 className="font-playfair max-w-[40rem] text-center text-5xl font-extrabold italic tracking-wide sm:text-[5rem]">
          We're getting married!
        </h1>
        <p className="tracking-tight">Saturday, 16 August 2025</p>
      </div>
      <div className="w-full max-w-screen-lg px-4 py-8">
        <h1 className="bold text-2xl underline">Hi!</h1>
        <p>Content goes here - maybe with an image on the right hand side</p>
      </div>
    </div>
  );
}
