"use client";

import React, { useState, useEffect } from "react";
import { Input, Listbox, ListboxItem, Spinner } from "@nextui-org/react";
import { api } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/react";
import { useDebounce } from "use-debounce";
import { toast } from "react-hot-toast";
import { XCircle, PlusCircle } from "lucide-react";

type SpotifyTrack = RouterOutputs["spotify"]["search"][number];

const MusicSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 750);
  const [suggestedIds, setSuggestedIds] = useState<string[]>([]);

  const utils = api.useUtils();

  const { data: initialSuggestedIdsData, isLoading: isLoadingSuggestedIds } =
    api.spotify.getSuggestedSongIds.useQuery();

  useEffect(() => {
    if (initialSuggestedIdsData) {
      setSuggestedIds(initialSuggestedIdsData);
    }
  }, [initialSuggestedIdsData]);

  const { data, error, isLoading, isFetching, refetch } =
    api.spotify.search.useQuery(
      { query: debouncedSearchTerm },
      {
        enabled: !!debouncedSearchTerm.trim(),
      },
    );

  const { mutate: suggestSong } = api.spotify.suggestSong.useMutation({
    onSuccess: (data, variables) => {
      toast.success(data.message || "Song suggested successfully!");
      setSuggestedIds((prev) => [...prev, variables.spotifyId]);
      void utils.spotify.getSuggestedSongIds.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to suggest song.");
    },
  });

  const { mutate: unsuggestSong } = api.spotify.unsuggestSong.useMutation({
    onSuccess: (data, variables) => {
      toast.success(data.message || "Song suggestion removed!");
      setSuggestedIds((prev) =>
        prev.filter((id) => id !== variables.spotifyId),
      );
      void utils.spotify.getSuggestedSongIds.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove suggestion.");
    },
  });

  const handleSearch = () => {
    if (debouncedSearchTerm.trim()) {
      void refetch();
    }
  };

  const handleTrackAction = (track: SpotifyTrack) => {
    if (suggestedIds.includes(track.id)) {
      unsuggestSong({ spotifyId: track.id });
    } else {
      suggestSong({ spotifyId: track.id });
    }
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
      {(isLoading || isFetching || isLoadingSuggestedIds) && (
        <Spinner label="Loading..." />
      )}
      {error && <p className="text-danger">Error: {error.message}</p>}
      {!isLoading &&
        !isFetching &&
        !isLoadingSuggestedIds &&
        results.length > 0 && (
          <Listbox aria-label="Search Results">
            {results.map((track) => {
              const isSuggested = suggestedIds.includes(track.id);
              return (
                <ListboxItem
                  key={track.id}
                  textValue={`${track.name} - ${track.artists.map((a) => a.name).join(", ")}`}
                  onPress={() => handleTrackAction(track)}
                  aria-label={
                    isSuggested
                      ? `Unsuggest ${track.name}`
                      : `Suggest ${track.name}`
                  }
                  endContent={
                    isSuggested ? (
                      <XCircle className="h-5 w-5 text-danger" />
                    ) : (
                      <PlusCircle className="h-5 w-5 text-primary" />
                    )
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
      {!isLoading &&
        !isFetching &&
        !isLoadingSuggestedIds &&
        debouncedSearchTerm.trim().length > 0 &&
        results.length === 0 &&
        !error && (
          <p>No results found for &quot;{debouncedSearchTerm}&quot;.</p>
        )}
    </div>
  );
};

export default MusicSearch;
