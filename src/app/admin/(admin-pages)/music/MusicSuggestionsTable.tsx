"use client";

import { type Key } from "react";

import {
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { api } from "@/trpc/react";

const MusicSuggestionsTable = () => {
  const columns = [
    { key: "song", label: "Song" },
    { key: "artist", label: "Artist" },
    { key: "suggestions", label: "Suggestions" },
  ];

  const { data, isLoading } = api.spotify.getAllSuggestedSongs.useQuery();

  const rows =
    data?.map((song) => ({
      key: song.id,
      song: song.trackName,
      artist: song.artistNames.join(", "),
      suggestions: song._count.suggestions,
    })) ?? [];

  type MusicSuggestionRowItem = (typeof rows)[number];

  return (
    <Table className="max-h-[85vh] min-w-full">
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody
        items={rows ?? []}
        isLoading={isLoading}
        loadingContent={<Spinner label="Loading..." />}
        emptyContent={"No suggestions found"}
      >
        {(item: MusicSuggestionRowItem) => (
          <TableRow key={item.key}>
            {(columnKey: Key) => (
              <TableCell>
                {item[columnKey as keyof MusicSuggestionRowItem]}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default MusicSuggestionsTable;
