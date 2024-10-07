import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "@/server/api/trpc";

import { db } from "@/server/db";
import { type Prisma, Role } from "@prisma/client";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  group: z.enum(["DAY", "EVENING"]),
});

const CreateGuestSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  group: z.enum(["DAY", "EVENING"]),
});

const UpdateGuestSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  group: z.enum(["DAY", "EVENING"]),
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
        }),
        db.user.count({ where: whereClause }),
      ]);

      let nextCursor: typeof cursor = undefined;
      if (guests.length > limit) {
        const nextItem = guests.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: UserSchema.array().parse(guests),
        nextCursor,
        totalCount,
      };
    }),

  addGuest: adminProcedure
    .input(CreateGuestSchema)
    .mutation(async ({ input }) => {
      const newGuest = await db.user.create({
        data: {
          ...input,
          role: Role.GUEST,
        },
      });
      return UserSchema.parse({ ...newGuest });
    }),

  editGuest: adminProcedure
    .input(UpdateGuestSchema)
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      const updatedGuest = await db.user.update({
        where: { id },
        data: {
          ...rest,
        },
      });
      return UserSchema.parse(updatedGuest);
    }),

  deleteGuest: adminProcedure
    .input(z.string())
    .mutation(async ({ input: id }) => {
      await db.user.delete({
        where: { id },
      });
      return { success: true };
    }),

  getAllGuests: adminProcedure.query(async () => {
    return UserSchema.array().parseAsync(
      await db.user.findMany({
        where: {
          role: Role.GUEST,
        },
        orderBy: {
          name: "asc",
        },
      }),
    );
  }),

  uidExists: publicProcedure
    .input(z.object({ uid: z.string() }))
    .query(async ({ input }) => {
      const user = await db.user.findUnique({
        where: {
          id: input.uid,
        },
      });

      const userExistsSchema = z.boolean();
      return userExistsSchema.parse(!!user);
    }),
});
