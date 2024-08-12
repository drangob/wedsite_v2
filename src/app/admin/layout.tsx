import { getServerAuthSession } from "@/server/auth";
import AdminAuthWrapper from "./AdminAuthWrapper";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  return (
    <>
      <AdminAuthWrapper session={session}>{children}</AdminAuthWrapper>
    </>
  );
}
