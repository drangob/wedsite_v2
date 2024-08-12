"use client";

import { Button } from "@nextui-org/react";
import { signOut, signIn } from "next-auth/react";

interface AdminLoginProps {
  loggedIn: boolean;
}

const AdminLogin = ({ loggedIn }: AdminLoginProps) => {
  return loggedIn ? (
    <div>
      <Button onClick={() => signOut()}>Sign out</Button>
    </div>
  ) : (
    <div>
      <Button onClick={() => signIn("discord", { callbackUrl: "/admin" })}>
        Admin sign in with Discord
      </Button>
    </div>
  );
};

export default AdminLogin;
