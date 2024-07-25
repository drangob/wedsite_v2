import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

import { db } from "@/server/db";

export const userRouter = createTRPCRouter({
  getUsers: publicProcedure.query(() => {
    return db.user.findMany();
  }),
});
