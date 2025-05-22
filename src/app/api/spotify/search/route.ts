import { NextResponse } from "next/server";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const spotifyApi = SpotifyApi.withClientCredentials(
  process.env.SPOTIFY_CLIENT_ID!,
  process.env.SPOTIFY_CLIENT_SECRET!,
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 },
    );
  }

  try {
    const searchResults = await spotifyApi.search(query, [
      "track",
      "artist",
      "album",
    ]);
    return NextResponse.json(searchResults.tracks?.items ?? []);
  } catch (error) {
    console.error("Error searching tracks on Spotify:", error);
    return NextResponse.json(
      { error: "Error searching tracks on Spotify" },
      { status: 500 },
    );
  }
}
