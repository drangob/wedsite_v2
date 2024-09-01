import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "@/server/api/trpc";

import { db } from "@/server/db";
import { type Prisma, Role } from "@prisma/client";

const GuestSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  group: z.enum(["day", "evening"]),
});

const CreateGuestSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  group: z.enum(["day", "evening"]),
});

const UpdateGuestSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  group: z.enum(["day", "evening"]),
});

export const userRouter = createTRPCRouter({
  getGuests: publicProcedure
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

      const whereClause: Prisma.UserWhereInput = {
        role: Role.GUEST,
        name: search ? { contains: search, mode: "insensitive" } : undefined,
      };

      const [guests, totalCount] = await Promise.all([
        db.user.findMany({
          take: limit + 1,
          where: whereClause,
          orderBy: {
            name: "asc",
          },
          cursor: cursor ? { id: cursor } : undefined,
          include: {
            groups: {
              select: {
                group: true,
              },
            },
          },
        }),
        db.user.count({ where: whereClause }),
      ]);

      let nextCursor: typeof cursor = undefined;
      if (guests.length > limit) {
        const nextItem = guests.pop();
        nextCursor = nextItem!.id;
      }

      const guestsWithGroups = guests.map((guest) => {
        const group = guest.groups[0]?.group?.name ?? "";
        return { ...guest, group };
      });

      const validGuests = guestsWithGroups.filter((guest) => {
        const result = GuestSchema.safeParse(guest);
        if (!result.success) {
          console.warn(
            `Invalid guest data: ${JSON.stringify(guest)}`,
            result.error,
          );
          return false;
        }
        return true;
      });

      return {
        items: GuestSchema.array().parse(validGuests),
        nextCursor,
        totalCount,
      };
    }),

  addGuest: adminProcedure
    .input(CreateGuestSchema)
    .mutation(async ({ input }) => {
      const { group, ...rest } = input;
      const newGuest = await db.user.create({
        data: {
          ...rest,
          role: Role.GUEST,
          groups: {
            create: [
              {
                group: {
                  connectOrCreate: {
                    where: { name: group },
                    create: {
                      name: group,
                    },
                  },
                },
              },
            ],
          },
        },
      });
      return GuestSchema.parse({ ...newGuest, group: group });
    }),

  editGuest: adminProcedure
    .input(UpdateGuestSchema)
    .mutation(async ({ input }) => {
      const { id, group, ...rest } = input;
      const updatedGuest = await db.user.update({
        where: { id },
        data: {
          ...rest,
          groups: {
            deleteMany: {}, // remove all existing group links
            create: [
              {
                group: {
                  connectOrCreate: {
                    where: { name: group },
                    create: {
                      name: group,
                    },
                  },
                },
              },
            ],
          },
        },
      });
      return GuestSchema.parse({ ...updatedGuest, group: group });
    }),

  deleteGuest: adminProcedure
    .input(z.string())
    .mutation(async ({ input: id }) => {
      await db.user.delete({
        where: { id },
      });
      return { success: true };
    }),
});
