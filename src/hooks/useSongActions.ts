import { api } from "@/trpc/react";
import { toast } from "react-hot-toast";

export const useSongActions = () => {
  const utils = api.useUtils();

  const suggestSongMutation = api.spotify.suggestSong.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Song suggested successfully!");
      void utils.spotify.search.invalidate();
      void utils.spotify.getUserSuggestions.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to suggest song.");
    },
  });

  const unsuggestSongMutation = api.spotify.unsuggestSong.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Song suggestion removed!");
      void utils.spotify.search.invalidate();
      void utils.spotify.getUserSuggestions.invalidate();
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
