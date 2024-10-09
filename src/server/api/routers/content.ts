import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "@/server/api/trpc";
import { db } from "@/server/db";
import { Group, Layout } from "@prisma/client";

import { utapi } from "@/server/uploadthing";

const ContentPieceSchema = z.object({
  id: z.string(),
  html: z.string(),
  order: z.number(),
  layout: z.enum(["TEXT", "IMAGE_FIRST", "IMAGE_LAST"]),
  imageId: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  group: z.enum(Object.values(Group) as [Group, ...Group[]]).nullable(),
});

const ContentSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  protected: z.boolean(),
  ContentPieces: z.array(ContentPieceSchema),
  group: z.enum(Object.values(Group) as [Group, ...Group[]]).nullable(),
});

const GetContentBySlugInput = z.object({
  slug: z.string(),
});

const getGroupFilter = async (userid?: string) => {
  if (!userid) {
    return { group: null };
  }
  const user = await db.user.findUnique({
    where: {
      id: userid,
    },
    select: {
      group: true,
      role: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const { group } = user;
  const canAccessAllContent = user.role === "ADMIN";

  return canAccessAllContent ? {} : { OR: [{ group: group }, { group: null }] };
};

export const contentRouter = createTRPCRouter({
  getAllContentInfo: publicProcedure.query(async ({ ctx }) => {
    const groupFilter = await getGroupFilter(ctx.session?.user?.id);
    const content = await db.content.findMany({
      select: {
        slug: true,
        title: true,
        protected: true,
      },
      orderBy: {
        createdAt: "asc",
      },
      where: {
        ...groupFilter,
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
    .query(async ({ input, ctx }) => {
      const groupFilter = await getGroupFilter(ctx.session?.user?.id);
      const content = await db.content.findFirst({
        where: {
          slug: input.slug,
          ...groupFilter,
        },
        include: {
          ContentPieces: {
            where: {
              ...groupFilter,
            },
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
  updateContent: adminProcedure
    .input(ContentSchema.omit({ ContentPieces: true }))
    .mutation(async ({ input }) => {
      await db.content.update({
        where: {
          id: input.id,
        },
        data: {
          ...input,
        },
      });
      return { success: true };
    }),

  deleteImage: adminProcedure.input(z.string()).mutation(async ({ input }) => {
    const extractFileIdentifier = (url: string): string | null => {
      const regex = /\/f\/([a-zA-Z0-9]+)/;
      const match = url.match(regex);

      if (match?.[1]) {
        return match[1];
      }

      return null;
    };
    const deletedImage = await db.image.delete({
      where: {
        id: input,
      },
    });
    const fileIdentifier = extractFileIdentifier(deletedImage.url);
    if (!fileIdentifier) {
      throw new Error("Couldn't delete from uploadthing");
    }
    if (fileIdentifier) {
    }
    const result = await utapi.deleteFiles(fileIdentifier);
    console.log(result);
    if (!result.success) {
      throw new Error("Couldn't delete from uploadthing");
    }

    return { success: true };
  }),
});
