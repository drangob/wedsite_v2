import { api } from "@/trpc/server";
import Content from "../_components/Content";
import MusicSearch from "./_components/MusicSearch";

const music = async () => {
  const slugExists = await api.content.contentExists("music");

  return (
    <div className="flex w-full flex-col items-center px-4 py-8">
      {slugExists && <Content slug="music" />}
      <MusicSearch />
    </div>
  );
};

export default music;
