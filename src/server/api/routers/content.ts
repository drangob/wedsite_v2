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
  imageId: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
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
            include: {
              image: true,
            },
          },
        },
      });

      // Map the content pieces to include imageUrl from the image
      if (content) {
        content.ContentPieces = content.ContentPieces.map((piece) => ({
          ...piece,
          imageUrl: piece.image?.url ?? null,
        }));
      }
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
      return ContentSchema.parse(newContent);
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
      const content = await db.content.findFirst({
        where: {
          slug: slug,
        },
      });
      return !!content;
    }),

  updateContentPiece: adminProcedure
    .input(ContentPieceSchema.omit({ order: true }))
    .mutation(async ({ input }) => {
      const { id, layout, ...rest } = input;
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
  getAllImages: adminProcedure.query(async () => {
    const images = await db.image.findMany();
    return images;
  }),
  createImage: adminProcedure.input(z.string()).mutation(async ({ input }) => {
    const image = await db.image.create({
      data: {
        url: input,
      },
    });
    return image;
  }),
});
