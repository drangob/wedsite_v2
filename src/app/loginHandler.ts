"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

const LoginHandler = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());

    // Trigger functions based on query parameters
    if (params.uid) {
      console.log("uid exists:", params.uid);
      login(params.uid);
    }
  }, [searchParams]);

  const login = (uid: string) => {
    const url = new URL(window.location.href);
    url.searchParams.delete("uid");
    signIn("credentials", { user_id: uid, callbackUrl: url.href }).catch(
      (error) => {
        console.error("Failed to sign in", error);
      },
    );
  };

  return null; // This component does not render anything
};

export default LoginHandler;
