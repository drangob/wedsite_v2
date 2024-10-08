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
  dietaryRequirements: z.string().optional(),
  extraInfo: z.string().optional(),
  updatedAt: z.date(),
  guestNames: z.array(z.string()),
  attendingGuestNames: z.array(z.string()),
  nonAttendingGuestNames: z.array(z.string()),
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
                    : {
                        attendingGuestNames: { isEmpty: !filters.isAttending },
                      },
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

      const [users, totalCount] = await Promise.all([
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
      ]);

      const userRSVPs = users.map((user) => ({
        guest: {
          ...user,
          Rsvp: undefined,
        },
        rsvp: user.Rsvp
          ? {
              ...user.Rsvp,
              guestNames: user.guestNames,
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
        userId: z.string().optional(),
        attendingGuestNames: z.array(z.string()),
        nonAttendingGuestNames: z.array(z.string()),
        dietaryRequirements: z.string().optional(),
        extraInfo: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const {
        userId: inputUserId,
        attendingGuestNames,
        nonAttendingGuestNames,
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

      // remove any names that are not in the guest list
      // can happen if the user is updated to have less guests
      const guestNames = user.guestNames;
      const filteredAttending = attendingGuestNames.filter((name) =>
        guestNames.includes(name),
      );
      const filteredNonAttending = nonAttendingGuestNames.filter((name) =>
        guestNames.includes(name),
      );

      const rsvp = await db.rsvp.upsert({
        where: {
          userId,
        },
        update: {
          attendingGuestNames: filteredAttending,
          nonAttendingGuestNames: filteredNonAttending,
          dietaryRequirements,
          extraInfo,
        },
        create: {
          userId,
          attendingGuestNames: filteredAttending,
          nonAttendingGuestNames: filteredNonAttending,
          dietaryRequirements,
          extraInfo,
        },
        include: {
          user: {
            select: {
              guestNames: true,
            },
          },
        },
      });

      const flattenedRsvp = {
        ...rsvp,
        guestNames: rsvp.user.guestNames,
      };
      return RSVPSchema.parse(flattenedRsvp);
    }),
  getGuestRSVP: protectedProcedure.query(async ({ ctx }) => {
    const { id: userId } = ctx.session.user;
    const rsvp = await db.rsvp.findUnique({
      where: {
        userId: userId,
      },
      include: {
        user: {
          select: {
            guestNames: true,
          },
        },
      },
    });

    if (!rsvp) {
      return null;
    }

    const flattenedRsvp = {
      ...rsvp,
      guestNames: rsvp.user.guestNames,
    };
    return RSVPSchema.parse(flattenedRsvp);
  }),
  getToplineData: adminProcedure.query(async () => {
    const [
      guestUserCount,
      rsvpCount,
      dietryReqCount,
      extraInfoCount,
      totalGuestsCount,
      attendingGuestCount,
    ] = await Promise.all([
      db.user.count({ where: { role: UserRole.GUEST } }),
      db.rsvp.count(),
      db.rsvp.count({
        where: { dietaryRequirements: { not: { equals: "" } } },
      }),
      db.rsvp.count({ where: { extraInfo: { not: { equals: "" } } } }),
      db.$queryRaw<{ total: bigint }[]>`
        SELECT SUM(ARRAY_LENGTH("guestNames", 1)) as total
        FROM "User";
      `,
      db.$queryRaw<{ total: number }[]>`
        SELECT SUM(ARRAY_LENGTH("attendingGuestNames", 1)) as total
        FROM "Rsvp";
      `,
    ]);
    return {
      guestUserCount,
      rsvpCount,
      dietryReqCount,
      extraInfoCount,
      totalGuestsCount: Number(totalGuestsCount[0]?.total ?? 0),
      attendingGuestCount: Number(attendingGuestCount[0]?.total ?? 0),
    };
  }),

  getCSV: adminProcedure.query(async () => {
    const rsvps = await db.rsvp.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        user: { name: "asc" },
      },
    });

    const usersWithOutRsvp = await db.user.findMany({
      where: {
        role: UserRole.GUEST,
        NOT: {
          Rsvp: {
            userId: {
              in: rsvps.map((rsvp) => rsvp.userId),
            },
          },
        },
      },
      select: {
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    const csv = [
      [
        "Name",
        "Email",
        "Responded",
        "Attending Guests",
        "Non Attending Guests",
        "Dietary Requirements",
        "Extra Info",
      ],
      ...rsvps.map((rsvp) => [
        rsvp.user.name,
        rsvp.user.email,
        "Yes",
        rsvp.attendingGuestNames.join(", "),
        rsvp.nonAttendingGuestNames.join(", "),
        rsvp.dietaryRequirements,
        rsvp.extraInfo,
      ]),
      ...usersWithOutRsvp.map((user) => [
        user.name,
        user.email,
        "No",
        "",
        "",
        "",
        "",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    return csv;
  }),
});
