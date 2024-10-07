/*
  Warnings:

  - The values [IMAGE_FISRT] on the enum `Layout` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Layout_new" AS ENUM ('TEXT', 'IMAGE_FIRST', 'IMAGE_LAST');
ALTER TABLE "ContentPiece" ALTER COLUMN "layout" TYPE "Layout_new" USING ("layout"::text::"Layout_new");
ALTER TYPE "Layout" RENAME TO "Layout_old";
ALTER TYPE "Layout_new" RENAME TO "Layout";
DROP TYPE "Layout_old";
COMMIT;
