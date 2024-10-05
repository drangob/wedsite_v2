"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { api } from "@/trpc/react";

const LoginHandler = () => {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const { data: uidExists } = api.user.uidExists.useQuery(
    { uid: uid ?? "" },
    { enabled: !!uid }, // Only run the query if uid is not null
  );

  useEffect(() => {
    if (uidExists && uid) {
      login(uid);
    }
  }, [uidExists, uid]);

  const login = (uid: string) => {
    const url = new URL(window.location.href);
    url.searchParams.delete("uid");
    signIn("guest-credentials", { user_id: uid, callbackUrl: url.href }).catch(
      (error) => {
        console.error("Failed to sign in", error);
      },
    );
  };

  return null; // This component does not render anything
};

export default LoginHandler;
