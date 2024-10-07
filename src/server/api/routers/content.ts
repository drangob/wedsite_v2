import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "@/server/api/trpc";
import { db } from "@/server/db";
import { Layout } from "@prisma/client";

const ContentPieceSchema = z.object({
  id: z.string(),
  html: z.string(),
  order: z.number(),
  layout: z.enum(["TEXT", "IMAGE_FIRST", "IMAGE_LAST"]),
  image: z.string().optional(),
});

const ContentSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  ContentPieces: z.array(ContentPieceSchema),
});

const GetContentBySlugInput = z.object({
  slug: z.string(),
});

export const contentRouter = createTRPCRouter({
  getAllContentInfo: publicProcedure.query(async () => {
    const content = await db.content.findMany({
      select: {
        slug: true,
        title: true,
        protected: true,
      },
    });
    const ContentInfoSchema = z.object({
      slug: z.string(),
      title: z.string(),
      protected: z.boolean(),
    });
    return ContentInfoSchema.array().parse(content);
  }),

  getContentBySlug: publicProcedure
    .input(GetContentBySlugInput)
    .query(async ({ input }) => {
      const content = await db.content.findFirst({
        where: {
          slug: input.slug,
        },
        include: {
          ContentPieces: {
            orderBy: { order: "asc" },
          },
        },
      });
      if (!content) {
        throw new Error("Content not found");
      }

      return ContentSchema.parse(content);
    }),

  createContent: adminProcedure
    .input(
      z.object({
        slug: z.string(),
        title: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const newContent = await db.content.create({
        data: {
          slug: input.slug,
          title: input.title,
          protected: false,
          ContentPieces: {
            create: [
              {
                html: "",
                order: 0,
                layout: "TEXT",
              },
            ],
          },
        },
        include: {
          ContentPieces: {
            orderBy: { order: "asc" },
          },
        },
      });
      console.log(newContent);
      return ContentSchema.parse(newContent);
    }),

  updateContent: adminProcedure
    .input(ContentSchema)
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      const updatedContent = await db.content.update({
        where: {
          id,
        },
        data: {
          ...rest,
        },
      });
      return ContentSchema.parse(updatedContent);
    }),

  deleteContent: adminProcedure
    .input(z.string())
    .mutation(async ({ input: slug }) => {
      await db.contentPiece.deleteMany({
        where: {
          content: {
            slug: slug,
          },
        },
      });
      await db.content.delete({
        where: {
          slug: slug,
          protected: false,
        },
      });
      return true;
    }),

  contentExists: publicProcedure
    .input(z.string())
    .query(async ({ input: slug }) => {
      console.log("input", slug);
      const content = await db.content.findFirst({
        where: {
          slug: slug,
        },
      });
      console.log("content", content);
      return !!content;
    }),

  updateContentPiece: adminProcedure
    .input(ContentPieceSchema.omit({ order: true }))
    .mutation(async ({ input }) => {
      console.log(input);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, image, layout, ...rest } = input;
      const layoutEnum = Layout[layout];
      if (!layoutEnum) {
        throw new Error(`Invalid layout value: ${input.layout}`);
      }

      await db.contentPiece.update({
        where: {
          id: id,
        },
        data: {
          ...rest,
          layout: layoutEnum,
        },
      });
      return { success: true };
    }),
  pushContentPiece: adminProcedure
    .input(z.object({ contentId: z.string() }))
    .mutation(async ({ input }) => {
      const content = await db.content.findUnique({
        where: {
          id: input.contentId,
        },
        include: {
          ContentPieces: {
            orderBy: { order: "asc" },
          },
        },
      });
      if (!content) {
        throw new Error("Content not found");
      }

      const newContentPiece = await db.contentPiece.create({
        data: {
          html: "",
          layout: "TEXT",
          order: content.ContentPieces.length,
          contentId: input.contentId,
        },
      });

      return ContentPieceSchema.parse(newContentPiece);
    }),
  popContentPiece: adminProcedure
    .input(z.object({ contentId: z.string() }))
    .mutation(async ({ input }) => {
      const content = await db.content.findUnique({
        where: {
          id: input.contentId,
        },
        include: {
          ContentPieces: {
            orderBy: { order: "asc" },
          },
        },
      });
      if (!content) {
        throw new Error("Content not found");
      }
      const contentPiece = content.ContentPieces.pop();
      await db.contentPiece.delete({
        where: {
          id: contentPiece!.id,
        },
      });
      return { success: true };
    }),
});
