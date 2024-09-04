-- CreateEnum
CREATE TYPE "Group" AS ENUM ('DAY', 'EVENING');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "group" "Group" NOT NULL DEFAULT 'DAY';
