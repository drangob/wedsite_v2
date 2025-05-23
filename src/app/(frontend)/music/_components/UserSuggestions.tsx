"use client";

import React, { useState } from "react";
import { api } from "@/trpc/react";
import { useSongActions } from "@/hooks/useSongActions";
import { Button, Spinner } from "@nextui-org/react";
import { XCircle } from "lucide-react";

const ITEMS_PER_PAGE = 10;

const UserSuggestions = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { unsuggestSong, isUnsuggesting } = useSongActions();

  const {
    data: suggestions = [],
    isLoading,
    error,
  } = api.spotify.getUserSuggestions.useQuery(undefined, {});

  const handleUnsuggest = (spotifyId: string) => {
    unsuggestSong({ spotifyId });
  };

  const totalPages = Math.ceil(suggestions.length / ITEMS_PER_PAGE);
  const paginatedSuggestions = suggestions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border p-4 shadow-sm">
        Loading suggestions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card text-destructive rounded-lg border p-4 shadow-sm">
        Error loading suggestions: {error.message}
      </div>
    );
  }

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
            disabled={currentPage === 1 || isLoading}
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
            disabled={currentPage === totalPages || isLoading}
            variant="ghost"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserSuggestions;
