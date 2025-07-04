import { api } from "@/trpc/server";
import Content from "../_components/Content";
import MusicSearch from "./_components/MusicSearch";
import UserSuggestions from "./_components/UserSuggestions";

const music = async () => {
  const slugExists = await api.content.contentExists("music");

  return (
    <div className="flex w-full flex-col items-center px-4 py-8">
      {slugExists && <Content slug="music" />}
      <div className="items-top flex w-full flex-col gap-2 md:max-w-screen-lg md:flex-row">
        <div className="flex-1">
          <MusicSearch />
        </div>
        <div className="flex-1">
          <UserSuggestions />
        </div>
      </div>
    </div>
  );
};

export default music;
