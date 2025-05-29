"use client";

import React, { useState, useEffect } from "react";
import { useSongActions } from "@/hooks/useSongActions";
import { Button, Spinner } from "@nextui-org/react";
import { XCircle } from "lucide-react";
import { api } from "@/trpc/react";

const ITEMS_PER_PAGE = 10;

interface Suggestion {
  id: string;
  title: string;
  artist: string;
}

interface UserSuggestionsListProps {
  initialSuggestions: Suggestion[];
}

const UserSuggestionsList = ({
  initialSuggestions,
}: UserSuggestionsListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  // Use initialSuggestions from props, but allow refetching to update the list
  const { data: suggestions = initialSuggestions, refetch } =
    api.spotify.getUserSuggestions.useQuery(undefined, {
      initialData: initialSuggestions,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    });

  const { unsuggestSong, isUnsuggesting } = useSongActions();

  const handleUnsuggest = async (spotifyId: string) => {
    unsuggestSong({ spotifyId });
    void refetch(); // Refetch suggestions after unsuggesting
  };

  // This might happen if the parent server component re-renders with new data
  useEffect(() => {
    void refetch();
  }, [initialSuggestions, refetch]);

  const totalPages = Math.ceil(suggestions.length / ITEMS_PER_PAGE);
  const paginatedSuggestions = suggestions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="bg-card rounded-lg border p-4 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Your Suggestions</h2>
      {paginatedSuggestions.length > 0 ? (
        <ul className="space-y-3">
          {paginatedSuggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              className="flex items-center justify-between rounded-md border p-3 transition-all hover:shadow-md"
            >
              <div>
                <p className="font-medium">{suggestion.title}</p>
                <p className="text-muted-foreground text-sm">
                  {suggestion.artist}
                </p>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => handleUnsuggest(suggestion.id)}
                disabled={isUnsuggesting}
                aria-label={`Unsuggest ${suggestion.title}`}
              >
                {isUnsuggesting ? (
                  <Spinner size="sm" />
                ) : (
                  <XCircle className="h-5 w-5 text-danger" />
                )}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p>
          No suggestions found. You can suggest songs using the search above!
        </p>
      )}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            variant="ghost"
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            variant="ghost"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserSuggestionsList;
