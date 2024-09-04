import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "@/server/api/trpc";

import { db } from "@/server/db";

import { GuestSchema } from "./user";
import { Prisma } from "@prisma/client";

const RSVPSchema = z.object({
  id: z.string(),
  isAttending: z.boolean(),
  dietaryRequirements: z.string().optional(),
  extraInfo: z.string().optional(),
  guest: GuestSchema, // GuestSchema is imported from user.ts
});

export const rsvpRouter = createTRPCRouter({
  getRSVPs: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const limit = input.limit ?? 50;
      const { cursor, search } = input;

      const whereClause = search
        ? {
            user: {
              name: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
          }
        : {};

      const [rsvps, totalCount] = await Promise.all([
        db.rsvp.findMany({
          take: limit + 1,
          where: whereClause,
          orderBy: {
            user: { name: "asc" },
          },
          cursor: cursor ? { id: cursor } : undefined,
          include: {
            user: true,
          },
        }),
        db.rsvp.count({ where: whereClause }),
      ]);

      const remappedRsvps = rsvps.map((rsvp) => ({
        ...rsvp,
        guest: rsvp.user,
        group: "DAY",
      }));

      return {
        items: RSVPSchema.array().parse(remappedRsvps.slice(0, limit)),
        nextCursor: rsvps[limit]?.id,
        totalCount,
      };
    }),
});
