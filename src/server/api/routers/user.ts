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
});

const CreateGuestSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

const UpdateGuestSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
});

export const userRouter = createTRPCRouter({
  getGuests: publicProcedure.query(async () => {
    const guests = await db.user.findMany({
      where: {
        role: Role.GUEST,
      },
    });
    return GuestSchema.array().parse(guests);
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
      return GuestSchema.parse(newGuest);
    }),

  editGuest: adminProcedure
    .input(UpdateGuestSchema)
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      const updatedGuest = await db.user.update({
        where: { id },
        data: updateData,
      });
      return GuestSchema.parse(updatedGuest);
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
