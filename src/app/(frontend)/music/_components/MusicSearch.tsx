"use client";

import React, { useState } from "react";
import { Input, Listbox, ListboxItem, Spinner } from "@nextui-org/react";
import { api } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/react";
import { useDebounce } from "use-debounce";

type SpotifyTrack = RouterOutputs["spotify"]["search"][number];

const MusicSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 750);

  const { data, error, isLoading, isFetching, refetch } =
    api.spotify.search.useQuery(
      { query: debouncedSearchTerm },
      {
        enabled: !!debouncedSearchTerm.trim(),
      },
    );

  const handleSearch = () => {
    if (debouncedSearchTerm.trim()) {
      void refetch();
    }
  };

  const handleSelectTrack = (track: SpotifyTrack) => {
    console.log("Selected track:", track);
    setSearchTerm("");
  };

  const results: SpotifyTrack[] = data ?? [];

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Input
        isClearable
        placeholder="Search for a song or artist"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
        onClear={() => setSearchTerm("")}
      />
      {(isLoading || isFetching) && <Spinner label="Searching..." />}
      {error && <p className="text-danger">Error: {error.message}</p>}
      {!isLoading && !isFetching && results.length > 0 && (
        <Listbox
          aria-label="Search Results"
          onAction={(key) => {
            const track = results.find((r) => r.id === key);
            if (track) {
              handleSelectTrack(track);
            }
          }}
        >
          {results.map((track) => (
            <ListboxItem
              key={track.id}
              textValue={`${track.name} - ${track.artists.map((a) => a.name).join(", ")}`}
            >
              <div className="flex items-center gap-2">
                {track.album.images[track.album.images.length - 1]?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={track.album.images[track.album.images.length - 1]?.url}
                    alt={track.name}
                    width="40"
                    height="40"
                    className="rounded"
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-small">{track.name}</span>
                  <span className="text-tiny text-default-400">
                    {track.artists.map((a) => a.name).join(", ")}
                  </span>
                </div>
              </div>
            </ListboxItem>
          ))}
        </Listbox>
      )}
      {!isLoading &&
        !isFetching &&
        debouncedSearchTerm.trim().length > 0 &&
        results.length === 0 &&
        !error && (
          <p>No results found for &quot;{debouncedSearchTerm}&quot;.</p>
        )}
    </div>
  );
};

export default MusicSearch;
