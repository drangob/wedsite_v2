import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";

const spotifyApi = SpotifyApi.withClientCredentials(
  process.env.SPOTIFY_CLIENT_ID!,
  process.env.SPOTIFY_CLIENT_SECRET!,
);

export const spotifyRouter = createTRPCRouter({
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(
      async ({
        input,
        ctx,
      }: {
        input: { query: string };
        ctx: { session: { user: { id: string } } };
      }) => {
        try {
          const searchResults = await spotifyApi.search(
            input.query,
            ["track"],
            "GB",
            20,
          );

          const tracks = searchResults.tracks?.items ?? [];
          const userId = ctx.session.user.id;

          if (!tracks.length) return [];

          const decoratedTracks = await Promise.all(
            tracks.map(async (track) => {
              const songInDb = await db.song.findUnique({
                where: { spotifyId: track.id },
                include: {
                  suggestions: {
                    select: {
                      userId: true,
                    },
                  },
                },
              });

              let suggestionCount = 0;
              let isSuggestedByCurrentUser = false;

              if (songInDb) {
                suggestionCount = songInDb.suggestions.length;
                isSuggestedByCurrentUser = songInDb.suggestions.some(
                  (suggestion) => suggestion.userId === userId,
                );
              }

              return {
                ...track,
                suggestionCount,
                isSuggestedByCurrentUser,
              };
            }),
          );
          return decoratedTracks;
        } catch (error) {
          console.error("Error searching tracks on Spotify:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error searching tracks on Spotify",
          });
        }
      },
    ),
  suggestSong: protectedProcedure
    .input(
      z.object({
        spotifyId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { spotifyId } = input;
      const userId = ctx.session.user.id;

      const track = await spotifyApi.tracks.get(spotifyId);

      try {
        if (!track) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Track not found on Spotify",
          });
        }

        const trackName = track.name;
        const artistNames = track.artists.map((artist) => artist.name);

        const song = await db.song.upsert({
          where: { spotifyId },
          update: { trackName, artistNames },
          create: { spotifyId, trackName, artistNames },
        });

        await db.songSuggestion.create({
          data: {
            userId,
            songId: song.id,
          },
        });

        return { success: true, message: "Song suggested successfully" };
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("Unique constraint failed")
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "You have already suggested this song.",
          });
        }
        console.error("Error suggesting song:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error suggesting song",
        });
      }
    }),
  getUserSuggestions: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    try {
      const userSuggestions = await ctx.db.songSuggestion.findMany({
        where: { userId },
        include: {
          song: {
            select: {
              id: true,
              spotifyId: true,
              trackName: true,
              artistNames: true,
            },
          },
        },
        orderBy: {
          suggestedAt: "desc",
        },
      });

      return userSuggestions.map((suggestionWithSong) => ({
        id: suggestionWithSong.song.spotifyId,
        title: suggestionWithSong.song.trackName,
        artist: suggestionWithSong.song.artistNames.join(", "),
      }));
    } catch (error) {
      console.error("Error fetching user's suggested songs:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error fetching user's suggested songs",
      });
    }
  }),
  unsuggestSong: protectedProcedure
    .input(z.object({ spotifyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { spotifyId } = input;

      try {
        // Find the song first to get its ID
        const song = await ctx.db.song.findUnique({
          where: { spotifyId },
        });

        if (!song) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Song not found in our records.",
          });
        }

        // Then delete the suggestion
        const result = await ctx.db.songSuggestion.deleteMany({
          where: {
            userId,
            songId: song.id,
          },
        });

        if (result.count === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "You haven't suggested this song or it was already removed.",
          });
        }

        // Clean up song if no other suggestions exist
        const remainingSuggestions = await ctx.db.songSuggestion.count({
          where: { songId: song.id },
        });
        if (remainingSuggestions === 0) {
          await ctx.db.song.delete({ where: { id: song.id } });
        }

        return { success: true, message: "Song suggestion removed." };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error removing song suggestion:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error removing song suggestion",
        });
      }
    }),

  getAllSuggestedSongs: adminProcedure.query(async ({ ctx }) => {
    const songs = await ctx.db.song.findMany({
      include: {
        suggestions: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            suggestions: true,
          },
        },
      },
      orderBy: {
        suggestions: {
          _count: "desc",
        },
      },
    });

    return songs;
  }),

  getAllSuggestedSongsCSV: adminProcedure.query(async ({ ctx }) => {
    const songs = await ctx.db.song.findMany({
      include: {
        suggestions: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            suggestions: true,
          },
        },
      },
      orderBy: {
        suggestions: {
          _count: "desc",
        },
      },
    });

    const csv = [
      ["Song", "Artist", "Suggestions"],
      ...songs.map((song) => [
        song.trackName,
        song.artistNames.join(", "),
        song._count.suggestions,
      ]),
    ]
      .map((row) =>
        row
          .map((cell) => (typeof cell === "number" ? cell : `"${cell}"`))
          .join(","),
      )
      .join("\n");

    return csv;
  }),
});
