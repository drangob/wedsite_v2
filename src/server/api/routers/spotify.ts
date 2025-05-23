import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { TRPCError } from "@trpc/server";

const spotifyApi = SpotifyApi.withClientCredentials(
  process.env.SPOTIFY_CLIENT_ID!,
  process.env.SPOTIFY_CLIENT_SECRET!,
);

export const spotifyRouter = createTRPCRouter({
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }: { input: { query: string } }) => {
      try {
        const searchResults = await spotifyApi.search(input.query, [
          "track",
          "artist",
          "album",
        ]);
        return searchResults.tracks?.items ?? [];
      } catch (error) {
        console.error("Error searching tracks on Spotify:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error searching tracks on Spotify",
        });
      }
    }),
});
