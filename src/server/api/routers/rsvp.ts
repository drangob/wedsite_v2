import { z } from "zod";

import {
  createTRPCRouter,
  adminProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

import { db, UserRole } from "@/server/db";

import { GuestSchema } from "./user";
import { Prisma } from "@prisma/client";

export const RSVPSchema = z.object({
  id: z.string(),
  isAttending: z.boolean(),
  dietaryRequirements: z.string().optional(),
  extraInfo: z.string().optional(),
  updatedAt: z.date(),
});

export const GuestRSVPSchema = z.object({
  guest: GuestSchema, // GuestSchema is imported from user.ts
  rsvp: RSVPSchema.optional(),
});

export const rsvpRouter = createTRPCRouter({
  getUserRSVPs: adminProcedure
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

      const whereClause = {
        ...(search
          ? { name: { contains: search, mode: Prisma.QueryMode.insensitive } }
          : {}),
        role: UserRole.GUEST,
      };
      const [users, totalCount] = await Promise.all([
        db.user.findMany({
          take: limit + 1,
          where: whereClause,
          orderBy: {
            name: "asc",
          },
          cursor: cursor ? { id: cursor } : undefined,
          include: {
            Rsvp: true,
          },
        }),
        db.user.count({ where: whereClause }),
      ]);

      const userRSVPs = users.map((user) => ({
        guest: {
          ...user,
        },
        rsvp:
          user.Rsvp && user.Rsvp.length === 1
            ? {
                ...user.Rsvp?.[0],
              }
            : undefined,
      }));

      return {
        items: GuestRSVPSchema.array().parse(userRSVPs.slice(0, limit)),
        nextCursor: users[limit]?.id,
        totalCount,
      };
    }),
  upsertGuestRSVP: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        isAttending: z.boolean(),
        dietaryRequirements: z.string().optional(),
        extraInfo: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { userId, isAttending, dietaryRequirements, extraInfo } = input;
      const user = await db.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (
        ctx.session.user.id !== userId &&
        ctx.session.user.role !== UserRole.ADMIN
      ) {
        throw new Error("Unauthorized");
      }

      const rsvp = await db.rsvp.upsert({
        where: {
          userId,
        },
        update: {
          isAttending,
          dietaryRequirements,
          extraInfo,
        },
        create: {
          userId,
          isAttending,
          dietaryRequirements,
          extraInfo,
        },
      });

      return RSVPSchema.parse(rsvp);
    }),
});
