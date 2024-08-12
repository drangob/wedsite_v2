import { getServerAuthSession } from "@/server/auth";
import AdminLogin from "./_components/AdminLogin";

export default async function Page() {
  const session = await getServerAuthSession();

  const loggedIn = !!session;

  return (
    <div className="m-4 max-w-lg">
      <AdminLogin loggedIn={loggedIn} />

      <h1>Admin</h1>
      <p>
        This is the admin page, here you will be able to view and edit users,
        content, RVSP&apos;s etc.
      </p>
    </div>
  );
}
