import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/server/db";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (!token) throw new UploadThingError("Unauthorized");
      const userEmail = token.email;

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userEmail: userEmail };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db.image.create({ data: { url: file.url } });

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userEmail };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
