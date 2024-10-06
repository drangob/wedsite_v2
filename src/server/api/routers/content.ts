import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "@/server/api/trpc";
import { db } from "@/server/db";

const ContentSchema = z.object({
  id: z.string(),
  slug: z.string(),
  html: z.string(),
});

const GetContentBySlugInput = z.object({
  slug: z.string(),
});

const ContentSlugInput = z.object({
  slug: z.string(),
});

const getUIDFromEmail = async (email: string | null | undefined) => {
  if (typeof email !== "string") {
    throw new Error("User email is not available");
  }
  const user = await db.user.findUnique({
    where: {
      email: email,
    },
    select: { id: true },
  });

  if (!user) {
    throw new Error("User not found");
  }
  return user.id;
};

export const contentRouter = createTRPCRouter({
  getAllContentSlugs: publicProcedure.query(async () => {
    const content = await db.content.findMany({
      select: {
        slug: true,
      },
    });
    return content.map((c) => c.slug);
  }),

  getContentBySlug: publicProcedure
    .input(GetContentBySlugInput)
    .query(async ({ input }) => {
      const content = await db.content.findFirst({
        where: {
          slug: input.slug,
        },
      });
      return ContentSchema.parse(content);
    }),

  createContent: adminProcedure
    .input(ContentSlugInput)
    .mutation(async ({ input, ctx }) => {
      const newContent = await db.content.create({
        data: {
          slug: input.slug,
          html: "",
          updatedByUserId: await getUIDFromEmail(ctx.session.user.email),
        },
      });
      return ContentSchema.parse(newContent);
    }),

  updateContent: adminProcedure
    .input(ContentSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...rest } = input;
      const updatedContent = await db.content.update({
        where: {
          id,
        },
        data: {
          ...rest,
          updatedByUserId: await getUIDFromEmail(ctx.session.user.email),
        },
      });
      return ContentSchema.parse(updatedContent);
    }),

  deleteContent: adminProcedure
    .input(ContentSlugInput)
    .mutation(async ({ input }) => {
      await db.content.delete({
        where: {
          slug: input.slug,
        },
      });
      return true;
    }),

  contentExists: publicProcedure
    .input(ContentSlugInput)
    .query(async ({ input }) => {
      const content = await db.content.findFirst({
        where: {
          slug: input.slug,
        },
      });
      return !!content;
    }),
});
