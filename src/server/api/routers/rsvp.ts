import { z } from "zod";

import {
  createTRPCRouter,
  adminProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

import { db, UserRole } from "@/server/db";

import { UserSchema } from "./user";
import { Prisma } from "@prisma/client";

export const RSVPSchema = z.object({
  id: z.string(),
  isAttending: z.boolean(),
  dietaryRequirements: z.string().optional(),
  extraInfo: z.string().optional(),
  updatedAt: z.date(),
});

export const GuestRSVPSchema = z.object({
  guest: UserSchema, // GuestSchema is imported from user.ts
  rsvp: RSVPSchema.optional(),
});

export const getUserRSVPsInput = z.object({
  limit: z.number().min(1).max(100).nullish(),
  cursor: z.string().nullish(),
  search: z.string().optional(),
  sortField: z
    .enum([
      "name",
      "updatedAt",
      "isAttending",
      "dietaryRequirements",
      "extraInfo",
    ])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  filters: z.object({
    hasRSVP: z.boolean().optional(),
    isAttending: z.boolean().optional(),
    hasDietaryRequirements: z.boolean().optional(),
    hasExtraInfo: z.boolean().optional(),
  }),
});

export const rsvpRouter = createTRPCRouter({
  getUserRSVPs: adminProcedure
    .input(getUserRSVPsInput)
    .query(async ({ input }) => {
      const limit = input.limit ?? 50;
      const {
        cursor,
        search,
        sortField = "name",
        sortOrder = "asc",
        filters = {},
      } = input;

      const properFiltersApplied =
        Object.keys(filters).filter((key) => key !== "hasRSVP").length > 0;

      // @ts-expect-error - TS dislikes the is: null here
      const rsvpFilters: Prisma.RsvpWhereInput = {
        ...(filters.hasRSVP === undefined && !properFiltersApplied
          ? {}
          : (filters.hasRSVP ?? properFiltersApplied)
            ? {
                AND: [
                  filters.isAttending === undefined
                    ? {}
                    : { isAttending: filters.isAttending },
                  filters.hasDietaryRequirements === undefined
                    ? {}
                    : filters.hasDietaryRequirements
                      ? { dietaryRequirements: { not: { equals: "" } } }
                      : { dietaryRequirements: { equals: "" } },
                  filters.hasExtraInfo === undefined
                    ? {}
                    : filters.hasExtraInfo
                      ? { extraInfo: { not: { equals: "" } } }
                      : { extraInfo: { equals: "" } },
                ],
              }
            : { is: null }),
      };

      const whereClause: Prisma.UserWhereInput = {
        ...(search
          ? { name: { contains: search, mode: Prisma.QueryMode.insensitive } }
          : {}),
        role: UserRole.GUEST,
        ...{ Rsvp: { ...rsvpFilters } },
      };

      const orderBy =
        sortField === "name"
          ? { [sortField]: sortOrder }
          : {
              Rsvp: { [sortField]: sortOrder },
            };

      const [
        users,
        totalCount,
        allUsersCount,
        rsvpCount,
        positiveRsvpCount,
        dietryReqCount,
        extraInfoCount,
      ] = await Promise.all([
        db.user.findMany({
          take: limit + 1,
          where: whereClause,
          orderBy,
          cursor: cursor ? { id: cursor } : undefined,
          include: {
            Rsvp: true,
          },
        }),
        db.user.count({ where: whereClause }),
        db.user.count({ where: { role: UserRole.GUEST } }),
        db.rsvp.count(),
        db.rsvp.count({ where: { isAttending: true } }),
        db.rsvp.count({
          where: { dietaryRequirements: { not: { equals: "" } } },
        }),
        db.rsvp.count({ where: { extraInfo: { not: { equals: "" } } } }),
      ]);

      const userRSVPs = users.map((user) => ({
        guest: {
          ...user,
          Rsvp: undefined,
        },
        rsvp: user.Rsvp ?? undefined,
      }));

      return {
        items: GuestRSVPSchema.array().parse(userRSVPs.slice(0, limit)),
        nextCursor: users[limit]?.id,
        totalCount,
        allUsersCount,
        rsvpCount,
        positiveRsvpCount,
        dietryReqCount,
        extraInfoCount,
      };
    }),
  upsertGuestRSVP: protectedProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        isAttending: z.boolean(),
        dietaryRequirements: z.string().optional(),
        extraInfo: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const {
        userId: inputUserId,
        isAttending,
        dietaryRequirements,
        extraInfo,
      } = input;
      const userId = inputUserId ?? ctx.session.user.id;
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
  getGuestRSVP: protectedProcedure.query(async ({ ctx }) => {
    const { id: userId } = ctx.session.user;
    const rsvp = await db.rsvp.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!rsvp) {
      return null;
    }

    return RSVPSchema.parse(rsvp);
  }),
});
