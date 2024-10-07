import { getServerAuthSession } from "@/server/auth";

import Content from "./_components/Content";
import moment from "moment";

export default async function Home() {
  const session = await getServerAuthSession();
  if (!session) {
    return null;
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex min-h-[40rem] w-full flex-col items-center justify-center 
             gap-10 bg-[url('/hero_image.jpg')] bg-cover
             bg-center bg-blend-overlay"
      >
        <div
          className="z-5 absolute inset-0 bg-gradient-to-b from-amber-200/50 to-blue-200/50"
          aria-hidden="true"
        ></div>
        <h1 className="relative z-10 max-w-[40rem] text-center font-playfair text-5xl font-extrabold italic tracking-wide sm:text-[5rem]">
          We&apos;re getting married!
        </h1>
        <p className="relative z-10 tracking-tight">
          {moment(process.env.NEXT_PUBLIC_WEDDING_DATE ?? "2000-01-01").format(
            "dddd, D MMMM YYYY",
          )}
        </p>
      </div>
      <Content slug="home" />
    </div>
  );
}
