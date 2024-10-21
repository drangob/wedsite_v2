import { getServerAuthSession } from "@/server/auth";
import GuestPicker from "../_components/GuestPicker";
import { type NextPage } from "next";
import { Fragment } from "react";

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
  const session = await getServerAuthSession();

  const callbackUrl = String(
    searchParams.callbackUrl ? searchParams.callbackUrl : "/",
  );

  const queryParams = getQueryParams(callbackUrl);
  const uid = queryParams.uid;

  return (
    <Fragment>
      <header>
        <div className="flex h-16 w-full flex-col items-center justify-center">
          <h2 className="font-lora text-3xl font-light tracking-wide text-forest-500">
            {process.env.NEXT_PUBLIC_COUPLE_NAME ?? "Wedding"}
          </h2>
        </div>
      </header>
      <main className="flex min-h-96 flex-col items-center justify-center gap-10">
        <div className="flex flex-col gap-8 p-4">
          {session && session.user.role !== "GUEST" ? (
            <p>
              Hi, {session?.user.name}! You need to login as a guest to access
              the site from their perspective.
            </p>
          ) : (
            <p>
              Before you can a look around and learn more - we need to know, who
              are you?
            </p>
          )}
          <GuestPicker callbackUrl={callbackUrl} uid={uid} />
        </div>
      </main>
    </Fragment>
  );
};

export default Page;
