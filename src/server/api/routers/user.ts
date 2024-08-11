import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

import { db } from "@/server/db";
import { Role } from "@prisma/client";

export const userRouter = createTRPCRouter({
  getGuests: publicProcedure.query(() => {
    return db.user.findMany({
      where: {
        role: Role.GUEST,
      },
    });
  }),
});
