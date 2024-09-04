/*
  Warnings:

  - You are about to drop the `Group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserGroups` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserGroups" DROP CONSTRAINT "UserGroups_groupId_fkey";

-- DropForeignKey
ALTER TABLE "UserGroups" DROP CONSTRAINT "UserGroups_userId_fkey";

-- DropTable
DROP TABLE "Group";

-- DropTable
DROP TABLE "UserGroups";
