import {
  adminProcedure,
  createCallerFactory,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { userRouter } from "./routers/user";
import { contentRouter } from "./routers/content";
import { rsvpRouter } from "./routers/rsvp";
import { emailRouter } from "./routers/email";
import { db } from "../db";
import { main as seed } from "@/../prisma/seed";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  content: contentRouter,
  rsvp: rsvpRouter,
  email: emailRouter,
  healthcheck: publicProcedure.query(async () => {
    try {
      await db.$queryRaw`SELECT 1;`;
      return { status: "OK" };
    } catch (error) {
      console.error("Keep alive failed:", error);
      return { status: error };
    }
  }),
  seed: adminProcedure.mutation(async () => {
    await seed();
    return { status: "OK" };
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
