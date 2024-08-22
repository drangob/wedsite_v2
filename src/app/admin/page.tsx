import React from "react";

import { getServerAuthSession } from "@/server/auth";
import AdminLogin from "./_components/AdminLogin";
import { Link } from "@nextui-org/react";

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
      <nav>
        <ul>
          <li>
            <Link href="/admin/guests">Guests</Link>
          </li>
          <li>
            <Link href="/admin/content">Content</Link>
          </li>
          <li>
            <Link href="/admin/rsvps">RSVP&apos;s</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
