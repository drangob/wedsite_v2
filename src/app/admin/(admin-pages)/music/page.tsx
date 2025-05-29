import { DownloadSuggestionsButton } from "./DownloadSuggestionsButton";
import MusicSuggestionsTable from "./MusicSuggestionsTable";

const MusicPage = () => {
  return (
    <div>
      <div className="mb-4 flex flex-col gap-4">
        <div className="flex flex-row justify-between gap-4">
          <h1 className="text-2xl font-bold">Music Suggestions</h1>
          <DownloadSuggestionsButton />
        </div>
      </div>
      <MusicSuggestionsTable />
    </div>
  );
};

export default MusicPage;
