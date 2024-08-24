import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "@/server/api/trpc";

import { db } from "@/server/db";
import { Role } from "@prisma/client";

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
  getGuests: publicProcedure.query(async () => {
    const guests = await db.user.findMany({
      where: {
        role: Role.GUEST,
      },
      orderBy: {
        name: "asc",
      },
      include: {
        groups: {
          select: {
            group: true,
          },
        },
      },
    });
    const guestsWithGroups = guests.map((guest) => {
      const group = guest.groups[0]?.group?.name ?? "";
      return { ...guest, group };
    });
    return GuestSchema.array().parse(guestsWithGroups);
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
