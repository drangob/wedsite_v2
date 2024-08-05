import { getServerAuthSession } from "@/server/auth";
import { notFound, redirect } from "next/navigation";

export default async function Page() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/api/auth/signin");
  }
  const isAdmin = session?.user?.role === "ADMIN";
  if (!isAdmin) {
    notFound();
  }
  return (
    <div className="m-4 max-w-lg">
      <h1>Admin</h1>
      <p>
        This is the admin page, here you will be able to view and edit users,
        content, RVSP&apos;s etc.
      </p>
    </div>
  );
}
