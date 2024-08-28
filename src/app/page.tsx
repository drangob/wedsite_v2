import { getServerAuthSession } from "@/server/auth";
import UserPicker from "./_components/UserPicker";
import UserLogout from "./_components/UserLogout";
import ContentCard from "./_components/ContentCard";

export default async function Home() {
  const session = await getServerAuthSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#fef8ff] to-[#e0b2ff] text-black">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Thomas & <span className="text-[hsl(280,100%,70%)]">Sarah</span>
          &apos;s Wedding
        </h1>
        <p className="max-w-lg text-center text-xl">
          Welcome to our wedding website! We&apos;re so excited to celebrate
          with you all.
        </p>
        <ContentCard slug="home" className="w-1/2" />
        {session ? (
          <div className="flex items-center gap-1">
            <p>Welcome {session.user?.name}!</p>
            <UserLogout />
          </div>
        ) : (
          <div>
            <p>Before you have a look around, who are you?</p>
            <UserPicker />
          </div>
        )}
      </div>
    </main>
  );
}
