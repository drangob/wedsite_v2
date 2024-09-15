import { getServerAuthSession } from "@/server/auth";
import AdminAuthWrapper from "./AdminAuthWrapper";
import { Link, Navbar, NavbarContent, NavbarItem } from "@nextui-org/react";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  return (
    <>
      <AdminAuthWrapper session={session}>
        <Navbar className="mb-2">
          <NavbarContent>
            <NavbarItem>
              <Link href="/admin">Home</Link>
            </NavbarItem>
            <NavbarItem>
              <Link href="/admin/guests">Guests</Link>
            </NavbarItem>
            <NavbarItem>
              <Link href="/admin/content">Content</Link>
            </NavbarItem>
            <NavbarItem>
              <Link href="/admin/rsvps">RSVP&apos;s</Link>
            </NavbarItem>
            <NavbarItem>
              <Link href="/admin/email">Email</Link>
            </NavbarItem>
          </NavbarContent>
        </Navbar>
        <div className="mx-auto flex max-w-[1024px] flex-col justify-center px-6">
          {children}
        </div>
      </AdminAuthWrapper>
    </>
  );
}
