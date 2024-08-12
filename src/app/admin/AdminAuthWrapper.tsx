"use client";

import { type Session } from "next-auth";
import AdminLogin from "./_components/AdminLogin";

interface AdminAuthWrapperProps {
  session: Session | null;
  children: React.ReactNode;
}

const AdminAuthWrapper = ({ session, children }: AdminAuthWrapperProps) => {
  const isAdmin = session?.user?.role === "ADMIN";

  if (!isAdmin) {
    return (
      <>
        <p>You are not authorized to view this page.</p>
        <AdminLogin loggedIn={!!session} />
      </>
    );
  }
  if (isAdmin) {
    return <>{children}</>;
  }
};

export default AdminAuthWrapper;
