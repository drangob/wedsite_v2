import { api } from "@/trpc/react";
import { toast } from "react-hot-toast";

export const useSongActions = (debouncedSearchTerm?: string) => {
  const utils = api.useUtils();

  const suggestSongMutation = api.spotify.suggestSong.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Song suggested successfully!");
      // Invalidate search queries. If a specific search term is provided,
      // invalidate only that query, otherwise invalidate all search queries.
      if (
        debouncedSearchTerm !== undefined &&
        debouncedSearchTerm.trim() !== ""
      ) {
        void utils.spotify.search.invalidate({ query: debouncedSearchTerm });
      } else {
        void utils.spotify.search.invalidate();
      }
      void utils.spotify.getUserSuggestions.invalidate();
      void utils.spotify.getTopSongs.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to suggest song.");
    },
  });

  const unsuggestSongMutation = api.spotify.unsuggestSong.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Song suggestion removed!");
      // Invalidate search queries similarly to suggestSong
      if (
        debouncedSearchTerm !== undefined &&
        debouncedSearchTerm.trim() !== ""
      ) {
        void utils.spotify.search.invalidate({ query: debouncedSearchTerm });
      } else {
        void utils.spotify.search.invalidate();
      }
      void utils.spotify.getUserSuggestions.invalidate();
      void utils.spotify.getTopSongs.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove suggestion.");
    },
  });

  return {
    suggestSong: suggestSongMutation.mutate,
    isSuggesting: suggestSongMutation.status === "pending",
    unsuggestSong: unsuggestSongMutation.mutate,
    isUnsuggesting: unsuggestSongMutation.status === "pending",
  };
};
