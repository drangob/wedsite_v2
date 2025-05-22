"use client";

import React, { useState } from "react";
import { Input, Listbox, ListboxItem, Spinner } from "@nextui-org/react";

// Basic type for Spotify track item - expand as needed
interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    images: Array<{ url: string }>;
  };
  external_urls: {
    spotify: string;
  };
}

interface SpotifyError {
  error?: string;
  message?: string; // Spotify API sometimes uses message for errors
}

const MusicSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch(
        `/api/spotify/search?query=${encodeURIComponent(searchTerm)}`,
      );
      if (!response.ok) {
        // Try to parse error response from Spotify API or our wrapper
        const errorData = (await response.json()) as SpotifyError;
        throw new Error(
          errorData.error ?? errorData.message ?? `Error: ${response.status}`,
        );
      }
      const data = (await response.json()) as SpotifyTrack[];
      setResults(data);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    }
    setLoading(false);
  };

  const handleSelectTrack = (track: SpotifyTrack) => {
    // Placeholder for handling track selection
    // For now, we'll just log it to the console
    console.log("Selected track:", track);
    // You might want to clear search term and results here, or add to a suggestions list
    setSearchTerm("");
    setResults([]);
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Input
        isClearable
        placeholder="Search for a song or artist"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            void handleSearch();
          }
        }}
        aria-label="Search Music"
      />
      {loading && <Spinner label="Searching..." />}
      {error && <p className="text-danger">Error: {error}</p>}
      {!loading && results.length > 0 && (
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
      {!loading && searchTerm.length > 0 && results.length === 0 && !error && (
        <p>No results found for &quot;{searchTerm}&quot;.</p>
      )}
    </div>
  );
};

export default MusicSearch;
