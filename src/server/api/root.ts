import {
  createCallerFactory,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";

import { userRouter } from "./routers/user";
import { contentRouter } from "./routers/content";
import { rsvpRouter } from "./routers/rsvp";
import { emailRouter } from "./routers/email";
import { spotifyRouter } from "./routers/spotify";

import { db } from "../db";

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
  spotify: spotifyRouter,
  healthcheck: publicProcedure.query(async () => {
    try {
      await db.$queryRaw`SELECT 1;`;
      return { status: "OK" };
    } catch (error) {
      console.error("Healthcheck failed:", error);
      return {
        status: "ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
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
