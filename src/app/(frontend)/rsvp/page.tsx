import { api } from "@/trpc/server";
import Content from "../_components/Content";
import RsvpForm from "./rsvpForm";
import { getServerAuthSession } from "@/server/auth";

const rsvp = async () => {
  const slugExists = await api.content.contentExists("rsvp");
  const session = await getServerAuthSession();
  const email = session?.user.email;
  const name = session?.user.name;
  if (!session || !email || !name) {
    return <div>Not authenticated</div>;
  }

  return (
    <div className="flex w-full flex-col items-center px-4 py-8">
      {slugExists && <Content slug="rsvp" />}
      <RsvpForm name={name} />
    </div>
  );
};
export default rsvp;
