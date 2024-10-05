import { getServerAuthSession } from "@/server/auth";
import GuestPicker from "../_components/GuestPicker";
import { type NextPage } from "next";

function getQueryParams(partialUrl: string): Record<string, string> {
  // Construct a full URL by adding a dummy base
  const fullUrl = new URL(partialUrl, "http://dummy-base.com");

  // Convert the URLSearchParams object to a plain object
  const params: Record<string, string> = {};
  fullUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

type PageProps = {
  searchParams: Record<string, string | string[]>;
};

const Page: NextPage<PageProps> = async ({ searchParams }) => {
  const callbackUrl = String(
    searchParams.callbackUrl ? searchParams.callbackUrl : "/",
  );

  const queryParams = getQueryParams(callbackUrl);
  const uid = queryParams.uid;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-gradient-to-b from-[#fef8ff] to-[#e0b2ff] text-black">
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
        Thomas & <span>Sarah</span>&apos;s Wedding
      </h1>
      <div>
        <p>
          Before you can a look around and learn more - we need to know, who are
          you?
        </p>
        <GuestPicker callbackUrl={callbackUrl} uid={uid} />
      </div>
    </main>
  );
};

export default Page;
