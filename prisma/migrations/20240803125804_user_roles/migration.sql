-- CreateEnum
CREATE TYPE "Role" AS ENUM ('GUEST', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'GUEST';
