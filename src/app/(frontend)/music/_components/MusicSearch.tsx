"use client";

import React, { useState } from "react";
import { Input, Listbox, ListboxItem, Spinner } from "@nextui-org/react";
import type { RouterOutputs } from "@/trpc/react";
import { useDebounce } from "use-debounce";
import { XCircle, PlusCircle, Heart } from "lucide-react";
import { api } from "@/trpc/react";
import { useSongActions } from "@/hooks/useSongActions";

type SpotifyTrack = RouterOutputs["spotify"]["search"][number] & {
  // suggestionCount and isSuggestedByCurrentUser are already part of the search endpoint's return type if decorated properly
  // No need to redefine them here if the backend provides them directly in the search results.
};

const MusicSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 750);

  // Use the new hook, passing the debouncedSearchTerm for targeted invalidation
  const { suggestSong, unsuggestSong, isSuggesting, isUnsuggesting } =
    useSongActions(debouncedSearchTerm);

  const { data, error, isLoading, refetch, isFetching } =
    api.spotify.search.useQuery(
      { query: debouncedSearchTerm },
      {
        enabled: !!debouncedSearchTerm.trim(),
        placeholderData: (previousData) => previousData,
      },
    );

  const handleSearch = () => {
    if (debouncedSearchTerm.trim()) {
      void refetch();
    }
  };

  const handleTrackAction = (track: SpotifyTrack) => {
    if (track.isSuggestedByCurrentUser) {
      unsuggestSong({ spotifyId: track.id });
    } else {
      suggestSong({ spotifyId: track.id });
    }
  };

  const results: SpotifyTrack[] = debouncedSearchTerm.trim()
    ? (data ?? [])
    : [];

  const showInitialLoadingSpinner = isLoading && !data;
  // Determine if an action is in progress
  const isActionInProgress = isSuggesting || isUnsuggesting;

  return (
    <div className="flex w-full flex-col gap-4">
      <Input
        variant="bordered"
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
      {showInitialLoadingSpinner && <Spinner label="Loading..." />}

      {error && <p className="text-danger">Error: {error.message}</p>}

      {data && results.length > 0 && (
        <Listbox aria-label="Search Results">
          {results.slice(0, 10).map((track) => {
            return (
              <ListboxItem
                key={track.id}
                textValue={`${track.name} - ${track.artists.map((a) => a.name).join(", ")}`}
                onPress={() => handleTrackAction(track)}
                aria-label={
                  track.isSuggestedByCurrentUser
                    ? `Unsuggest ${track.name}`
                    : `Suggest ${track.name}`
                }
                endContent={
                  <div className="flex items-center gap-1">
                    {track.suggestionCount > 0 && (
                      <span className="flex items-center text-xs text-default-500">
                        <Heart className="mr-1 h-4 w-4 text-pink-500" />
                        {track.suggestionCount}
                      </span>
                    )}
                    {isFetching || isActionInProgress ? ( // Show spinner if fetching search results OR if an action is in progress
                      <Spinner size="sm" />
                    ) : track.isSuggestedByCurrentUser ? (
                      <XCircle className="h-5 w-5 text-danger" />
                    ) : (
                      <PlusCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                }
              >
                <div className="flex items-center gap-2">
                  {track.album.images[track.album.images.length - 1]?.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        track.album.images[track.album.images.length - 1]?.url
                      }
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
            );
          })}
        </Listbox>
      )}

      {!showInitialLoadingSpinner &&
        debouncedSearchTerm.trim().length > 0 &&
        results.length === 0 &&
        !error && (
          <p>No results found for &quot;{debouncedSearchTerm}&quot;.</p>
        )}
    </div>
  );
};

export default MusicSearch;
